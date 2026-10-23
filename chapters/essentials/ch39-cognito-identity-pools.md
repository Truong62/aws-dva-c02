# Cognito Identity Pools: đổi danh tính thành AWS credentials

## Khái niệm cần hiểu

Identity pool nhận danh tính từ provider được hỗ trợ rồi cấp **temporary AWS credentials** thông qua IAM roles. Có thể dùng user pool làm provider; hai loại pool không phải hai tên cho cùng dịch vụ.

## Cơ chế và quyết định cần thi

| | User pool | Identity pool |
|---|---|---|
| Kết quả chính | JWT tokens | AWS access key, secret, session token tạm |
| Nhu cầu điển hình | Đăng nhập ứng dụng/API | Gọi AWS services bằng quyền IAM |
| Quyền | Claims/scopes và backend authorization | Role policies, có thể giới hạn theo identity |

Luồng ví dụ: user đăng nhập user pool → gửi token tới identity pool → nhận credentials theo role → SDK ký S3 request. Credentials nằm trên client phải có phạm vi hẹp, không cấp admin chỉ vì credentials là tạm.

Guest/unauthenticated access là lựa chọn cấu hình, không mặc định có quyền mọi dữ liệu. Khi cho upload trực tiếp, giới hạn prefix/object/action phù hợp. Cũng có thể cấp presigned URL từ backend nếu chỉ cần thao tác cụ thể; identity pool không bắt buộc trong mọi app có S3.

Cognito Sync là khái niệm cũ về đồng bộ datasets; không đánh đồng với identity pool hoặc GraphQL subscriptions. Trọng tâm cần nắm ở đây là federation và temporary credentials.

## Tình huống song ngữ

**EN:** Signed-in mobile users need temporary AWS credentials to upload to their own S3 prefixes. Which service fits?

**VI:** User mobile đã đăng nhập cần AWS credentials tạm để upload vào prefix S3 riêng. Dùng gì?

| | EN | VI |
|---|---|---|
| A | Cognito identity pool with restricted IAM roles | Identity pool với IAM roles giới hạn |
| B | A shared IAM administrator key | Key IAM admin dùng chung |
| C | A CloudWatch dashboard | Dashboard CloudWatch |

### Đáp án và giải thích

**A.** Federation cấp credentials theo quyền được thiết kế. B trao quá nhiều quyền và dùng secret dài hạn; C không cấp danh tính/quyền.

## Tự kiểm tra

Nếu chỉ gọi API Gateway dùng JWT, có bắt buộc identity pool không? Credentials tạm có tự động least privilege không?

Nguồn: [Identity pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-identity.html).
