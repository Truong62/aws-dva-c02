# API Gateway nâng cao: auth, usage plans và chẩn đoán

## Khái niệm cần hiểu

**Authentication** xác định người gọi; **authorization** cho phép tài nguyên/hành động; **API key/usage plan** quản lý usage và throttling. API key không phải cơ chế authentication/authorization thay cho IAM/Cognito/authorizer.

## Cơ chế và quyết định cần thi

| Nhu cầu | Cấu hình |
|---|---|
| Caller dùng AWS credentials | IAM authorization, SigV4 |
| Người dùng đăng nhập và mang JWT | Cognito user pool authorizer cho REST API |
| Logic xác thực tùy chỉnh | Lambda authorizer |
| Key mới dùng được API yêu cầu key | Gắn key vào usage plan có API stage phù hợp |
| Browser gọi khác origin | CORS phù hợp; CORS không cấp IAM quyền |

Tạo key bằng `CreateApiKey` chưa đủ; `CreateUsagePlanKey` liên kết key với plan. Quota/throttling của usage plans không phải hàng rào bảo mật hay bảo đảm giới hạn cứng tuyệt đối.

WebSocket dùng REQUEST Lambda authorizer ở **`$connect`**. Không suy luận rằng mỗi message đều gọi authorizer hoặc có REST-style TTL cache. Dùng context và logic ứng dụng để kiểm soát quyền phù hợp trong thời gian kết nối.

**502** có thể do Lambda lỗi/response malformed; **504** thường là integration timeout; **429** là throttling; **401/403** liên quan auth hoặc policy/key tùy trường hợp. Mã lỗi là dấu hiệu, phải xác nhận bằng logs.

Regional/private REST API có thể tăng integration timeout vượt mặc định 29 giây theo quota; HTTP API và WebSocket có giới hạn riêng. Không chọn đáp án chỉ dựa vào câu thuộc lòng “API Gateway luôn tối đa 29 giây”.

## Tình huống song ngữ

**EN:** Newly created API keys receive 403 while existing keys work. The new keys have not been associated with a usage plan. What is missing?

**VI:** Key mới nhận 403 còn key cũ hoạt động. Key mới chưa gắn usage plan. Thiếu bước nào?

| | EN | VI |
|---|---|---|
| A | CreateUsagePlanKey | Liên kết key với usage plan |
| B | Redeploy Lambda code | Deploy lại code Lambda |
| C | Invalidate CloudFront | Invalidate CloudFront |

### Đáp án và giải thích

**A.** Cần plan chứa stage đúng, key được bật và method yêu cầu key được cấu hình. B/C không tạo liên kết đó.

## Tự kiểm tra

API key hợp lệ có thay được token đăng nhập không? WebSocket authorizer chạy ở route nào?

Nguồn: [Usage plans](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html), [WebSocket authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api-lambda-auth.html), [Timeout update](https://aws.amazon.com/about-aws/whats-new/2024/06/amazon-api-gateway-integration-timeout-limit-29-seconds/).
