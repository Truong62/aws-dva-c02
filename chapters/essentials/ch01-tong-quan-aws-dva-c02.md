# Học DVA-C02 theo cơ chế và tình huống

Bạn không cần nhớ mọi nút trên console. Bạn cần đọc yêu cầu, hiểu đường đi của dữ liệu, nhận ra quyền cần cấp và chọn tính năng đáp ứng đủ các điều kiện.

## Khái niệm cần hiểu

**Region** là khu vực AWS; **Availability Zone (AZ)** là vùng hạ tầng độc lập trong Region. Multi-AZ giúp chịu lỗi một AZ; multi-Region giải quyết bài toán sự cố cả Region. **Edge location** phục vụ nội dung gần người dùng, thường gặp với CloudFront.

**Managed service** nghĩa là AWS quản lý một phần vận hành. Bạn vẫn chịu trách nhiệm về dữ liệu, quyền truy cập và code. Với EC2 bạn quản lý hệ điều hành; với Lambda bạn tập trung vào code và cấu hình thực thi.

**Synchronous**: bên gọi chờ kết quả. **Asynchronous**: bên gọi gửi công việc rồi nhận kết quả sau. **Idempotency**: cùng một yêu cầu được xử lý nhiều lần nhưng không tạo thêm tác dụng nghiệp vụ, chẳng hạn không trừ tiền hai lần.

## Lộ trình học

| Chặng | Bài cần đọc | Câu hỏi phải trả lời được |
|---|---|---|
| Danh tính và quyền | [IAM](/chuong/2/), [CLI/SDK](/chuong/3/), [STS](/chuong/45/) | Ai đang gọi? Được phép làm gì? |
| Một API hoàn chỉnh | [Lambda](/chuong/28/), [API Gateway](/chuong/34/), [SAM](/chuong/36/) | Request đi đâu, response có định dạng gì, triển khai thế nào? |
| Dữ liệu | [S3](/chuong/12/), [DynamoDB](/chuong/31/), [indexes](/chuong/32/) | Lưu ở đâu và truy vấn theo khóa nào? |
| Xử lý sự kiện | [SQS](/chuong/21/), [SNS](/chuong/22/), [Lambda integrations](/chuong/30/) | Ai retry, lọc ở đâu, xử lý trùng thế nào? |
| Triển khai an toàn | [Lambda versions](/chuong/29/), [CDK](/chuong/37/), [CodeDeploy](/chuong/41/), [Pipeline](/chuong/42/) | Test, chia traffic và rollback thế nào? |
| Tìm lỗi và bảo mật | [Metrics](/chuong/24/), [Logs](/chuong/25/), [Tracing](/chuong/26/), [KMS](/chuong/46/), [Secrets](/chuong/47/) | Bằng chứng lỗi nằm đâu, dữ liệu được bảo vệ thế nào? |

Các chương hạ tầng còn lại bổ sung nền để hiểu tình huống; đọc khi gặp khái niệm chưa biết. Phần Đọc thêm cuối mỗi chương dành cho lab và chi tiết triển khai.

## Phạm vi thi và cách tự đánh giá

DVA-C02 có bốn domain: Development 32%, Security 26%, Deployment 24%, Troubleshooting and Optimization 18%. Bài thi có 65 câu trong 130 phút; 50 câu tính điểm và 15 câu không tính điểm, không được đánh dấu. Mốc đạt 720 thuộc thang điểm chuẩn hóa 100–1000, **không đồng nghĩa đúng 72% câu**. [AWS Exam Guide](https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02.html)

Rà soát ngày 23/10/2026: AWS thông báo ngày thi cuối DVA-C02 là 30/11/2026. Hãy đối chiếu mã kỳ thi trên lịch đăng ký; giáo trình này tập trung C02. [Thông báo kỳ thi](https://aws.amazon.com/certification/certified-developer-associate/)

## Tình huống song ngữ

**EN:** An application must remain available if one Availability Zone fails. What should the developer choose?

**VI:** Ứng dụng phải tiếp tục hoạt động khi một AZ gặp sự cố. Nên chọn giải pháp nào?

| | EN | VI |
|---|---|---|
| A | Deploy across multiple AZs | Triển khai trên nhiều AZ |
| B | Increase one instance's memory | Tăng RAM của một instance |
| C | Enable API caching only | Chỉ bật cache API |

### Đáp án và giải thích

**A.** Phải có tài nguyên phục vụ ở AZ còn hoạt động. Tăng RAM cải thiện năng lực một máy; cache không tự tạo khả năng chịu lỗi AZ cho backend.

## Tự kiểm tra

Giải thích khác nhau giữa mất một instance, mất một AZ và mất một Region. Khi làm sai một câu, ghi lại điều kiện quyết định đáp án thay vì chỉ ghi tên dịch vụ.
