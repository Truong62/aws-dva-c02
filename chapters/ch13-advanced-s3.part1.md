# Chương 13: Advanced S3

> **Trọng tâm DVA-C02:** Chương này phủ nhóm câu hỏi "tối ưu" rất hay gặp trong domain Troubleshooting & Optimization: chọn lifecycle rule đúng để giảm chi phí, xử lý event notification khi object được upload, và tăng tốc upload/download (multipart, Transfer Acceleration, byte-range fetch). Đề thường cho tình huống "ứng dụng upload file lớn bị chậm/timeout", "cần trigger Lambda khi có file mới", hoặc "lọc dữ liệu CSV trong S3 mà không tải cả file về" — bạn phải chọn đúng cơ chế và biết giới hạn số liệu cụ thể (5GB, 5TB, 3.500/5.500 request/s per prefix, 128KB).

## Mục tiêu chương

- Thiết kế lifecycle rules chuyển storage class và expire object đúng quy tắc (thứ tự transition, minimum storage duration, object nhỏ hơn 128KB, abort multipart).
- Cấu hình S3 Event Notifications tới SNS/SQS/Lambda và hiểu khi nào nên chuyển sang EventBridge.
- Tối ưu performance: hiểu giới hạn request rate per prefix, dùng multipart upload đúng cách, Transfer Acceleration, byte-range fetches.
- Dùng S3 Select/Glacier Select để lọc dữ liệu phía server thay vì tải cả object về.
- Vận hành ở quy mô lớn: S3 Batch Operations, S3 Inventory, S3 Storage Lens.
- Hiểu Requester Pays và cơ chế checksum để đảm bảo toàn vẹn dữ liệu khi truyền.

## 13.1 Lifecycle Rules — tự động chuyển class và xoá object

Ở Chương 12 bạn đã biết các storage class và bài toán chi phí của chúng. Vấn đề thực tế: không ai ngồi gọi `CopyObject` để đổi class cho hàng triệu object bằng tay. **Lifecycle configuration** là tập rule gắn vào bucket, S3 chạy nền mỗi ngày (thường quanh nửa đêm UTC) để thực hiện hai loại action:

- **Transition actions:** chuyển object sang storage class khác sau N ngày kể từ khi tạo (hoặc kể từ khi trở thành noncurrent version).
- **Expiration actions:** xoá object (với versioned bucket là tạo delete marker), xoá noncurrent versions, xoá delete marker "mồ côi" (expired object delete markers), và **abort incomplete multipart uploads**.

### Quy tắc transition — chỗ đề thi hay gài

Transition chỉ đi "xuống" theo thứ tự waterfall, không đi ngược lên:

```
Standard → Standard-IA → Intelligent-Tiering → One Zone-IA
        → Glacier Instant Retrieval → Glacier Flexible Retrieval → Glacier Deep Archive
```

Muốn đưa object từ Glacier về Standard? Không có transition ngược — bạn phải **restore** (tạo bản copy tạm) rồi `CopyObject` sang class mới.

Các con số phải nhớ chính xác:

| Quy tắc | Số liệu |
|---|---|
| Tối thiểu ở Standard trước khi chuyển sang Standard-IA / One Zone-IA | **30 ngày** |
| Minimum storage duration: Standard-IA, One Zone-IA | 30 ngày (xoá sớm vẫn tính tiền đủ 30 ngày) |
| Minimum storage duration: Glacier Instant / Flexible Retrieval | 90 ngày |
| Minimum storage duration: Glacier Deep Archive | 180 ngày |
| Object < **128KB** | Mặc định KHÔNG được transition sang IA/Intelligent-Tiering (phí transition + phụ phí per-object đắt hơn tiền lưu trữ tiết kiệm được) |

Hệ quả của quy tắc 30 ngày: rule "chuyển sang Standard-IA sau 10 ngày" sẽ bị reject khi bạn PUT lifecycle configuration. Nhưng "chuyển thẳng sang Glacier sau 1 ngày" thì hợp lệ — Glacier không yêu cầu 30 ngày ở Standard trước.

