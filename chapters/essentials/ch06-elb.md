# Load Balancer: phân phối request và kiểm tra backend

## Khái niệm cần hiểu

**Listener** nhận traffic trên port/protocol. **Target group** chứa các backend và health check. **Rule** chọn target group. Load balancer phân phối request, không lưu hộ session ứng dụng.

| Loại | Điểm cần nhận ra |
|---|---|
| ALB | HTTP/HTTPS, routing theo host/path, hỗ trợ Lambda target |
| NLB | Traffic tầng transport, cần IP tĩnh hoặc TCP/TLS/UDP theo cấu hình hỗ trợ |
| GWLB | Chèn thiết bị kiểm tra mạng như firewall |

## Cơ chế và quyết định cần thi

Health check kiểm tra backend có phục vụ được không. Nếu health check sai path/port hoặc security group chặn, một app vẫn chạy có thể bị đánh dấu unhealthy. Debug cả listener, target registration và health check trước khi thay code.

**Sticky session** cố gắng giữ client vào cùng target; không backup dữ liệu trong memory. Muốn EC2 hỏng mà session vẫn còn, đặt session vào kho dữ liệu dùng chung như DynamoDB hoặc cache có cấu hình HA phù hợp.

**Deregistration delay/draining** cho request đang xử lý thời gian hoàn tất khi target rời nhóm. Nó không cứu session nếu máy chết đột ngột. **TLS termination** tại ALB giải mã traffic ở load balancer; muốn mã hóa tiếp tới target phải cấu hình HTTPS ở chặng đó.

## Tình huống song ngữ

**EN:** Users lose sessions when an EC2 target fails. What addresses the cause?

**VI:** Người dùng mất session khi EC2 target hỏng. Cách nào xử lý nguyên nhân?

| | EN | VI |
|---|---|---|
| A | Enable sticky sessions only | Chỉ bật sticky sessions |
| B | Store session state in DynamoDB | Lưu session trong DynamoDB |
| C | Increase deregistration delay only | Chỉ tăng draining time |

### Đáp án và giải thích

**B.** Session tồn tại ngoài instance, instance khác có thể đọc lại. A giữ affinity nhưng không lưu bền dữ liệu; C hỗ trợ rút target có kế hoạch, không bảo đảm khi máy hỏng.

## Tự kiểm tra

Phân biệt routing, health check, stickiness và session persistence. Với Lambda target, ALB và NLB có thay thế trực tiếp nhau được không?

Nguồn: [ALB target groups](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html), [Sticky sessions](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-target-group-attributes.html).
