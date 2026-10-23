# Logs và EventBridge: tìm lỗi khác với định tuyến sự kiện

## Khái niệm cần hiểu

**Log event** mô tả điều xảy ra; **log stream** nhóm bản ghi từ nguồn; **log group** quản lý retention và cấu hình chung. **Logs Insights** truy vấn logs. **EventBridge event bus** nhận sự kiện và dùng rules để đưa tới targets.

## Cơ chế và quyết định cần thi

| Yêu cầu | Cơ chế |
|---|---|
| Tìm lỗi trong nhiều log groups | CloudWatch Logs Insights |
| Đếm pattern log thành metric | Metric filter |
| Chuyển log events sang hệ xử lý khác | Logs subscription filter |
| Route sự kiện theo source/detail | EventBridge rule |
| Chạy công việc theo thời gian | EventBridge Scheduler |

API Gateway cần bật logging ở stage phù hợp; Lambda cần execution role có quyền ghi logs. Ghi structured JSON và correlation/request ID để nối các bước. Không ghi password, access token hay dữ liệu cá nhân không cần thiết.

EventBridge không tự biết mọi thay đổi bên trong database. DynamoDB item changes dùng Streams; event bus chỉ route những event đã được đưa vào. Retry/DLQ của target delivery không thay thế error handling bên trong consumer.

## Tình huống song ngữ

**EN:** A serverless API needs to search application logs across API Gateway and Lambda with minimal operations. Which tool fits?

**VI:** API serverless cần tìm application logs của API Gateway và Lambda với ít vận hành. Dùng gì?

| | EN | VI |
|---|---|---|
| A | CloudWatch Logs Insights | Truy vấn logs bằng Insights |
| B | CloudTrail only | Chỉ CloudTrail |
| C | PutMetricData to upload log lines | Dùng PutMetricData tải từng dòng log |

### Đáp án và giải thích

**A.** Logs Insights truy vấn các log groups đã thu thập. B audit AWS API activity; C nhận metric, không phải API ingest log lines.

## Tự kiểm tra

EventBridge rule filter và Logs subscription filter lọc hai loại dữ liệu nào? Log không tồn tại trong group thì query có tạo lại được không?

Nguồn: [Logs Insights](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/AnalyzingLogData.html), [EventBridge rules](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rules.html).
