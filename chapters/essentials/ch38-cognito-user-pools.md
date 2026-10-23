# Cognito User Pools: đăng nhập và JWT

## Khái niệm cần hiểu

User pool là kho người dùng và identity provider cho ứng dụng web/mobile. Nó hỗ trợ sign-up/sign-in, federation và phát hành tokens. Không cần tạo một IAM user cho mỗi khách hàng ứng dụng.

| Token | Mục đích |
|---|---|
| ID token | Thông tin danh tính/claims |
| Access token | Quyền truy cập theo scopes và ngữ cảnh API |
| Refresh token | Xin tokens mới theo chính sách và thời hạn |

## Cơ chế và quyết định cần thi

```text
User đăng nhập → Cognito → JWT → API Gateway authorizer → backend
```

JWT có hạn sử dụng. Backend/authorizer cần kiểm tra chữ ký, issuer, expiry và các claims cần thiết; decode được JSON không có nghĩa token đáng tin. JWT ký không đồng nghĩa nội dung đã mã hóa.

REST API Cognito authorizer có thể dùng ID hoặc access token tùy cấu hình; khi method yêu cầu OAuth scopes, dùng access token chứa scopes phù hợp. User pool token không trực tiếp là AWS access key để gọi S3.

Browser/mobile là public client, không giữ client secret an toàn như server. Chọn auth flow phù hợp như authorization code với PKCE. Token refresh phải được app thực hiện qua flow/SDK, không tự xảy ra chỉ vì token có tên refresh.

## Tình huống song ngữ

**EN:** Only registered users may access REST API resources. Tokens must expire and be renewable. Which solution fits?

**VI:** Chỉ user đăng ký được truy cập REST API. Token cần hết hạn và có thể cấp mới. Chọn gì?

| | EN | VI |
|---|---|---|
| A | Cognito user pool and authorizer | User pool và authorizer |
| B | An IAM user for every customer | IAM user cho mỗi khách |
| C | API key only | Chỉ API key |

### Đáp án và giải thích

**A.** Có user authentication và token lifecycle. B không phù hợp quản lý end-users quy mô ứng dụng; C quản lý usage, không thay login/token authorization.

## Tự kiểm tra

ID token khác access token ở mục đích nào? Tại sao decode JWT chưa đủ xác thực?

Nguồn: [User pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html), [API Gateway Cognito integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html).
