# Route 53: DNS và chọn endpoint

## Khái niệm cần hiểu

DNS chuyển tên miền thành địa chỉ/đích truy cập. Route 53 quản lý DNS records và routing policies. DNS không proxy request và không thay API Gateway hay load balancer.

## Cơ chế và quyết định cần thi

| Policy | Mục đích |
|---|---|
| Simple | Một cách trả lời DNS cơ bản |
| Weighted | Trả các đích theo trọng số |
| Latency | Chọn đích dựa trên độ trễ tới các Region cấu hình |
| Failover | Primary/secondary dựa trên health |
| Geolocation | Theo vị trí người dùng |

**TTL** khiến resolver/client giữ câu trả lời DNS một khoảng thời gian. Đổi record không làm mọi client đổi đích ngay. Weighted DNS không bảo đảm đúng 10% từng HTTP request hoặc 10% người dùng vì caching và tái sử dụng kết nối.

**Alias record** là khả năng Route 53 trỏ tới các tài nguyên AWS được hỗ trợ và dùng được ở zone apex. **CNAME** thông thường không dùng tại apex. Health check kiểm tra khả dụng; Logs Insights mới tìm application logs, X-Ray mới theo dõi trace.

## Tình huống song ngữ

**EN:** A domain should route clients to a secondary endpoint when the primary fails health checks. Which policy fits?

**VI:** Tên miền cần chuyển client sang endpoint phụ khi endpoint chính fail health check. Policy nào phù hợp?

| | EN | VI |
|---|---|---|
| A | Failover routing | Định tuyến dự phòng |
| B | Simple routing without health checks | Simple không health check |
| C | Increase the DNS TTL | Tăng TTL DNS |

### Đáp án và giải thích

**A.** Policy dùng health để lựa chọn primary/secondary. B không có logic yêu cầu; C có thể làm client giữ đích cũ lâu hơn.

## Tự kiểm tra

Vì sao thay DNS không phải rollback tức thì cho mọi request? Nếu cần canary Lambda, weighted alias của Lambda khác weighted DNS ở đâu?

Nguồn: [Route 53 routing policies](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html).
