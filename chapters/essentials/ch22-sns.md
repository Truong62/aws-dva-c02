# SNS: một sự kiện tới nhiều subscriber

## Khái niệm cần hiểu

SNS là publish/subscribe messaging. Producer publish vào **topic**; mỗi **subscription** nối topic tới một consumer. **Fan-out** là gửi một sự kiện tới nhiều bên xử lý độc lập. SQS queue chia công việc giữa consumers; SNS topic phân phối tới subscriptions.

## Cơ chế và quyết định cần thi

```text
CRM → SNS topic → subscription lọc email → Lambda email
               → subscription khác → consumer khác
```

**Filter policy gắn trên subscription**, không gắn vào code Lambda hay “SQS topic”. Filter có thể xét message attributes hoặc JSON body tùy `FilterPolicyScope`. Subscriber không match sẽ không nhận message; không cần nhận rồi publish ngược lại topic.

SNS → SQS → worker bổ sung buffering và xử lý khi worker gián đoạn. Mỗi ứng dụng cần bản message riêng thì thường có queue riêng sau topic; nhiều workers cùng đọc một queue là competing consumers.

SNS delivery failure và Lambda async execution failure là các chặng khác nhau. Cấu hình DLQ đúng chặng: delivery không tới subscriber khác với đã invoke thành công nhưng function xử lý lỗi.

Giới hạn payload phụ thuộc cấu hình topic và loại subscriber. Theo cập nhật hiện tại, SNS có hỗ trợ tới 1 MiB với `MaximumMessageSize` và tập subscriber hỗ trợ; đừng áp mức mở rộng cho mọi subscription. [Large message payloads](https://docs.aws.amazon.com/sns/latest/dg/large-message-payloads.html)

## Tình huống song ngữ

**EN:** Lambda subscribed to SNS should run only for email changes. What requires the least code?

**VI:** Lambda đăng ký SNS chỉ cần chạy khi email thay đổi. Cách nào ít code nhất?

| | EN | VI |
|---|---|---|
| A | SNS subscription filter policy | Filter policy trên subscription |
| B | Republish unrelated messages from Lambda | Lambda publish lại message không liên quan |
| C | Add a Lambda event source mapping for SNS | Tạo event source mapping Lambda cho SNS |

### Đáp án và giải thích

**A.** SNS lọc trước khi invoke. B gây xử lý thừa và có thể lặp; SNS push trực tiếp, không dùng event source mapping kiểu SQS trong C.

## Tự kiểm tra

Ba ứng dụng đều phải nhận một sự kiện: một queue chung có đủ không? Filter policy đọc attributes hay body do cấu hình nào quyết định?

Nguồn: [SNS filtering](https://docs.aws.amazon.com/sns/latest/dg/sns-message-filtering.html), [Fan-out](https://docs.aws.amazon.com/sns/latest/dg/sns-sqs-as-subscriber.html).