### Lifecycle với versioning

Trên versioned bucket (Chương 12), lifecycle có thêm các action riêng cho noncurrent versions — đây là combo điển hình trong đề:

```json
{
  "Rules": [
    {
      "ID": "log-archive-rule",
      "Status": "Enabled",
      "Filter": { "Prefix": "logs/" },
      "Transitions": [
        { "Days": 30, "StorageClass": "STANDARD_IA" },
        { "Days": 90, "StorageClass": "GLACIER" }
      ],
      "NoncurrentVersionTransitions": [
        { "NoncurrentDays": 30, "StorageClass": "GLACIER" }
      ],
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 365,
        "NewerNoncurrentVersions": 5
      },
      "AbortIncompleteMultipartUpload": { "DaysAfterInitiation": 7 },
      "Expiration": { "ExpiredObjectDeleteMarker": false }
    }
  ]
}
```

Áp rule bằng CLI:

```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket my-app-logs \
  --lifecycle-configuration file://lifecycle.json

# Kiểm tra lại
aws s3api get-bucket-lifecycle-configuration --bucket my-app-logs
```

Vài điểm tinh tế:

- `Filter` có thể theo prefix, tag, kích thước object (`ObjectSizeGreaterThan`/`ObjectSizeLessThan`), hoặc kết hợp bằng `And`.
- `AbortIncompleteMultipartUpload` là rule "vệ sinh" nên bật cho MỌI bucket có upload lớn: các part của multipart upload bị bỏ dở vẫn **tính tiền lưu trữ** dù bạn không thấy chúng qua `ListObjects`. Chỉ thấy qua `aws s3api list-multipart-uploads`.
- Expiration trên versioned bucket KHÔNG xoá dữ liệu — nó chỉ thêm delete marker; dữ liệu thật chỉ mất khi `NoncurrentVersionExpiration` chạy.
- Lifecycle chạy theo batch hàng ngày, nên object có thể bị tính phí thêm tối đa ~1 ngày trước khi transition thực sự xảy ra; ngược lại, kể từ thời điểm đủ điều kiện expire, S3 **không tính tiền nữa** kể cả khi việc xoá vật lý diễn ra trễ.

> 💡 **Exam Tip:** Câu hỏi "company uploads large files, storage costs increasing but bucket looks empty / chi phí cao bất thường" → đáp án gần như chắc chắn là lifecycle rule **AbortIncompleteMultipartUpload**. Câu hỏi "giảm chi phí log: cần truy cập ngay trong 30 ngày, hiếm khi đọc trong 90 ngày, giữ 5 năm cho compliance" → Standard 30 ngày → Standard-IA → Glacier Deep Archive + Expiration sau 5 năm.

### S3 Analytics — Storage Class Analysis

Bạn không biết nên đặt mốc transition bao nhiêu ngày? **S3 Analytics (Storage Class Analysis)** theo dõi access pattern của object và xuất report CSV hàng ngày vào một bucket khác, gợi ý thời điểm nên chuyển từ **Standard sang Standard-IA**. Giới hạn quan trọng:

- Chỉ đưa khuyến nghị cho cặp **Standard → Standard-IA**. KHÔNG khuyến nghị One Zone-IA hay Glacier.
- Cần **24–48 giờ** sau khi bật mới có dữ liệu đầu tiên; cần chạy ~30 ngày để khuyến nghị đáng tin.
- Report có thể đổ vào Amazon QuickSight để visualize.

Đừng nhầm với **S3 Intelligent-Tiering** (Chương 12): Analytics chỉ *đề xuất* để bạn tự viết lifecycle rule; Intelligent-Tiering tự động *di chuyển* object giữa các tier dựa trên access pattern.

## 13.2 S3 Event Notifications

