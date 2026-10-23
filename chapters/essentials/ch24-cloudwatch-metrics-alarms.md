# CloudWatch Metrics và Alarms: từ số liệu tới cảnh báo

## Khái niệm cần hiểu

**Metric** là chuỗi số liệu theo thời gian; **namespace** nhóm metric; **dimensions** xác định chuỗi cụ thể; **statistic** như Sum/Average/Minimum tổng hợp dữ liệu; **alarm** đánh giá điều kiện qua các period. Dashboard hiển thị, alarm mới thực hiện hành động cảnh báo.

## Cơ chế và quyết định cần thi

Ứng dụng có thể publish custom metric bằng `PutMetricData` hoặc Embedded Metric Format trong logs. Metric “số đơn trong batch” không tự xuất hiện từ Lambda nếu code chưa cung cấp.

Metric độ phân giải cao hỗ trợ dữ liệu một giây. Muốn phát hiện dưới một phút, cần alarm high-resolution với period phù hợp, số datapoints và missing-data behavior hợp lý; không chỉ tạo dashboard. Thời gian gửi SNS còn phụ thuộc ingestion/evaluation/delivery, không nên hứa SLA tuyệt đối từ period.

Khi cần phát hiện **bất kỳ batch rỗng**, dùng metric và statistic không làm zero bị che bởi batch dương cùng period, ví dụ Minimum cho chuỗi phù hợp. Với số lượng không âm, điều kiện `<= 0` thể hiện batch bằng zero. SNS alarm action thường chạy khi **chuyển trạng thái**, không tự gửi một thông báo cho mỗi batch rỗng nếu alarm vẫn ALARM.

## Tình huống song ngữ

**EN:** Lambda processes daily batches. A zero-order batch should trigger a CloudWatch-based notification. Which pair is appropriate?

**VI:** Lambda xử lý batch hằng ngày. Batch không có đơn cần cảnh báo qua CloudWatch. Cặp nào phù hợp?

| | EN | VI |
|---|---|---|
| A | Custom order-count metric + alarm to SNS | Metric số đơn + alarm gửi SNS |
| B | Dashboard only | Chỉ dashboard |
| C | A once-daily log review | Xem log một lần mỗi ngày |

### Đáp án và giải thích

**A.** Có tín hiệu định lượng và hành động tự động. B chỉ hiển thị; C có độ trễ lớn. Nếu yêu cầu notify riêng từng batch, publish trực tiếp từ luồng xử lý có thể phù hợp hơn khi đề cho lựa chọn đó.

## Tự kiểm tra

Zero khác missing data ở đâu? Vì sao Average có thể che một batch rỗng? Alarm đang ALARM có gửi SNS cho từng datapoint tiếp theo không?

Nguồn: [CloudWatch alarms](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Alarms.html), [High-resolution metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html).
