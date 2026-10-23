# RDS và Aurora: kết nối, khả dụng và mở rộng đọc

## Khái niệm cần hiểu

RDS là dịch vụ database quan hệ được quản lý. Aurora là database tương thích MySQL/PostgreSQL với kiến trúc storage riêng. **Connection** là phiên kết nối DB; **transaction** là nhóm thao tác có tính nhất quán; **replica** là bản sao phục vụ mục đích tùy cấu hình.

## Cơ chế và quyết định cần thi

| Yêu cầu | Hướng giải quyết |
|---|---|
| Chịu lỗi AZ | Multi-AZ deployment phù hợp |
| Giảm tải đọc | Read replica/reader endpoint |
| Lambda mở quá nhiều kết nối | RDS Proxy và quản lý connection |
| Không dùng mật khẩu dài hạn | IAM database authentication trên engine hỗ trợ |

Đừng học “mọi Multi-AZ standby đều không đọc được”: điều đó áp dụng mô hình RDS Multi-AZ DB instance truyền thống; Multi-AZ DB cluster có readable standby instances. Aurora reader endpoint phân phối **kết nối**, không bảo đảm chia đều từng query.

IAM DB authentication dùng token có hiệu lực 15 phút để **thiết lập kết nối**; token hết hạn không tự ngắt session đã mở. Cần bật tính năng, cấu hình DB user, IAM `rds-db:connect` và TLS. Lưu password trong Secrets Manager bảo vệ password nhưng không loại bỏ password như IAM auth.

RDS Proxy gom/tái sử dụng kết nối, giảm sức ép từ lượng lớn Lambda executions. Nó không tự làm mọi SQL query nhanh hơn; bottleneck query/index cần xử lý riêng.

## Tình huống song ngữ

**EN:** An application connects to RDS MySQL and must avoid long-term database credentials. Which solution fits?

**VI:** App kết nối RDS MySQL và không được dùng DB credentials dài hạn. Chọn gì?

| | EN | VI |
|---|---|---|
| A | Put the password in an environment variable | Đặt password trong biến môi trường |
| B | Enable IAM DB authentication and use an IAM role | Bật IAM DB auth và dùng IAM role |
| C | Increase the database instance size | Tăng kích thước DB instance |

### Đáp án và giải thích

**B.** Token tạm thay password khi đăng nhập. A vẫn là password dài hạn; C thay đổi hiệu năng, không thay cơ chế xác thực.

## Tự kiểm tra

Chọn giữa replica, Multi-AZ và Proxy theo ba yêu cầu: tải đọc, chịu lỗi, quá nhiều connection.

Nguồn: [IAM DB authentication](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.IAMDBAuth.html), [Multi-AZ deployments](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html), [RDS Proxy](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html).