Use case kinh điển: user upload ảnh → tự động tạo thumbnail. S3 phát event khi có thay đổi trên object và đẩy tới đích xử lý. Có hai con đường.

### Đường 1 — Event notification truyền thống (SNS / SQS / Lambda)

Các loại event: `s3:ObjectCreated:*` (Put/Post/Copy/CompleteMultipartUpload), `s3:ObjectRemoved:*`, `s3:ObjectRestore:*`, `s3:Replication:*`, `s3:LifecycleTransition`, `s3:LifecycleExpiration`, `s3:ObjectTagging:*`... Mỗi rule lọc được theo **prefix** và **suffix** (ví dụ `images/` + `.jpg`).

Cấu hình:

```bash
aws s3api put-bucket-notification-configuration \
  --bucket my-upload-bucket \
  --notification-configuration '{
    "QueueConfigurations": [{
      "Id": "new-image-to-sqs",
      "QueueArn": "arn:aws:sqs:ap-southeast-1:123456789012:image-queue",
      "Events": ["s3:ObjectCreated:*"],
      "Filter": {
        "Key": {
          "FilterRules": [
            {"Name": "prefix", "Value": "images/"},
            {"Name": "suffix", "Value": ".jpg"}
          ]
        }
      }
    }]
  }'
```

**Bẫy số 1 — resource policy ở phía đích.** S3 không dùng IAM role của bạn để gửi event; service principal `s3.amazonaws.com` phải được cho phép trong **resource-based policy** của đích: `SQS:SendMessage` trên queue policy, `SNS:Publish` trên topic policy, `lambda:InvokeFunction` qua resource-based policy của function. Quên policy này → lệnh put-notification trả lỗi "Unable to validate the destination configuration". Nên thêm condition `aws:SourceArn` = ARN bucket để chống confused deputy.

**Bẫy số 2 — overlap rule.** Hai rule cùng event type không được có prefix/suffix chồng lấn nhau (ví dụ cùng `ObjectCreated` cho `images/` và `images/raw/`) — S3 reject toàn bộ configuration.

**Bẫy số 3 — không phải exactly-once.** Event được gửi "typically in seconds, sometimes a minute or longer", **at least once** — consumer phải idempotent. Đích SQS chỉ được là **standard queue**; SQS **FIFO không hỗ trợ** làm đích trực tiếp của S3 notification (muốn FIFO phải đi qua EventBridge).

### Đường 2 — EventBridge (khuyến nghị cho hệ mới)

Bật một công tắc trên bucket (`put-bucket-notification-configuration` với `EventBridgeConfiguration: {}`), mọi event của bucket sẽ đổ về **default event bus** của EventBridge. Lợi thế so với notification truyền thống:

| Tiêu chí | S3 Notifications | EventBridge |
|---|---|---|
| Đích | SNS, SQS (standard), Lambda | **18+ loại target**: Step Functions, Kinesis Streams/Firehose, SQS FIFO, API destinations... |
| Lọc | Chỉ prefix/suffix | **JSON pattern trên toàn bộ event**: object size, metadata, tên object phức tạp |
| Số đích cho 1 event | 1 đích / 1 rule | Nhiều rule, nhiều target song song |
| Replay | Không | **Archive & replay** events |
| Độ tin cậy | At least once | At least once + retry/DLQ của EventBridge |
| Chi phí | Miễn phí | Tính phí theo event (rẻ) |

Chi tiết về rules, event pattern và input transformation ở Chương 25.

> 💡 **Exam Tip:** Tình huống "cần gửi event S3 tới NHIỀU đích" hoặc "lọc theo object size / metadata" hoặc "replay lại event đã qua" → chọn **EventBridge**. Tình huống đơn giản "trigger Lambda khi có file .csv trong prefix uploads/" → notification truyền thống là đủ và là đáp án "ít công cấu hình nhất".

