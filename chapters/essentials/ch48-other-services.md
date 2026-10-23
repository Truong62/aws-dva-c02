# AppConfig và các dịch vụ cần nhận diện

## Khái niệm cần hiểu

AppConfig quản lý **dynamic configuration**: dữ liệu thay đổi hành vi ứng dụng mà không đóng gói lại code. **Validator** kiểm tra cấu hình; **deployment strategy** điều khiển rollout; **agent/extension** lấy và cache dữ liệu cho ứng dụng.

## Cơ chế và quyết định cần thi

Lambda có thể dùng AppConfig Agent Lambda extension và gọi localhost để lấy config. ECS có thể chạy agent theo mô hình container/sidecar phù hợp. Agent lấy dữ liệu giúp giảm code tích hợp, nhưng ứng dụng vẫn phải đọc và áp dụng thay đổi; config được tải về không tự sửa biến đang giữ trong memory của app.

JSON config 6 KB không vừa tổng giới hạn Lambda environment variables 4 KB. Cấu hình đóng trong deployment package phải cập nhật package khi đổi. AppConfig phù hợp runtime config có validation, gradual rollout và rollback theo health signal.

| Dịch vụ | Nhận diện đúng nhu cầu |
|---|---|
| SES | Gửi email ứng dụng |
| ACM | Quản lý TLS certificates cho integrations hỗ trợ |
| OpenSearch | Tìm kiếm và phân tích logs/data đã index |
| Athena | SQL trên dữ liệu như S3 |
| AWS Batch | Lập lịch batch jobs trên compute phù hợp |
| Amazon MQ | Broker cho giao thức/workload message broker tương thích |
| Amazon Q Developer | Hỗ trợ phát triển, giải thích code và tạo tests; output vẫn cần review/test |

Đừng dựng OpenSearch chỉ để tìm vài lỗi trong CloudWatch Logs nếu Logs Insights đủ. Đừng đưa service mới vào chỉ vì tên giống yêu cầu; xét dữ liệu đầu vào, đầu ra và overhead.

## Tình huống song ngữ

**EN:** An ECS application must update its connection limits at runtime without redeploying containers. Which service is most relevant?

**VI:** App ECS cần cập nhật giới hạn kết nối runtime mà không deploy lại containers. Dịch vụ nào phù hợp nhất?

| | EN | VI |
|---|---|---|
| A | AppConfig with an agent and runtime consumption | AppConfig, agent và app đọc cấu hình runtime |
| B | Store the new value only inside the image | Chỉ ghi giá trị mới vào image |
| C | A CloudTrail trail | Trail CloudTrail |

### Đáp án và giải thích

**A.** Tách cấu hình khỏi code và hỗ trợ triển khai có kiểm soát. B cần image/task mới; C audit, không phân phối runtime config.

## Tự kiểm tra

Config đã tới agent nhưng app chỉ đọc lúc startup thì có cập nhật không? AppConfig khác secret rotation ở đâu?

Nguồn: [AppConfig](https://docs.aws.amazon.com/appconfig/latest/userguide/what-is-appconfig.html), [DVA-C02 development scope](https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02-domain1.html).
