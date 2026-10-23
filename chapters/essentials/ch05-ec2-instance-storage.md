# EBS, EFS và Instance Store: chọn đúng nơi lưu file

## Khái niệm cần hiểu

**Block storage** cung cấp volume để hệ điều hành tạo filesystem. **File storage** cung cấp filesystem dùng chung. **Object storage** lưu object truy cập qua API. Đây là ba kiểu truy cập khác nhau, không chỉ là ba mức giá.

| Dịch vụ | Cách dùng | Phạm vi cần nhớ |
|---|---|---|
| EBS | Block volume cho EC2 | Volume gắn với một AZ |
| Instance Store | Disk cục bộ trên host | Tạm thời; không giữ dữ liệu khi host/instance bị mất |
| EFS | Shared NFS filesystem | Nhiều client truy cập qua mạng; có Regional và One Zone |
| S3 | Object qua API | Kho object, không phải block volume |

## Cơ chế và quyết định cần thi

EBS persist độc lập với việc reboot, nhưng xóa instance có thể xóa volume nếu `DeleteOnTermination` bật. Snapshot giúp backup/khôi phục; volume mới phải ở AZ phù hợp để attach.

EBS Multi-Attach không biến volume thành shared filesystem tự xử lý ghi đồng thời; workload và filesystem phải hỗ trợ. Không dùng EBS để mount trực tiếp vào Lambda.

Lambda cần dùng chung libraries/reference data và cập nhật độc lập với code → EFS qua **access point**, VPC connectivity, mount targets, security groups và quyền filesystem/IAM phù hợp. Chỉ có quyền IAM chưa đủ nếu đường mạng NFS bị chặn. App cũng phải xử lý việc đọc lại dữ liệu khi cần; module đã cache trong process không tự reload khi file đổi.

## Tình huống song ngữ

**EN:** Multiple Lambda functions in a VPC need shared files updated by another team without redeploying function code. Which storage fits?

**VI:** Nhiều Lambda trong VPC cần file dùng chung do team khác cập nhật, không deploy lại code. Chọn gì?

| | EN | VI |
|---|---|---|
| A | Each function's /tmp | /tmp riêng của từng function |
| B | EFS through an access point | EFS qua access point |
| C | Attach an EBS volume to Lambda | Gắn EBS vào Lambda |

### Đáp án và giải thích

**B.** EFS cung cấp filesystem chia sẻ. `/tmp` thuộc từng execution environment; Lambda không hỗ trợ attach EBS theo cách nêu trong C.

## Tự kiểm tra

Vì sao persistent storage chưa chắc là shared storage? Vì sao S3 presigned URL phù hợp tải video hơn EFS access point?

Nguồn: [Lambda file systems](https://docs.aws.amazon.com/lambda/latest/dg/configuration-filesystem.html), [EBS volumes](https://docs.aws.amazon.com/ebs/latest/userguide/ebs-volumes.html).
