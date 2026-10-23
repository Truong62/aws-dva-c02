# Lambda nâng cao: concurrency, versions và rollout

## Khái niệm cần hiểu

**Concurrency** là số executions đồng thời. **Version** là snapshot đã publish; **alias** là tên ổn định trỏ tới published version. `$LATEST` là bản đang thay đổi, không phải một version cố định để weighted routing.

## Cơ chế và quyết định cần thi

| Tính năng | Giải quyết | Không bảo đảm |
|---|---|---|
| Reserved concurrency | Dành quota và đặt trần đồng thời cho function | Không giữ môi trường warm |
| Provisioned concurrency | Chuẩn bị sẵn môi trường cho version/alias | Traffic vượt phần provisioned có thể cold start |
| SnapStart | Giảm chi phí khởi tạo bằng snapshot trên runtime/cấu hình hỗ trợ | Không thay mọi giới hạn và không dùng chung provisioned concurrency trên cùng version |
| Weighted alias | Chia invocation giữa hai published versions | Không giữ đúng một nhóm người dùng cố định |

Alias chỉ trỏ tới version, không trỏ sang alias khác hoặc function URL. Weighted routing chọn xác suất theo invocation; 10% traffic không nhất thiết là 10% user duy nhất. Canary giảm phạm vi rủi ro nhưng vẫn tác động traffic thật.

Rollback bằng cách đổi alias về version tốt trước đó. Nếu cần test **không ảnh hưởng production**, dùng test alias/stage riêng và kiểm soát cả side effects như database/queue dùng trong test.

Layers chia sẻ code/dependencies với version cố định; cập nhật layer không tự đổi mọi function đang tham chiếu version cũ. EFS phục vụ file chia sẻ cập nhật độc lập. AppConfig phục vụ cấu hình động, không cần đóng gói lại code.

## Tình huống song ngữ

**EN:** A new Lambda version should receive a small fraction of live traffic and roll back quickly if errors increase. What fits?

**VI:** Bản Lambda mới chỉ nhận ít traffic thật và rollback nhanh nếu lỗi tăng. Chọn gì?

| | EN | VI |
|---|---|---|
| A | A weighted alias between published versions | Alias có trọng số giữa published versions |
| B | An alias pointing to another alias | Alias trỏ sang alias khác |
| C | Overwrite $LATEST and send all traffic | Ghi đè $LATEST rồi chuyển toàn bộ traffic |

### Đáp án và giải thích

**A.** Giữ endpoint alias ổn định và điều chỉnh tỷ lệ. B không được hỗ trợ; C ảnh hưởng toàn bộ traffic và thiếu version cố định cho rollback.

## Tự kiểm tra

Reserved concurrency có hết cold start không? Một user gửi 10 request có chắc cùng version không?

Nguồn: [Concurrency](https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html), [Alias routing](https://docs.aws.amazon.com/lambda/latest/dg/configuring-alias-routing.html), [Aliases](https://docs.aws.amazon.com/lambda/latest/dg/using-aliases.html).
