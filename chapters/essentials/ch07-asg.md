# Auto Scaling: thêm máy theo tải

## Khái niệm cần hiểu

Auto Scaling Group duy trì nhóm EC2 với **minimum**, **desired** và **maximum capacity**. Launch template mô tả cách tạo instance. ASG tăng/giảm số máy; ALB phân phối traffic tới máy đang có.

## Cơ chế và quyết định cần thi

| Nhu cầu | Cơ chế |
|---|---|
| Giữ CPU trung bình quanh mục tiêu | Target tracking |
| Tăng số máy theo các mức vượt ngưỡng | Step scaling |
| Biết trước giờ tải cao | Scheduled scaling |
| Dự báo theo lịch sử tải | Predictive scaling |

Metric phải liên quan năng lực mỗi instance. Với queue workers, backlog trên mỗi instance thường có ý nghĩa hơn tổng message độc lập với số worker. Khi scale-out, cần thời gian boot và warmup; không coi instance vừa tạo đã lập tức xử lý đầy tải.

Health check EC2 phát hiện vấn đề hạ tầng; khi cần thay máy vì ứng dụng fail, phải cấu hình nguồn health check phù hợp như ELB. Lifecycle hooks cho ứng dụng thời gian chuẩn bị trước vào phục vụ hoặc dọn dẹp trước terminate; hook có timeout và cần hoàn tất.

Đừng để ASG xóa máy duy nhất giữ session hoặc file quan trọng. Tách state ra dịch vụ ngoài trước khi dựa vào scale-in.

## Tình huống song ngữ

**EN:** The application should automatically keep average CPU near 50%. Which scaling policy minimizes configuration?

**VI:** Ứng dụng cần tự giữ CPU trung bình gần 50%. Policy nào ít cấu hình nhất?

| | EN | VI |
|---|---|---|
| A | Target tracking | Bám theo giá trị mục tiêu |
| B | A daily fixed schedule | Lịch cố định mỗi ngày |
| C | Manually increase desired capacity | Tăng desired capacity bằng tay |

### Đáp án và giải thích

**A.** Nó phản ứng theo metric mục tiêu. B phù hợp tải dự đoán theo giờ, không phản ứng trực tiếp với CPU; C không tự động.

## Tự kiểm tra

Tăng maximum capacity có tự tạo thêm instance ngay không? Không: đó là trần; desired/scaling policy quyết định nhu cầu thực tế.

Nguồn: [Target tracking](https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html), [Lifecycle hooks](https://docs.aws.amazon.com/autoscaling/ec2/userguide/lifecycle-hooks.html).
