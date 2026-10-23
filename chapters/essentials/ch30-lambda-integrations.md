# Lambda integrations: nguồn sự kiện quyết định retry

## Khái niệm cần hiểu

**Event source mapping (ESM)** là tài nguyên Lambda dùng để đọc queue/stream rồi invoke function theo batch. Nó không phải cơ chế dùng cho mọi trigger; SNS và API Gateway gọi Lambda theo các cách khác.

## Cơ chế và quyết định cần thi

| Nguồn | Cách nhận | Điểm cần nhớ |
|---|---|---|
| API Gateway | Gọi đồng bộ | Response phải đúng integration format |
| SNS/S3 notification | Gọi bất đồng bộ | Xét async retries, destinations/DLQ |
| SQS | ESM poll queue | Visibility timeout, delete sau thành công, queue DLQ |
| DynamoDB Streams/Kinesis | ESM poll stream | Checkpoint, thứ tự, batch failure, IteratorAge |

**Partial batch response** báo các record thất bại để không retry toàn bộ record thành công theo cơ chế nguồn hỗ trợ. Với FIFO, cần giữ ordering khi xử lý lỗi. Retry luôn đi kèm idempotency vì tác dụng phụ có thể đã xảy ra trước khi function lỗi.

**Event filtering** ở ESM giúp bỏ record không cần chạy function. SNS trực tiếp cần **SNS subscription filter policy**. DynamoDB Streams biểu diễn số bằng chuỗi trong trường `N`; numeric comparison của ESM filtering không áp dụng như JSON số thông thường. Nếu cần `Price > threshold`, xử lý điều kiện số trong code; có thể lọc chuỗi status trước để giảm invocation.

Async DLQ giữ event không xử lý thành công; destinations có thêm invocation context theo loại. DLQ của Lambda async không thay queue redrive policy cho SQS ESM. Kiểm tra đúng chặng thất bại trước khi chọn cơ chế.

## Tình huống song ngữ

**EN:** DynamoDB Streams records contain a numeric price in the `N` string field. The app must notify when price exceeds a threshold. What is safe?

**VI:** Record DynamoDB Streams chứa giá trong chuỗi `N`. App cần notify khi giá vượt ngưỡng. Cách nào đúng?

| | EN | VI |
|---|---|---|
| A | Compare the numeric value in Lambda code | So sánh giá trị số trong code Lambda |
| B | Apply numeric ESM filtering directly to N | Dùng numeric filter trực tiếp cho N |
| C | Connect an ESM directly to SNS | Nối ESM trực tiếp sang SNS |

### Đáp án và giải thích

**A.** B không được hỗ trợ cho kiểu DynamoDB event này; C không phải ESM invoke Lambda. Sau khi kiểm tra điều kiện, Lambda có thể publish SNS.

## Tự kiểm tra

Ai retry khi SNS gọi Lambda và code lỗi? Ai redrive khi Lambda đọc SQS thất bại? Vì sao hai câu không dùng cùng cấu hình DLQ?

Nguồn: [SQS integration](https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html), [DynamoDB filtering](https://docs.aws.amazon.com/lambda/latest/dg/with-ddb-filtering.html), [Async error handling](https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-error-handling.html).