Lưu ý lịch sử hay bị hỏi: trên bucket không bật versioning, nếu hai bản ghi cùng key được PUT gần như đồng thời, có thể chỉ một event được gửi. AWS khuyến nghị **bật versioning** để đảm bảo mỗi lần ghi thành công sinh đúng một event với version ID riêng.

## 13.3 Performance: prefix, multipart, Transfer Acceleration, byte-range

### Request rate per prefix

S3 tự động scale tới ít nhất **3.500 PUT/COPY/POST/DELETE** và **5.500 GET/HEAD request mỗi giây cho MỖI prefix** trong bucket. Số prefix không giới hạn, nên throughput tổng = số prefix × giới hạn trên. Ví dụ đọc song song từ 4 prefix `logs/2026/06/12/a/`, `…/b/`, `…/c/`, `…/d/` → lý thuyết đạt 22.000 GET/s.

"Prefix" ở đây là phần đường dẫn giữa tên bucket và tên file: object `bucket/folder1/sub1/file.txt` có prefix `folder1/sub1/`. Ngày xưa phải random hoá ký tự đầu của key để tránh hot partition — quy tắc đó **đã lỗi thời**, nhưng tư duy "rải key ra nhiều prefix khi cần throughput cực cao" vẫn đúng. Khi vượt rate, S3 trả **HTTP 503 Slow Down** — SDK tự retry với exponential backoff (Chương 3); nếu bị đều đặn, hãy rải key ra nhiều prefix hơn.

Một lưu ý liên quan KMS: nếu object mã hoá SSE-KMS, mỗi upload/download gọi thêm KMS API và chịu quota riêng của KMS (chi tiết ở Chương 14 và 46) — đôi khi nghẽn ở KMS chứ không phải S3.

### Multipart upload — cơ chế và số liệu

Multipart chia file thành nhiều part upload **song song và độc lập**, part lỗi chỉ cần retry part đó. Ba con số bắt buộc thuộc lòng:

- **Khuyến nghị** dùng khi file > **100MB**; **bắt buộc** khi file > **5GB** (giới hạn của single PUT); object tối đa **5TB**.
- Mỗi upload tối đa **10.000 parts**; part size từ **5MB đến 5GB** (part cuối được nhỏ hơn 5MB).
- Vì 10.000 × part size ≥ file size, file 5TB cần part tối thiểu ~525MB.

Flow API gồm 3 bước: `CreateMultipartUpload` (nhận `UploadId`) → `UploadPart` lặp song song (mỗi part trả ETag) → `CompleteMultipartUpload` (gửi danh sách part + ETag để S3 ghép). Có thể `AbortMultipartUpload` để huỷ và xoá part đã upload.

Với SDK JS v3, đừng tự viết flow — dùng `@aws-sdk/lib-storage` lo hết việc chia part, song song hoá và retry:

```javascript
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "node:fs";

const s3 = new S3Client({ region: "ap-southeast-1" });

const upload = new Upload({
  client: s3,
  params: {
    Bucket: "my-video-bucket",
    Key: "raw/movie-4k.mp4",
    Body: createReadStream("./movie-4k.mp4"),
  },
  queueSize: 4,                 // 4 part upload song song
  partSize: 50 * 1024 * 1024,   // 50MB mỗi part (>= 5MB)
  leavePartsOnError: false,     // tự abort nếu lỗi, tránh part rác tính tiền
});

upload.on("httpUploadProgress", (p) => {
  console.log(`Đã upload ${p.loaded}/${p.total} bytes`); // theo dõi tiến độ
});

await upload.done();
```

CLI v2 (`aws s3 cp`) tự động chuyển sang multipart khi file vượt `multipart_threshold` (mặc định 8MB) — đây là lý do `aws s3 cp` upload được file 50GB còn `aws s3api put-object` thì không. Go SDK v2 có tương đương là `feature/s3/manager` với `manager.NewUploader(client)` — cùng cơ chế.

