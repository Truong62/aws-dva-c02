# X-Ray: theo dấu một request qua nhiều dịch vụ

## Khái niệm cần hiểu

**Trace** là đường đi của request; **segment/subsegment** ghi công việc của service và các lời gọi con. **Trace context** được truyền giữa các chặng để ghép dữ liệu. **Instrumentation** là thêm khả năng ghi telemetry vào ứng dụng.

## Cơ chế và quyết định cần thi

Logs trả lời “đã ghi gì”; metrics trả lời “bao nhiêu, nhanh/chậm thế nào”; tracing trả lời “request này đi qua đâu và chậm ở đâu”. X-Ray/service map giúp định vị bottleneck, nhưng cần instrumentation và quyền gửi trace đúng.

Trong mô hình SDK/daemon thường gặp ở đề cũ: code gửi trace tới X-Ray daemon qua **UDP 2000**, daemon chuyển dữ liệu tới X-Ray service. Không có “global daemon TCP 2000” để ứng dụng truy cập. Lambda có tích hợp tracing; SDK calls tới downstream vẫn cần instrumentation thích hợp.

**Sampling** chọn một phần request để ghi. Traffic nghiệp vụ ít nhưng quan trọng có thể cấu hình ghi 100%; health checks nhiều thì lấy mẫu thấp. “Disable sampling và trace all” khác “tắt tracing”. **Annotations** có thể dùng để lọc traces; metadata giữ thông tin thêm nhưng không indexed theo cùng cách.

Cập nhật: X-Ray SDK/daemon đã vào maintenance từ 25/02/2026. Với ứng dụng mới, AWS hướng tới OpenTelemetry; vẫn cần hiểu SDK/daemon để giải đề theo kiến trúc đã mô tả. [AWS migration guidance](https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-migration.html)

## Tình huống song ngữ

**EN:** EC2 microservices need end-to-end request tracing using the X-Ray SDK architecture. What is required?

**VI:** Microservices EC2 cần trace request xuyên dịch vụ bằng kiến trúc X-Ray SDK. Cần gì?

| | EN | VI |
|---|---|---|
| A | Instrument code and configure the daemon/permissions | Instrument code và cấu hình daemon/quyền |
| B | Send CloudTrail logs to the daemon | Gửi CloudTrail logs vào daemon |
| C | Only enable a billing alarm | Chỉ bật alarm chi phí |

### Đáp án và giải thích

**A.** Trace phải được tạo, liên kết và gửi lên service. B không tạo trace cho nghiệp vụ; C giám sát tín hiệu khác.

## Tự kiểm tra

Vì sao bật logging chưa đủ để có distributed trace? Có nên sample health checks và giao dịch quan trọng theo cùng tỷ lệ không?

Nguồn: [X-Ray concepts](https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html), [Daemon on EC2](https://docs.aws.amazon.com/xray/latest/devguide/xray-daemon-ec2.html).
