# Step Functions: điều phối nhiều bước có trạng thái

## Khái niệm cần hiểu

**State machine** mô tả workflow; **state** là bước; **execution** là lần chạy. Task gọi công việc, Choice rẽ nhánh, Wait chờ, Parallel chạy các nhánh, Map xử lý tập phần tử. State machine có execution role để gọi các dịch vụ.

## Cơ chế và quyết định cần thi

| Loại | Khi dùng |
|---|---|
| Standard | Workflow bền vững, audit, có thể kéo dài tới một năm |
| Express | Lượng lớn execution ngắn, tối đa năm phút |

Standard có exactly-once workflow execution semantics nhưng `Retry` vẫn có thể chạy task lại. Async Express là at-least-once; synchronous Express là at-most-once. Không suy ra rằng gọi API thanh toán trong mọi workflow đều tự chống trùng.

Request-response chỉ chờ phản hồi API; `.sync` chờ job hoàn tất; `.waitForTaskToken` chờ callback với token trên integrations hỗ trợ. Không phải loại workflow nào cũng hỗ trợ mọi pattern.

`Retry` xử lý lỗi khớp trước; hết retry mới tới `Catch` phù hợp. Phân biệt lỗi nghiệp vụ không nên retry với lỗi tạm thời. Payload/state input-output cần được giới hạn; dữ liệu lớn nên lưu S3 và truyền tham chiếu thay vì nhét vào từng state.

## Tình huống song ngữ

**EN:** An order workflow must wait for human approval for several days. Which workflow type is appropriate?

**VI:** Workflow đơn hàng phải chờ người duyệt nhiều ngày. Loại nào phù hợp?

| | EN | VI |
|---|---|---|
| A | Standard with a supported callback pattern | Standard với callback phù hợp |
| B | Express running continuously for days | Express chạy nhiều ngày |
| C | One ordinary Lambda invocation sleeping for days | Một Lambda invocation thông thường ngủ nhiều ngày |

### Đáp án và giải thích

**A.** Standard hỗ trợ workflow dài; callback tách việc chờ khỏi việc giữ compute chạy. B vượt thời gian Express; C không phù hợp giới hạn invocation thông thường.

## Tự kiểm tra

API trả “job accepted” có nghĩa job hoàn tất chưa? Retry task có cần idempotency không?

Nguồn: [Workflow types](https://docs.aws.amazon.com/step-functions/latest/dg/choosing-workflow-type.html), [Service integration patterns](https://docs.aws.amazon.com/step-functions/latest/dg/connect-to-resource.html).