### S3 Transfer Acceleration

Bài toán: client ở xa region của bucket (user Việt Nam upload lên bucket `us-east-1`), kết nối public internet đường dài chậm và không ổn định. **Transfer Acceleration** cho client gửi dữ liệu tới **edge location** CloudFront gần nhất, từ đó dữ liệu chạy trên **mạng backbone riêng của AWS** về bucket. Bật ở mức bucket:

```bash
aws s3api put-bucket-accelerate-configuration \
  --bucket my-global-bucket \
  --accelerate-configuration Status=Enabled

# Client dùng endpoint riêng:
# my-global-bucket.s3-accelerate.amazonaws.com
aws s3 cp big.zip s3://my-global-bucket/ --endpoint-url https://s3-accelerate.amazonaws.com
```

Với SDK JS v3: `new S3Client({ useAccelerateEndpoint: true })`. Lưu ý:

- Tên bucket phải **DNS-compliant và không chứa dấu chấm** (vì nhúng vào hostname).
- Tính thêm phí per-GB, nhưng AWS **chỉ tính khi thực sự nhanh hơn** đường thường (Speed Comparison tool có sẵn để đo).
- Kết hợp tốt với multipart: multipart giải quyết song song hoá, Transfer Acceleration giải quyết quãng đường — câu trả lời đúng cho "upload file lớn từ nhiều nơi trên thế giới" thường là **cả hai**.

### Byte-range fetches

GET với header `Range: bytes=0-1048575` chỉ tải về dải byte chỉ định. Hai use case:

1. **Tăng tốc download:** chạy nhiều GET song song, mỗi GET một dải — chính là "multipart download". Nếu một dải lỗi, chỉ retry dải đó → tăng resilience.
2. **Đọc một phần object:** ví dụ chỉ cần header 256 byte đầu của file binary để xác định loại file, không tải cả 2GB.

```javascript
import { GetObjectCommand } from "@aws-sdk/client-s3";

// Chỉ lấy 1MB đầu tiên của object
const res = await s3.send(new GetObjectCommand({
  Bucket: "my-video-bucket",
  Key: "raw/movie-4k.mp4",
  Range: "bytes=0-1048575",
}));
```

> 💡 **Exam Tip:** Phân biệt 3 đáp án tối ưu hay đứng cạnh nhau: upload chậm vì file lớn → **multipart upload**; upload chậm vì client ở xa region → **Transfer Acceleration**; download chậm / chỉ cần một phần file → **byte-range fetches**. Đề hay ghép 2 trong 3 vào cùng câu hỏi để bạn chọn combo đúng.

## 13.4 S3 Select & Glacier Select — lọc dữ liệu phía server

Bài toán: bạn có file CSV/JSON/Parquet 1GB trong S3 nhưng chỉ cần vài cột và vài dòng thoả điều kiện. Cách "ngây thơ" là GET cả object 1GB về app rồi parse — tốn băng thông, tốn RAM, chậm. **S3 Select** cho phép gửi một câu **SQL đơn giản** lên S3, S3 chạy filter ngay trên server và **chỉ trả về phần dữ liệu khớp** — giảm tới ~80% dữ liệu truyền và tăng tốc đáng kể.

Đặc điểm và giới hạn:

- Input: **CSV, JSON, hoặc Apache Parquet**; có thể nén GZIP/BZIP2 (với CSV/JSON).
- Output: CSV hoặc JSON.
- Hoạt động trên **một object duy nhất** mỗi lần gọi (không JOIN nhiều object, không aggregate phức tạp kiểu GROUP BY trên nhiều file).
- API là `SelectObjectContent`, kết quả trả về dạng **event stream** (streaming records).

