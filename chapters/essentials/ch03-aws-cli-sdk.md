# CLI và SDK: ứng dụng gọi AWS thế nào?

## Khái niệm cần hiểu

**AWS CLI** gọi API từ terminal; **AWS SDK** gọi API từ code. Console, CLI và SDK đều cần quyền IAM. SDK giúp tìm credentials, ký request, xử lý pagination và retry một số lỗi.

**Credentials** chứng minh caller là ai. Credentials tạm thời gồm access key ID, secret access key và session token. **Profile** là cấu hình lựa chọn account/role/Region; profile không tự cấp quyền.

## Cơ chế và điểm cần thi

Ứng dụng dùng credential provider chain để tìm credentials. Credentials được cấu hình trực tiếp, biến môi trường hoặc profile có thể được ưu tiên trước role của compute. Thứ tự cụ thể phụ thuộc CLI/SDK và cấu hình. Vì vậy, hãy xác định caller thay vì giả định “chạy trên EC2 thì chắc chắn dùng role EC2”.

```bash
aws sts get-caller-identity
```

Lệnh trên kiểm tra caller của CLI đang dùng. Nếu ứng dụng có cấu hình SDK riêng, phải kiểm tra bằng cùng cấu hình đó. Không in secret key vào logs.

- **SigV4** ký request; credentials tạm cần cả session token. Sai Region, token hết hạn hoặc lệch thời gian có thể khiến request bị từ chối.
- **Pagination**: một response chưa chắc chứa toàn bộ kết quả. Dùng paginator/token để đọc tiếp.
- **Retry với backoff và jitter**: phù hợp lỗi tạm thời/throttling; không sửa được quyền thiếu hay payload không hợp lệ.
- **Idempotency**: retry request ghi phải tránh tạo hai đơn hàng hoặc trừ tiền hai lần.
- **Waiter**: chờ tài nguyên đạt trạng thái như available; khác việc retry một request bị lỗi.

## Tình huống song ngữ

**EN:** An EC2 role denies S3 access, but the SDK selects administrative credentials from a shared credentials file. Which identity determines the request's permissions?

**VI:** Role EC2 cấm S3, nhưng SDK chọn admin credentials trong file. Quyền của request được đánh giá theo danh tính nào?

| | EN | VI |
|---|---|---|
| A | The identity selected by the SDK | Danh tính SDK đã chọn |
| B | Always the EC2 role | Luôn là role EC2 |
| C | Both identities combined | Gộp quyền của cả hai danh tính |

### Đáp án và giải thích

**A.** Request chỉ dùng bộ credentials đã được chọn để ký. Các giới hạn áp dụng cho identity đó vẫn có hiệu lực; role không được dùng không tự bổ sung Deny.

## Tự kiểm tra

Phân biệt retry, pagination và waiter bằng ba ví dụ. Khi gặp AccessDenied, hãy kiểm tra caller, action, resource và policy trước khi tăng số lần retry.

Nguồn: [CLI credential precedence](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html), [SDK retry behavior](https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html).
