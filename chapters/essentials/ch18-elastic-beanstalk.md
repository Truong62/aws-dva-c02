# Elastic Beanstalk: triển khai ứng dụng và chọn chiến lược cập nhật

## Khái niệm cần hiểu

Beanstalk triển khai application version lên **environment** gồm các tài nguyên như EC2, load balancer và scaling. Application version là gói code; environment là nơi chạy code. Dịch vụ giúp quản lý môi trường nhưng bạn vẫn chịu trách nhiệm ứng dụng và cấu hình.

## Cơ chế và quyết định cần thi

| Chiến lược | Đánh đổi |
|---|---|
| All at once | Thay toàn bộ, dễ gây gián đoạn |
| Rolling | Thay theo batch, capacity có thể giảm tạm |
| Rolling with additional batch | Thêm batch để giữ capacity |
| Immutable | Tạo nhóm instance mới, kiểm tra trước khi thay nhóm cũ |
| Traffic splitting | Cho phần traffic thử version mới trên môi trường hỗ trợ |

**Blue/green**: tạo environment mới và chuyển traffic, thường bằng swap CNAME. DNS caching có nghĩa không phải mọi client chuyển tức thì. **Rollback** code cũng phải xét schema DB có tương thích với bản cũ không.

`.ebextensions` khai báo cấu hình/tài nguyên theo định dạng Beanstalk hỗ trợ. Environment properties truyền cấu hình; không hardcode secret trong source. Database vòng đời dài nên được cân nhắc tách khỏi môi trường ứng dụng có thể xóa/recreate.

## Tình huống song ngữ

**EN:** A deployment must keep the old instances available until a new fleet passes health checks. Which policy fits?

**VI:** Phải giữ nhóm instance cũ tới khi nhóm mới pass health checks. Policy nào phù hợp?

| | EN | VI |
|---|---|---|
| A | Immutable deployment | Triển khai nhóm mới độc lập |
| B | All at once | Thay toàn bộ tại chỗ |
| C | Stop all instances first | Dừng mọi instance trước |

### Đáp án và giải thích

**A.** Tách nhóm mới giúp kiểm tra trước khi thay. B/C không đáp ứng việc giữ nhóm cũ phục vụ trong quá trình đó. Đổi lại cần thêm capacity tạm thời.

## Tự kiểm tra

“Không giảm capacity”, “rollback nhanh” và “chi phí thấp nhất” có luôn dẫn tới cùng chiến lược không?

Nguồn: [Deployment policies](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.rolling-version-deploy.html), [Blue/green](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.CNAMESwap.html).