```javascript
import { S3Client, SelectObjectContentCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "ap-southeast-1" });

const command = new SelectObjectContentCommand({
  Bucket: "analytics-data",
  Key: "sales/2026-q2.csv",
  ExpressionType: "SQL",
  Expression: "SELECT s.product, s.amount FROM S3Object s WHERE s.region = 'APAC'",
  InputSerialization: { CSV: { FileHeaderInfo: "USE" }, CompressionType: "NONE" },
  OutputSerialization: { CSV: {} },
});

const { Payload } = await s3.send(command);
for await (const event of Payload) {
  if (event.Records) process.stdout.write(event.Records.Payload); // chunk kết quả
}
```

**Glacier Select** là cơ chế tương tự nhưng chạy query trực tiếp trên dữ liệu đã archive ở Glacier mà không cần restore toàn bộ object trước — phù hợp tình huống "thỉnh thoảng cần lọc vài bản ghi trong archive lớn cho audit".

> 💡 **Exam Tip:** Từ khoá nhận diện S3 Select: "retrieve a subset of data", "using simple SQL", "without retrieving the entire object", "reduce data transfer / cost". Nếu câu hỏi cần **JOIN, aggregate phức tạp, query nhiều file, partitioning** → đó là **Amazon Athena** (Chương 48), KHÔNG phải S3 Select. S3 Select = một object, filter đơn giản; Athena = data lake, SQL đầy đủ trên hàng nghìn file.

## 13.5 S3 Batch Operations — thao tác hàng loạt triệu object

Bạn cần copy 50 triệu object sang bucket khác, hoặc đổi storage class, hoặc thêm tag, hoặc gọi một Lambda xử lý từng object. Viết script lặp `ListObjects` rồi gọi API tuần tự sẽ chạy nhiều ngày và phải tự lo retry/checkpoint. **S3 Batch Operations** làm việc đó ở quy mô lớn, có quản lý: bạn định nghĩa một **Job** gồm danh sách object + một action, S3 chạy song song, retry tự động, sinh **completion report** và **theo dõi tiến độ**.

Các action hỗ trợ:

- **PUT copy** (copy object, kể cả cross-region/cross-account).
- **Replace all object tags / Delete all object tags.**
- **Replace access control list (ACL).**
- **Restore** object từ Glacier (initiate restore hàng loạt).
- **Invoke AWS Lambda function** — xử lý tuỳ ý từng object (resize ảnh, re-encrypt, validate...).
- **Object Lock retention / legal hold.**

Đầu vào danh sách object lấy từ một trong hai nguồn: **S3 Inventory report** (xem 13.6) hoặc một **CSV manifest** bạn tự cung cấp (gồm cột bucket, key, optional version ID).

```bash
aws s3control create-job \
  --account-id 123456789012 \
  --operation '{"S3PutObjectCopy":{"TargetResource":"arn:aws:s3:::dest-bucket"}}' \
  --manifest '{
    "Spec": {"Format":"S3BatchOperations_CSV_20180820","Fields":["Bucket","Key"]},
    "Location": {"ObjectArn":"arn:aws:s3:::manifest-bucket/manifest.csv",
                 "ETag":"<etag-cua-manifest>"}
  }' \
  --report '{"Bucket":"arn:aws:s3:::report-bucket","Format":"Report_CSV_20180820",
             "Enabled":true,"Prefix":"batch-reports","ReportScope":"AllTasks"}' \
  --priority 10 \
  --role-arn arn:aws:iam::123456789012:role/S3BatchRole \
  --region ap-southeast-1 \
  --no-confirmation-required
```

Điểm cần nhớ: Batch Operations cần một **IAM role** để S3 thay mặt bạn thao tác lên object; job được tạo ở trạng thái cần **confirm** (trừ khi `--no-confirmation-required`); có thể đặt **priority** để xếp thứ tự nhiều job; report ghi rõ object nào fail và vì sao.

