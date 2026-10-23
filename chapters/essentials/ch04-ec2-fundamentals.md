# EC2: nền tảng chạy ứng dụng trên máy chủ

## Khái niệm cần hiểu

EC2 cung cấp virtual machine. **AMI** là ảnh hệ điều hành/phần mềm để khởi tạo; **instance type** quyết định tài nguyên; **user data** chạy công việc khởi tạo; **security group** kiểm soát traffic mạng. Bạn vẫn quản lý hệ điều hành và ứng dụng.

## Cơ chế và quyết định cần thi

Ứng dụng EC2 truy cập AWS bằng **IAM role qua instance profile**. Instance profile chứa role, không chứa IAM user/group. SDK có thể lấy credentials tạm thời từ instance metadata; không cần chép access key vào code.

Phân biệt hai lớp: security group cho phép kết nối mạng; IAM cho phép API action. Mở cổng không cấp quyền đọc S3 và thêm IAM policy không mở kết nối TCP tới database.

Security group có allow rules và stateful: traffic phản hồi của kết nối được phép không cần rule chiều ngược riêng. NACL thuộc subnet, stateless và hỗ trợ deny; cần xét cả hai chiều. IMDSv2 dùng session token giúp bảo vệ metadata, nhưng không thay thế thiết kế chống SSRF.

On-Demand phù hợp nhu cầu linh hoạt. Spot có thể bị thu hồi, chỉ phù hợp công việc chịu gián đoạn. Không dùng việc tăng kích thước một instance để giải quyết yêu cầu chịu lỗi cả AZ.

## Tình huống song ngữ

**EN:** An application on EC2 must read S3 without storing long-term keys. What should it use?

**VI:** Ứng dụng EC2 cần đọc S3 mà không lưu key dài hạn. Nên dùng gì?

| | EN | VI |
|---|---|---|
| A | IAM role through an instance profile | IAM role qua instance profile |
| B | An IAM group attached to EC2 | IAM group gắn EC2 |
| C | A shared administrator access key | Access key admin dùng chung |

### Đáp án và giải thích

**A.** Role cấp credentials tạm thời và quyền đọc phù hợp. Group không gắn làm instance profile; shared key làm tăng rủi ro và khó truy vết.

## Tự kiểm tra

AccessDenied khác connection timeout thế nào? Nếu instance chết, session trong memory có còn không? Xem [session và cache](/chuong/9/).

Nguồn: [IAM roles for EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html), [Security groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html).
