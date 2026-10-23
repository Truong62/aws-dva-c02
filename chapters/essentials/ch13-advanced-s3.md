# S3 nâng cao: lifecycle, replication và events

## Khái niệm cần hiểu

**Lifecycle** tự chuyển storage class hoặc expire object/version theo quy tắc. **Replication** sao chép sang bucket đích. **Event notification** báo ứng dụng rằng thao tác object đã xảy ra. Ba cơ chế này giải quyết ba nhu cầu khác nhau.

## Cơ chế và quyết định cần thi

| Yêu cầu | Tính năng |
|---|---|
| Chuyển dữ liệu ít đọc sang lớp lưu trữ khác | Lifecycle transition |
| Dọn dữ liệu theo tuổi | Lifecycle expiration |
| Sao chép object sang bucket/Region khác | Replication |
| Xử lý khi có file mới | Event notifications hoặc EventBridge |

Trong bucket versioned, expire current version tạo delete marker và biến version dữ liệu thành noncurrent. **NoncurrentVersionExpiration tính tuổi từ lúc version trở thành noncurrent**, không phải từ lúc object đầu tiên được tạo. Đặt cả hai mốc 365 ngày không bảo đảm toàn bộ dữ liệu bị xóa sau đúng 365 ngày kể từ tạo ban đầu.

Lifecycle xử lý bất đồng bộ; đừng dùng như lịch hẹn xóa chính xác từng giây. Object Lock/retention còn có thể ngăn xóa version.

Replication cần cấu hình quyền và versioning phù hợp; không mặc định sao chép toàn bộ object cũ, thường dùng Batch Replication cho dữ liệu có sẵn. Notifications có thể lặp; consumer phải idempotent. Tránh vòng lặp Lambda nhận file rồi ghi lại cùng prefix kích hoạt chính nó.

## Tình huống song ngữ

**EN:** A versioned bucket must remove old data permanently. Is expiring only current versions sufficient?

**VI:** Bucket có versioning cần xóa vĩnh viễn dữ liệu cũ. Chỉ expire current versions có đủ không?

| | EN | VI |
|---|---|---|
| A | Yes, expiration deletes every version | Có, expiration xóa mọi version |
| B | No, noncurrent versions also need handling | Không, phải xử lý cả noncurrent versions |
| C | Enable CloudFront invalidation | Bật invalidation CloudFront |

### Đáp án và giải thích

**B.** Delete marker không xóa tất cả version dữ liệu. C xóa cache CDN, không xóa object trong S3.

## Tự kiểm tra

Tại sao event tạo object không tự chạy lại sau một năm? Replication có thay thế chiến lược backup/retention được trong mọi trường hợp không?

Nguồn: [Lifecycle elements](https://docs.aws.amazon.com/AmazonS3/latest/userguide/intro-lifecycle-rules.html), [Replication](https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html).