> 💡 **Exam Tip:** "Process / re-encrypt / copy millions of existing objects" hoặc "apply a Lambda function to all objects in a bucket" → **S3 Batch Operations** (lấy danh sách từ S3 Inventory). Đừng nhầm với **Event Notifications** — notification chỉ trigger cho object **mới phát sinh sự kiện**, không xử lý được object đã có sẵn từ trước. Batch Operations mới là công cụ cho "existing objects".

## 13.6 S3 Inventory — kiểm kê object định kỳ

`ListObjectsV2` ổn cho bucket vài nghìn object, nhưng với hàng trăm triệu object thì paginate qua API tốn thời gian và tiền request. **S3 Inventory** cho S3 tự xuất một **file danh sách (flat file)** định kỳ — **hàng ngày hoặc hàng tuần** — vào một bucket đích, liệt kê object và metadata của chúng.

- Định dạng output: **CSV, Apache ORC, hoặc Apache Parquet**.
- Trường có thể chọn: size, last modified, **storage class**, **ETag**, **encryption status**, **replication status**, version ID, multipart upload flag, object lock... — rất tiện để audit "có bao nhiêu object chưa mã hoá", "bao nhiêu object còn ở Standard".
- Phạm vi: cả bucket hoặc lọc theo prefix; bao gồm current version hoặc cả noncurrent versions.
- Có thể query trực tiếp inventory report bằng **Athena**.

Quan hệ với Batch Operations rất chặt: inventory report chính là **manifest đầu vào** lý tưởng cho một Batch Operations job. Quy trình kinh điển: Inventory liệt kê toàn bộ object chưa mã hoá → Batch Operations gọi PUT copy/Lambda để re-encrypt chúng.

```bash
aws s3api put-bucket-inventory-configuration \
  --bucket source-bucket \
  --id daily-inventory \
  --inventory-configuration '{
    "Destination": {"S3BucketDestination": {
      "Bucket":"arn:aws:s3:::inventory-dest","Format":"Parquet"}},
    "IsEnabled": true,
    "IncludedObjectVersions": "Current",
    "Schedule": {"Frequency": "Daily"},
    "OptionalFields": ["Size","StorageClass","EncryptionStatus","ETag"]
  }'
```

> 💡 **Exam Tip:** "Audit which objects are encrypted / which storage class / report on all objects regularly" → **S3 Inventory**. Cần thao tác lên kết quả audit đó → nối với **S3 Batch Operations**. Cần thống kê/visualize usage tổng hợp toàn tổ chức → **S3 Storage Lens** (mục 13.7) — đừng nhầm Inventory (danh sách object) với Storage Lens (analytics tổng hợp).

## 13.7 S3 Storage Lens — phân tích usage toàn tổ chức

**S3 Storage Lens** là công cụ analytics cho toàn bộ S3 ở mức **organization / account / region / bucket / prefix**: trả lời các câu "tổng dung lượng đang dùng là bao nhiêu", "bucket nào tăng nhanh nhất", "bao nhiêu % object chưa bật encryption", "incomplete multipart uploads đang chiếm bao nhiêu", "object nào không được truy cập lâu ngày". Nó tổng hợp ~30 metric và đưa **khuyến nghị tối ưu chi phí và bảo mật**.

- Có một **default dashboard** miễn phí (free metrics) cho mỗi account, dữ liệu giữ **14 ngày**.
- Bật **advanced metrics & recommendations** (tính phí) để có thêm metric (activity, prefix-level, status code) và giữ dữ liệu **15 tháng**.
- Tích hợp **AWS Organizations** để xem toàn bộ account trong org từ một dashboard duy nhất.
- Xuất metric hàng ngày ra một bucket (CSV/Parquet) để phân tích bằng Athena/QuickSight.

Phân biệt nhanh bộ ba dễ lẫn trong đề:

