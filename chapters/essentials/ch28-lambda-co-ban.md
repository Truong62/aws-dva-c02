# Lambda: thực thi code theo yêu cầu

## Khái niệm cần hiểu

**Lambda function** là code cùng cấu hình thực thi. **Handler** là hàm vào; **event** là dữ liệu đầu vào; **context** chứa thông tin lần thực thi. **Runtime** chạy ngôn ngữ bạn chọn. **Execution environment** là môi trường AWS chuẩn bị để thực thi function.

**Cold start** có bước khởi tạo môi trường trước khi handler chạy. Lần gọi sau có thể tái sử dụng môi trường, gọi là warm invocation; không có bảo đảm mọi lần gọi đều dùng lại cùng môi trường.

## Ba kiểu gọi phải phân biệt

| Kiểu | Ví dụ | Ai xử lý retry? |
|---|---|---|
| Synchronous | API Gateway gọi Lambda | Bên gọi/integration quyết định; Lambda không tự retry lỗi code của lời gọi đồng bộ |
| Asynchronous | S3 notification, SNS | Lambda xếp hàng nội bộ và quản lý retry async |
| Event source mapping | SQS, Kinesis, DynamoDB Streams | Lambda poll nguồn; hành vi retry phụ thuộc queue hoặc stream |

Với lỗi code của async invocation, mặc định Lambda thử lại thêm hai lần. Throttling/lỗi hệ thống có hành vi khác. SQS retry theo visibility timeout và redrive policy của queue, không dùng quy tắc “hai lần” này. [Lambda retry behavior](https://docs.aws.amazon.com/lambda/latest/dg/invocation-retries.html)

## Quyền, hiệu năng và nơi lưu dữ liệu

Execution role cấp quyền cho code đọc S3, ghi DynamoDB, ghi logs. Resource-based policy của Lambda cấp quyền cho service/caller invoke function. Tạo function thành công chưa có nghĩa code được phép truy cập mọi tài nguyên.

**Memory** ảnh hưởng lượng CPU được cấp. Với xử lý ảnh chậm, tăng memory rồi đo duration/cost là hướng hợp lý. **Concurrency** là số execution đồng thời, không phải tốc độ một execution.

Đối với mô hình Lambda thông thường trong các bài DVA-C02: timeout tối đa 15 phút; gói ZIP sau giải nén gồm layers tối đa 250 MB; container image tối đa 10 GB, lưu ở ECR. Upload ZIP qua S3 không bỏ giới hạn kích thước giải nén. [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)

| Nơi lưu | Dùng khi | Điều không được giả định |
|---|---|---|
| `/tmp` | Cache/tệp trung gian trong một environment | Không phải kho chia sẻ hay lưu bền vững |
| EFS | File dùng chung qua VPC/access point | Không tự tạo URL tải file public |
| S3 | Kết quả cần lưu và chia sẻ qua URL | Không phải filesystem gắn vào `/tmp` |

Khởi tạo SDK client ngoài handler giúp tái sử dụng khi môi trường còn tồn tại. Không giữ session người dùng chỉ trong memory của Lambda. Environment variables được mã hóa at rest, nhưng secrets cần quản lý truy cập và vòng đời phù hợp; không ghi ra log.

## Tình huống song ngữ

**EN:** A Lambda function processes an image slowly. Which change can increase the CPU available to each execution?

**VI:** Lambda xử lý ảnh chậm. Thay đổi nào có thể tăng CPU cho từng lần thực thi?

| | EN | VI |
|---|---|---|
| A | Increase reserved concurrency | Tăng reserved concurrency |
| B | Increase function memory | Tăng memory của function |
| C | Increase the number of retries | Tăng số lần retry |

### Đáp án và giải thích

**B.** CPU được cấp tương ứng với memory. A thay đổi số execution đồng thời được dành/giới hạn cho function; C chỉ lặp lại công việc sau lỗi, không làm một lần xử lý nhanh hơn.

## Tự kiểm tra

API Gateway gọi Lambda: ai chờ ai? Lambda đọc S3: quyền nằm đâu? Kết quả video phải tải được sau ba giờ: vì sao `/tmp` không đủ? Chỉ đánh dấu đã hiểu khi giải thích được cả ba.

Nguồn: [Execution environment](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html), [Memory configuration](https://docs.aws.amazon.com/lambda/latest/dg/configuration-memory.html), [Environment variables](https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html).
