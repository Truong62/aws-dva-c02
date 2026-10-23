# Kinesis và Firehose: stream khác queue thế nào?

## Khái niệm cần hiểu

**Stream** giữ chuỗi records để consumers đọc theo vị trí và có thể replay trong retention. **Shard** là đơn vị phân chia capacity/ordering trong Kinesis Data Streams. **Partition key** quyết định shard nhận record. Consumer đọc không xóa record như delete message SQS.

## Cơ chế và quyết định cần thi

| Nhu cầu | Dịch vụ phù hợp |
|---|---|
| Consumer xử lý stream, replay, quản lý checkpoint | Kinesis Data Streams |
| Giao dữ liệu tới S3/OpenSearch/đích hỗ trợ với ít code | Amazon Data Firehose |
| Hàng đợi chia công việc giữa workers | SQS |

Firehose có buffering và xử lý delivery; không đồng nghĩa một stream để consumer tùy ý replay. Data Streams hỗ trợ nhiều consumers; enhanced fan-out cấp throughput đọc chuyên biệt theo consumer.

Ordering được xét trong shard; một partition key quá nóng có thể tạo bottleneck. Tăng tổng capacity chưa chắc xử lý được key có tải lệch. Với Lambda, lỗi record có thể làm chậm tiến độ shard; quan sát IteratorAge và cấu hình retry/partial batch phù hợp.

CloudFront real-time logs dùng Data Streams làm đích. Consumer có thể transform rồi ghi OpenSearch để vẽ dashboard; CloudTrail không phải nơi nhận application log stream này.

## Tình huống song ngữ

**EN:** Multiple consumers need to replay recent events independently. Which service better matches this requirement?

**VI:** Nhiều consumer cần đọc lại các sự kiện gần đây độc lập. Dịch vụ nào phù hợp hơn?

| | EN | VI |
|---|---|---|
| A | Kinesis Data Streams | Stream có retention và replay |
| B | One SQS queue with successful messages deleted | Một queue xóa message sau xử lý |
| C | CloudTrail event history | Lịch sử audit API |

### Đáp án và giải thích

**A.** Record còn trong retention để consumers đọc theo checkpoint. B không giữ message đã delete để replay; C không phải stream nghiệp vụ tùy ý.

## Tự kiểm tra

Consumer đọc xong record có bị xóa không? Nếu yêu cầu chỉ giao dữ liệu tới S3 với ít vận hành, có cần tự viết consumer không?

Nguồn: [Data Streams concepts](https://docs.aws.amazon.com/streams/latest/dev/key-concepts.html), [Data Firehose](https://docs.aws.amazon.com/firehose/latest/dev/what-is-this-service.html).
