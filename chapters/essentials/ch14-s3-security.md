# S3 Security: quyền, HTTPS, encryption và URL tạm

## Khái niệm cần hiểu

**In transit** là dữ liệu đang truyền; **at rest** là dữ liệu lưu trên storage. HTTPS bảo vệ đường truyền; mã hóa object bảo vệ dữ liệu lưu. Block Public Access kiểm soát truy cập public, không phải công tắc buộc HTTPS.

## Cơ chế và quyết định cần thi

| Nhu cầu | Cơ chế |
|---|---|
| Chặn HTTP | Bucket policy Deny khi `aws:SecureTransport` là false |
| S3 thực hiện mã hóa bằng KMS | SSE-KMS |
| Ứng dụng mã hóa trước khi gửi | Client-side encryption |
| Cấp quyền tải object có thời hạn | Presigned URL |

Bucket policy gắn vào bucket, IAM policy gắn vào identity. Muốn đọc SSE-KMS object có thể cần cả `s3:GetObject` và `kms:Decrypt`, cùng key policy phù hợp. Một Allow S3 không vượt qua Deny áp dụng hoặc thiếu quyền KMS.

**Client-side encryption không phải SSE-KMS.** Header `x-amz-server-side-encryption: aws:kms` yêu cầu S3 mã hóa phía server. Nếu đề nói mã hóa trước upload, app phải thực hiện phía client, thường theo envelope encryption.

Presigned URL dùng quyền của principal tạo URL. Nó hết hiệu lực khi tới hạn URL **hoặc credentials hết hạn/bị thu hồi**, tùy cái nào xảy ra trước. Lambda ký URL “3 giờ” bằng credentials chỉ còn 1 giờ không bảo đảm tải trong 3 giờ. Không giải quyết bằng cách nhúng key dài hạn vào function; thiết kế thời hạn credentials/URL hoặc cơ chế cấp lại URL phù hợp.

## Tình huống song ngữ

**EN:** A bucket must reject unencrypted HTTP requests. Which configuration enforces this?

**VI:** Bucket phải từ chối request HTTP không mã hóa. Cấu hình nào thực thi yêu cầu này?

| | EN | VI |
|---|---|---|
| A | Block Public Access only | Chỉ Block Public Access |
| B | Deny when aws:SecureTransport is false | Deny khi aws:SecureTransport là false |
| C | Enable versioning | Bật versioning |

### Đáp án và giải thích

**B.** Condition kiểm tra transport. A hạn chế quyền public; C giữ phiên bản object. Khi viết policy thực tế, xét các lời gọi service-to-service và phạm vi principal phù hợp.

## Tự kiểm tra

Một bucket private có chắc chỉ nhận HTTPS không? SSE-KMS khác app tự mã hóa trước upload ở đâu?

Nguồn: [S3 policy condition keys](https://docs.aws.amazon.com/AmazonS3/latest/userguide/amazon-s3-policy-keys.html), [Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html).
