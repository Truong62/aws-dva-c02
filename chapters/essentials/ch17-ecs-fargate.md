# ECS và Fargate: chạy và duy trì containers

## Khái niệm cần hiểu

**Task definition** mô tả image, CPU/memory, network và role. **Task** là lần chạy định nghĩa đó. **Service** duy trì số task và thực hiện deployment. **Cluster** nhóm tài nguyên logic. Fargate cung cấp compute để không phải quản lý EC2 hosts.

## Cơ chế và quyết định cần thi

| Thành phần | Trách nhiệm |
|---|---|
| Task execution role | Agent pull ECR image, đưa logs, lấy secret khi khởi chạy theo cấu hình |
| Task role | Code trong container gọi S3/DynamoDB/các AWS API |
| Capacity provider | Chọn nguồn compute để đặt tasks |
| AppConfig agent | Lấy/cache cấu hình động cho ứng dụng |

Fargate dùng `awsvpc`, mỗi task có network interface; cần security group và route phù hợp. Health checks, task count và deployment settings quyết định khả dụng khi thay task.

`FARGATE` và `FARGATE_SPOT` là providers có sẵn; associate với cluster bằng `PutClusterCapacityProviders`. `base` đặt số task tối thiểu trên một provider, `weight` phân phối phần còn lại. **Không có ngữ nghĩa “provider 2 tự failover cho provider 1”.** Spot có thể gián đoạn và thiếu capacity; workloads quan trọng cần thiết kế baseline, redundancy và retry phù hợp.

Cluster có thể có EC2 và Fargate providers nhưng một strategy không trộn hai họ đó. Migration cần xem giới hạn service hiện tại và triển khai service/task tương thích; chỉ associate providers chưa thực hiện xong migration.

## Tình huống song ngữ

**EN:** ECS application code needs S3 access. Which role grants those application permissions?

**VI:** Code ứng dụng trong ECS cần gọi S3. Role nào cấp quyền này?

| | EN | VI |
|---|---|---|
| A | Task role | Role cho code của task |
| B | Only the task execution role | Chỉ execution role của task |
| C | The container image tag | Tag image |

### Đáp án và giải thích

**A.** B phục vụ tác vụ hạ tầng của agent, không phải danh tính runtime để app tự gọi S3. C là nhãn image, không cấp quyền.

## Tự kiểm tra

Đổi max connections không cần restart container: AppConfig giúp gì và app phải làm gì để áp dụng cấu hình mới?

Nguồn: [Task IAM role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html), [Fargate capacity providers](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/fargate-capacity-providers.html).
