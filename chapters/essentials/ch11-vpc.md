# VPC cho developer: kết nối trước, quyền sau

## Khái niệm cần hiểu

VPC là mạng riêng logic. **Subnet** nằm trong một AZ; **route table** chọn đường đi; **security group** kiểm soát kết nối của tài nguyên; **NACL** lọc traffic của subnet. Một lời gọi dịch vụ cần cả đường mạng và quyền phù hợp.

## Cơ chế và quyết định cần thi

**Public subnet** có route tới Internet Gateway; tài nguyên vẫn cần địa chỉ và cấu hình phù hợp để truy cập internet. Đặt Lambda vào public subnet không tự cấp public IP cho Lambda.

Lambda trong VPC cần gọi public API thường dùng private subnet với route qua NAT gateway. NAT cho outbound không tự cho internet chủ động kết nối vào function. Lambda truy cập DB private cần VPC/subnet/security groups phù hợp; không nhất thiết cần NAT chỉ để gọi DB đó.

**VPC endpoint** cho truy cập dịch vụ hỗ trợ mà không đi qua internet gateway/NAT:

| Loại | Điểm cần hiểu |
|---|---|
| Gateway endpoint | S3/DynamoDB; gắn route table |
| Interface endpoint | ENI/private IP qua PrivateLink; xét security group và DNS |

Endpoint policy giới hạn truy cập qua endpoint, không tự cấp toàn bộ quyền IAM. Private API Gateway dùng interface endpoint; VPC Link là kết nối API Gateway tới backend private, không đồng nghĩa private API endpoint.

## Tình huống song ngữ

**EN:** A VPC-connected Lambda can reach RDS but cannot call a public payment API. What should be checked first?

**VI:** Lambda trong VPC gọi được RDS nhưng không gọi được API thanh toán public. Kiểm tra gì trước?

| | EN | VI |
|---|---|---|
| A | Outbound routing, NAT, security rules and DNS | Route outbound, NAT, security rules và DNS |
| B | DynamoDB read capacity | Read capacity DynamoDB |
| C | The Lambda alias weight | Trọng số alias Lambda |

### Đáp án và giải thích

**A.** Kết nối nội bộ thành công không chứng minh có đường ra internet. B và C không giải quyết network connectivity này.

## Tự kiểm tra

Có IAM Allow nhưng bị timeout thì xem gì? Có đường mạng nhưng AccessDenied thì xem gì?

Nguồn: [Lambda internet access from VPC](https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc-internet.html), [VPC endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/concepts.html).
