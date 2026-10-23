# S3: bucket, object và truy cập dữ liệu

## Khái niệm cần hiểu

S3 lưu **object** trong **bucket**. Object được nhận diện bởi **key**, ví dụ `reports/2026/result.pdf`; dấu `/` tạo prefix trong key, không phải thư mục filesystem thật. Metadata mô tả object, còn tags hỗ trợ phân loại/chính sách.

## Cơ chế và quyết định cần thi

Ứng dụng gọi `PutObject` để ghi, `GetObject` để đọc; IAM phân biệt quyền bucket như `ListBucket` và quyền object như `GetObject`. ARN bucket và ARN object không thay thế cho nhau.

S3 cung cấp strong read-after-write consistency cho các thao tác object được hỗ trợ. Nhưng CloudFront/browser cache có thể vẫn trả bản cũ; đừng quy mọi stale response cho S3 eventual consistency.

**Versioning** giữ nhiều phiên bản cùng key. Ghi đè tạo version mới; xóa không chỉ định version ID thường tạo delete marker. Muốn xóa vĩnh viễn phải xét từng version. **Multipart upload** chia tệp lớn thành parts để retry riêng; phải complete hoặc abort để tránh để lại parts chưa hoàn tất.

S3 phù hợp lưu video Lambda tạo ra rồi đưa URL tải cho khách. Không lưu output cần giữ lâu chỉ trong memory hoặc `/tmp` của compute.

## Tình huống song ngữ

**EN:** A Lambda-generated video must be downloadable after the function has finished. Which storage is appropriate?

**VI:** Video do Lambda tạo phải tải được sau khi function kết thúc. Lưu ở đâu?

| | EN | VI |
|---|---|---|
| A | Lambda memory | Memory Lambda |
| B | An S3 object | Object S3 |
| C | Only Lambda /tmp | Chỉ trong /tmp Lambda |

### Đáp án và giải thích

**B.** Object sống độc lập với execution environment. Có thể cấp truy cập có thời hạn bằng presigned URL; thời hạn thực tế còn phụ thuộc credentials dùng ký, xem [S3 Security](/chuong/14/).

## Tự kiểm tra

Vì sao đọc object được nhưng list bucket bị AccessDenied? Xóa key trong bucket versioned có chắc xóa dữ liệu vĩnh viễn không?

Nguồn: [S3 data consistency](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html#ConsistencyModel), [Versioning](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Versioning.html).
