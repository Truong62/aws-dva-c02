# Rà soát nội dung ngày 23/10/2026

## Phạm vi

Biên tập 50 bài ôn thi trong `chapters/essentials`. Tất cả có khái niệm, cơ chế/quyết định, tình huống và lựa chọn Anh–Việt, giải thích đáp án, tự kiểm tra và link tài liệu AWS. IAM/Lambda/API Gateway/SAM giải thích kỹ hơn để xử lý các lỗ hổng người học đã nêu. Bài gốc nằm trong Đọc thêm; metadata thời gian/từ tính phần ôn thi.

## Hiệu chỉnh trong bản tham khảo và bản part

| Nội dung | Hiệu chỉnh | Nguồn |
|---|---|---|
| SQS payload/batch | 1 MiB, sửa câu ví dụ cần offload thành payload 2 MiB | [AWS update](https://aws.amazon.com/about-aws/whats-new/2025/08/amazon-sqs-max-payload-size-1mib/) |
| SAM Globals lists | Global entries được prepend, không bị thay thế hoàn toàn | [Globals](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy-globals.html) |
| SAM package CLI | `--output-template-file` | [SAM package](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-package.html) |
| SAM Policies và Role | Có Role ARN thì Policies của function bị bỏ qua | [Function](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html) |
| REST API timeout | 29 giây không phải trần bất biến cho mọi endpoint; câu hỏi cần ghi timeout đang cấu hình | [AWS update](https://aws.amazon.com/about-aws/whats-new/2024/06/amazon-api-gateway-integration-timeout-limit-29-seconds/) |
| Điểm mô phỏng | Bỏ phép quy đổi 720 = 72% và lời khẳng định điểm mock bảo đảm đậu | [Exam Guide](https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02.html) |

## Những điểm được làm rõ trong bài chính

- IAM: credentials chọn caller trước khi evaluation; execution role khác authorizer; YAML khác SAM.
- Lambda: retries phụ thuộc invocation source; reserved không làm warm; alias không trỏ alias; weighted traffic theo invocation.
- Messaging: FIFO dedup không thay idempotency; redrive có thể đổi message ID; SNS filter ở subscription; numeric ESM filter không dùng cho DynamoDB N string.
- Dữ liệu: TTL deletion bất đồng bộ; archive qua OLD_IMAGE sau deletion; current expiration tạo delete marker và tuổi noncurrent tính riêng.
- Security: env vars đã encrypted at rest; SecureString/Secrets Manager/KMS/AppConfig khác chức năng; thời hạn presigned URL bị giới hạn bởi credentials.
- Deployment: capacity provider weight không tự failover; CloudFormation failures cần xem events; API deployment snapshot phải được cập nhật.
- Monitoring: logs/metrics/traces/audit khác nhau; alarm SNS theo state transition; SDK/daemon X-Ray maintenance khác việc dịch vụ tracing biến mất.
- AppConfig: agent nhận config không tự làm ứng dụng áp dụng; code phải consume runtime config.

## Giới hạn của đợt biên tập

Không tuyên bố đã kiểm chứng từng dòng của khoảng 359.000 đơn vị từ/tách khoảng trắng trong bản tham khảo hoặc toàn bộ 510 câu trong `public/quiz-questions.json`. Bộ quiz và lịch sử được giữ nguyên; nhãn điểm được sửa cho đúng ý nghĩa. Các link AWS giúp người học đối chiếu khi gặp câu cũ. Chỉ các lỗi tham khảo trong bảng trên được sửa đồng bộ trong đợt này.

Mã thi mục tiêu là DVA-C02. AWS công bố ngày thi cuối 30/11/2026; người học kiểm tra mã thi/lịch đăng ký tại [trang certification](https://aws.amazon.com/certification/certified-developer-associate/). Không coi nội dung C02 tự động là giáo trình C03.

## Kiểm tra trước khi xuất bản

`npm run check:content`, `npm run check`, `npm run build` và `git diff --check` đều qua. Bản export có đủ 50 chương; 2.728 liên kết nội bộ trong các chương trỏ tới đường dẫn tồn tại. Kiểm tra Chromium ở chiều rộng 390 và 1440 px xác nhận mở/đóng Đọc thêm, đáp án, không tràn ngang và không có lỗi JavaScript.

Trong kiểm tra trình duyệt phát hiện reader gắn lại HTML khi cập nhật tiến độ cuộn, làm mất phần đáp án được trang trí và trạng thái mở. Giữ ổn định đối tượng `dangerouslySetInnerHTML` bằng `useMemo` đã khắc phục; kiểm tra trình duyệt và build được chạy lại thành công.