| Công cụ | Trả lời câu gì | Output |
|---|---|---|
| **S3 Analytics (Storage Class Analysis)** | "Object này nên chuyển Standard → Standard-IA khi nào?" | Report theo bucket/prefix, gợi ý ngày transition |
| **S3 Inventory** | "Liệt kê tất cả object + metadata (encryption, class, ETag)" | Flat file CSV/Parquet danh sách object |
| **S3 Storage Lens** | "Bức tranh tổng hợp usage & activity toàn org, khuyến nghị tối ưu" | Dashboard + metric export, 30 metric |

> 💡 **Exam Tip:** "Organization-wide visibility into storage usage and activity / cost optimization recommendations across all accounts" → **S3 Storage Lens**. "Recommend when to move objects to IA" (chỉ một cặp class, mức bucket) → **S3 Analytics**. Nhớ Storage Lens là duy nhất nhìn xuyên **toàn bộ AWS Organizations**.

## 13.8 Requester Pays & Checksums

### Requester Pays

Mặc định **chủ bucket** trả phí lưu trữ lẫn phí request và data transfer. Khi bạn chia sẻ một dataset lớn cho nhiều bên tải về, hoá đơn transfer có thể khổng lồ. Bật **Requester Pays** trên bucket: chủ bucket vẫn trả phí lưu trữ, nhưng **người gọi request trả phí request + data transfer**.

```bash
aws s3api put-bucket-request-payment \
  --bucket public-dataset \
  --request-payment-configuration Payer=Requester
```

Quy tắc thi cần nhớ:

- Người request **bắt buộc phải được authenticate** (không cho phép anonymous) và phải kèm header `x-amz-request-payer: requester` trong mọi request, nếu không sẽ nhận **403 Access Denied**. Với CLI: thêm `--request-payer requester`.
- Người request cần IAM permission từ tài khoản của họ và bucket policy của chủ phải cho phép họ truy cập.

> 💡 **Exam Tip:** "Share a large dataset but the bucket owner does not want to pay for download/transfer costs" → **Requester Pays**. Nhớ caller phải authenticated và gửi header `x-amz-request-payer`.

### Checksums — toàn vẹn dữ liệu khi truyền

Mạng có thể làm hỏng vài bit khi truyền. S3 hỗ trợ **checksum** để xác minh object nhận được đúng như object gửi đi (end-to-end integrity). Khi PUT, client tính checksum và gửi kèm; S3 tính lại phía server, **không khớp thì từ chối** ghi.

- Thuật toán hỗ trợ: **CRC32, CRC32C, SHA-1, SHA-256** (chọn qua header `x-amz-checksum-algorithm` hoặc tham số SDK `ChecksumAlgorithm`). CRC nhanh, dùng cho integrity; SHA dùng khi cần độ mạnh mật mã.
- Ngoài ra mọi object luôn có **ETag**: với single-part PUT (không mã hoá SSE-KMS/SSE-C), ETag là **MD5** của nội dung — có thể dùng để verify nhanh. Nhưng với **multipart upload**, ETag KHÔNG phải MD5 của cả file mà là hash của tập checksum các part kèm hậu tố `-<số part>` (ví dụ `...-4`) → đừng dùng ETag để so MD5 cho file multipart.

```bash
# Yêu cầu S3 tính & lưu checksum SHA-256 khi upload
aws s3api put-object --bucket my-bucket --key data.bin \
  --body data.bin --checksum-algorithm SHA256
```

```javascript
import { PutObjectCommand } from "@aws-sdk/client-s3";

await s3.send(new PutObjectCommand({
  Bucket: "my-bucket",
  Key: "data.bin",
  Body: fileBuffer,
  ChecksumAlgorithm: "CRC32C", // S3 verify integrity, từ chối nếu lệch
}));
```

> 💡 **Exam Tip:** "Ensure data integrity of uploaded objects / verify the object was not corrupted in transit" → dùng **checksum** (CRC32C/SHA-256) khi PutObject; S3 sẽ reject nếu checksum không khớp. Nhớ rằng **ETag của object multipart không phải MD5** của cả file — đây là cái bẫy hay gặp khi code tự verify integrity.
