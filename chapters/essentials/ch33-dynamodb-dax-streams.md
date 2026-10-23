# DynamoDB: DAX, Streams, TTL và Global Tables

## Khái niệm cần hiểu

**DAX** là cache tương thích DynamoDB để giảm độ trễ đọc. **Streams** ghi thay đổi item. **TTL** đánh dấu thời điểm item đủ điều kiện xóa. **Global Tables** sao chép dữ liệu qua Regions theo chế độ được hỗ trợ.

## Cơ chế và quyết định cần thi

| Nhu cầu | Cơ chế |
|---|---|
| Nhiều lần đọc cùng dữ liệu, chấp nhận eventual cache | DAX |
| Xử lý khi item thay đổi | Streams + consumer |
| Tự dọn item hết hạn | TTL |
| Ứng dụng nhiều Region | Global Tables và thiết kế consistency/conflict phù hợp |

DAX không phải công cụ tìm item hết hạn hay tự chuyển sang S3. Strong read không hưởng cache theo cùng cách eventual read.

TTL là số epoch seconds trong attribute được chỉ định. Xóa bất đồng bộ, thường trong vài ngày; **không phải trigger đúng giây hết hạn**. Nếu app không được hiển thị item quá hạn, app phải lọc/kiểm tra TTL trong lúc chờ xóa.

Khi TTL deletion xảy ra, Streams có thể cung cấp OLD_IMAGE nếu cấu hình view thích hợp. Lambda đọc bản cũ và lưu S3 **sau khi deletion event đã xảy ra**, không giữ item lại để chờ xử lý xong. Streams retention 24 giờ nên cần xử lý lỗi/retry và giám sát backlog.

Global Tables có nhiều chế độ consistency với giới hạn riêng; không học “mọi Global Table luôn eventual” như chân lý vĩnh viễn. Với bài theo MREC truyền thống, phải xét replication lag và xử lý xung đột.

## Tình huống song ngữ

**EN:** TTL-deleted DynamoDB items must be archived to S3 after five minutes of processing. Which pattern minimizes operations?

**VI:** Item DynamoDB bị TTL xóa cần xử lý năm phút rồi lưu S3. Mô hình nào ít vận hành?

| | EN | VI |
|---|---|---|
| A | Streams with OLD_IMAGE → Lambda → S3 | Streams có bản cũ → Lambda → S3 |
| B | DAX automatically exports expired items | DAX tự xuất item hết hạn |
| C | Keep the archive only in Lambda memory | Chỉ giữ bản lưu trong memory Lambda |

### Đáp án và giải thích

**A.** Consumer nhận dữ liệu cũ từ deletion event; năm phút nằm trong thời gian một Lambda execution thông thường hỗ trợ. B không phải tính năng DAX; C không lưu bền.

## Tự kiểm tra

TTL hết hạn và TTL deletion có cùng thời điểm không? Stream cần view nào để lấy nội dung item đã xóa?

Nguồn: [TTL](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html), [Streams](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html), [Global Tables](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html).
