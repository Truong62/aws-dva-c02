# API Gateway: nối HTTP request với backend

## Khái niệm cần hiểu

API Gateway tiếp nhận request, áp dụng xác thực/giới hạn và gọi backend. **Resource** là đường dẫn như `/orders`; **method** là `GET` hoặc `POST`; **integration** quy định cách gọi backend; **deployment** là bản chụp cấu hình API; **stage** như `test`/`prod` trỏ tới deployment.

Lambda chạy nghiệp vụ, còn API Gateway xử lý giao diện HTTP. Hai bên phải thống nhất cấu trúc dữ liệu qua lại.

```text
Client → API Gateway → Lambda → API Gateway → Client
         request đi vào       response đi ra
```

## Integration: phần quyết định cách trao đổi dữ liệu

| Loại | Trách nhiệm |
|---|---|
| Lambda proxy (`AWS_PROXY`) | Gateway đóng gói thông tin request; Lambda trả response theo hợp đồng integration |
| AWS/custom integration | Cấu hình integration request/response và mapping để gọi Lambda hoặc AWS service |
| HTTP proxy | Chuyển tiếp request/response với HTTP backend |
| MOCK | Gateway tự tạo kết quả, không cần backend |

Với **REST API Lambda proxy**, response có `statusCode` dạng number và `body` dạng string. Headers có thể bổ sung khi cần. Ví dụ:

```json
{
  "statusCode": 200,
  "headers": { "Content-Type": "application/json" },
  "body": "{\"message\":\"ok\"}"
}
```

Đừng đặt object trực tiếp vào `body` ở định dạng này. Code nghiệp vụ có thể chạy thành công nhưng API Gateway vẫn trả 502 vì response sai cấu trúc. HTTP API payload format 2.0 có quy tắc suy luận response riêng, không áp dụng máy móc quy tắc REST cho mọi API. [REST proxy format](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html), [HTTP API payload formats](https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html).

## Deployment và môi trường

Thêm method vào REST API chưa làm stage cũ nhận thay đổi; phải tạo deployment mới và gắn stage phù hợp. Stage variables có thể chọn Lambda alias/version cho từng môi trường, nhưng không tự deploy code hoặc cấp quyền invoke.

**Không ảnh hưởng production** → test stage riêng và backend/version test riêng. **Chấp nhận một phần traffic thật thử bản mới** → canary. Hai yêu cầu này khác nhau.

Mapping template biến đổi dữ liệu. Với MOCK trả HTML, request mapping tạo kết quả giả như `statusCode: 200`; response mapping chứa HTML; cấu hình response header `Content-Type: text/html` để browser hiểu đúng.

## Tình huống song ngữ

**EN:** An API Gateway REST API invokes Lambda through proxy integration. The function returns an object as `body`, and the client receives 502. What should change?

**VI:** REST API gọi Lambda qua proxy integration. Function trả object trong `body`, client nhận 502. Cần sửa gì?

| | EN | VI |
|---|---|---|
| A | Serialize the response body to a string | Chuyển body thành chuỗi |
| B | Change the caller's authorization token | Đổi token của người gọi |
| C | Increase reserved concurrency | Tăng reserved concurrency |

### Đáp án và giải thích

**A.** Đề đã xác định lỗi hợp đồng response. B xử lý authentication; C xử lý năng lực đồng thời. Trong thực tế 502 cũng có thể xuất hiện khi function lỗi; hãy xem execution logs và Lambda logs, không suy luận từ status duy nhất. [Lambda/API Gateway errors](https://docs.aws.amazon.com/lambda/latest/dg/services-apigateway-errors.html)

## Tự kiểm tra

Giải thích vì sao backend thành công chưa chắc client nhận 200. Nếu method mới trả lỗi sau khi CloudFormation update thành công, deployment/stage đang trỏ tới bản nào? Cần test không ảnh hưởng user thì có nên dùng canary production không?
