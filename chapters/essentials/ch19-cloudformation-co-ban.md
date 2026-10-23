# CloudFormation: quản lý hạ tầng bằng template

## Khái niệm cần hiểu

**Template** mô tả trạng thái tài nguyên mong muốn bằng YAML/JSON. **Stack** là tập tài nguyên được triển khai và quản lý cùng nhau. **Logical ID** nhận diện resource trong template; **physical ID** là tài nguyên thật AWS tạo ra.

## Cơ chế và quyết định cần thi

| Thành phần | Chức năng |
|---|---|
| Resources | Khai báo tài nguyên |
| Parameters | Nhận giá trị đầu vào |
| Outputs | Xuất giá trị như endpoint/ARN |
| Conditions | Quyết định tạo/cấu hình có điều kiện |
| Ref / GetAtt | Tham chiếu giá trị resource |

**Change set** cho xem thay đổi dự kiến trước khi execute. **Drift detection** so sánh trạng thái thật với cấu hình được quản lý, tìm thay đổi ngoài CloudFormation. Hai tính năng không thay thế nhau.

`Ref`/`GetAtt` tạo dependency ngầm. `DependsOn` khai báo dependency bổ sung; nó không cấp IAM quyền hay sửa lỗi tài nguyên bị sửa tay. Cập nhật thuộc tính có thể update tại chỗ hoặc replace resource, phải xem change set.

Triển khai ứng dụng EC2 bằng template có thể dùng `cfn-init` để cài/cấu hình phần mềm, `cfn-signal` báo kết quả và CreationPolicy chờ tín hiệu. Chỉ tạo EC2 không chứng minh app đã khởi động thành công.

## Tình huống song ngữ

**EN:** Engineers manually changed security groups managed by a stack. Which operation identifies the differences?

**VI:** Engineers sửa tay security groups do stack quản lý. Thao tác nào phát hiện khác biệt?

| | EN | VI |
|---|---|---|
| A | Drift detection | Phát hiện sai lệch |
| B | Create a change set only | Chỉ tạo change set |
| C | Add a Conditions section | Thêm Conditions |

### Đáp án và giải thích

**A.** Drift đối chiếu trạng thái thực tế cho các resource/properties được hỗ trợ. B xem thay đổi dự kiến của lần update; C là logic của template.

## Tự kiểm tra

Template, stack và change set khác nhau thế nào? Tại sao stack update thành công chưa chắc method API mới có hiệu lực? Xem [API Gateway](/chuong/34/).

Nguồn: [CloudFormation concepts](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cloudformation-concepts.html), [Drift detection](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-stack-drift.html).
