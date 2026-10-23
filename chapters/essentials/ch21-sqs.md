# SQS: hàng đợi, retry và xử lý trùng

## Khái niệm cần hiểu

SQS giữ message để producer và consumer hoạt động độc lập. Consumer **poll** lấy message, xử lý rồi xóa. Receive không tự xóa message. **Visibility timeout** tạm ẩn message đang xử lý; quá hạn mà chưa delete thì message có thể được nhận lại.

## Cơ chế và quyết định cần thi

| Tính năng | Mục đích |
|---|---|
| Standard queue | Throughput cao, at-least-once delivery, best-effort ordering |
| FIFO queue | Ordering theo message group, deduplication gửi trong cửa sổ 5 phút |
| Long polling | Giảm lượt poll rỗng |
| DLQ / maxReceiveCount | Cách ly message lỗi sau nhiều lần nhận |
| StartMessageMoveTask | Redrive từ DLQ về queue để xử lý lại |

**FIFO không bảo đảm tác dụng nghiệp vụ chỉ xảy ra một lần.** Consumer có thể ghi DB thành công rồi chết trước khi delete message. Lần xử lý sau phải nhận diện cùng transaction bằng idempotency key/conditional write, không chỉ trông cậy deduplication của producer.

Giảm concurrency không loại bỏ duplicate. Visibility timeout quá ngắn có thể làm message xuất hiện lại khi consumer cũ còn xử lý. Với Lambda, dùng khuyến nghị visibility timeout cho event source mapping và partial batch response để tránh retry cả các message đã thành công.

Rà soát 23/10/2026: giới hạn payload SQS là **1 MiB**, không còn 256 KiB. Với dữ liệu lớn hơn, lưu payload ở S3 và gửi tham chiếu. Throughput FIFO phụ thuộc batching, high-throughput mode, Region và phân bố message group; không học 300 msg/s như trần tuyệt đối. [SQS payload update](https://aws.amazon.com/about-aws/whats-new/2025/08/amazon-sqs-max-payload-size-1mib/)

## Tình huống song ngữ

**EN:** A bug has been fixed. Failed messages are in an SQS DLQ and should return to the original queue. Which API fits?

**VI:** Bug đã sửa. Message lỗi đang ở SQS DLQ cần về queue gốc. Dùng API nào?

| | EN | VI |
|---|---|---|
| A | StartMessageMoveTask | Di chuyển message bằng redrive task |
| B | PurgeQueue | Xóa sạch queue |
| C | ChangeMessageVisibility | Đổi visibility trong queue hiện tại |

### Đáp án và giải thích

**A.** B xóa dữ liệu; C không chuyển queue. Redrive có thể cấp message ID mới, nên idempotency nghiệp vụ nên dùng ID do ứng dụng quản lý.

## Tự kiểm tra

Kể một trường hợp FIFO vẫn dẫn tới consumer chạy lại. DLQ của queue khác DLQ của Lambda async ở đâu?

Nguồn: [DLQ redrive](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-configure-dead-letter-queue-redrive.html), [Lambda with SQS](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html).
