# CloudTrail: ai đã thực hiện hành động AWS?

## Khái niệm cần hiểu

CloudTrail ghi hoạt động API/account. Event có thông tin như **eventName**, **eventTime**, **userIdentity**, source và request parameters. **Management events** liên quan quản lý tài nguyên; **data events** ghi các hoạt động dữ liệu được cấu hình, như truy cập object.

## Cơ chế và quyết định cần thi

| Câu hỏi | Nơi tìm |
|---|---|
| Ai gọi DeleteDBInstance? | CloudTrail |
| SQL nào chạy chậm? | DB logs/performance tooling |
| Lambda ném exception gì? | Application logs |
| Chặng nào trong request bị chậm? | Trace |

Event history cung cấp 90 ngày management events trong Region. Không mặc định chứa mọi data event; cần trail/event data store với lựa chọn ghi phù hợp. Lưu dài hạn và phân tích rộng hơn phải cấu hình đích lưu/truy vấn tương ứng.

Với assumed role, cần đọc session identity và thông tin liên quan để xác định caller; không chỉ nhìn tên role rồi kết luận một người cụ thể. CloudTrail không thay thế application logs ghi lỗi nghiệp vụ.

## Tình huống song ngữ

**EN:** An RDS instance was deleted within the past 90 days. How can a developer find the IAM identity responsible?

**VI:** RDS instance bị xóa trong 90 ngày qua. Làm sao tìm IAM identity thực hiện?

| | EN | VI |
|---|---|---|
| A | Inspect CloudTrail DeleteDBInstance events | Xem CloudTrail events DeleteDBInstance |
| B | Search only the MySQL slow-query log | Chỉ tìm slow-query log MySQL |
| C | Inspect X-Ray sampling rates | Xem sampling rate X-Ray |

### Đáp án và giải thích

**A.** Xóa instance là management API action. B ghi hoạt động engine/query; C không audit thao tác xóa hạ tầng.

## Tự kiểm tra

Vì sao event history không đủ để chứng minh ai đã đọc mọi S3 object? Management event khác data event ở đâu?

Nguồn: [CloudTrail event history](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/view-cloudtrail-events.html), [CloudTrail events](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-events.html).
