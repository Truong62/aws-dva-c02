# AppSync và Amplify: API dữ liệu và công cụ ứng dụng

## Khái niệm cần hiểu

AppSync GraphQL API cho client yêu cầu các fields cần thiết. **Schema** định nghĩa kiểu dữ liệu/operations; **resolver** nối field với backend; **query** đọc, **mutation** thay đổi, **subscription** nhận cập nhật thời gian thực theo cơ chế cấu hình.

Amplify cung cấp công cụ/library và dịch vụ hosting để phát triển, triển khai ứng dụng. Nó có thể kết hợp Cognito/AppSync/S3; không phải một database thay thế tất cả các service đó.

## Cơ chế và quyết định cần thi

| Yêu cầu | Hướng chọn |
|---|---|
| GraphQL, client chọn fields, subscriptions | AppSync |
| REST/HTTP proxy với integration cụ thể | API Gateway |
| Hosting web gắn Git/build/preview | Amplify Hosting |
| Đăng nhập người dùng | Cognito qua tích hợp phù hợp |

Resolver có thể gọi data source trực tiếp, không phải lúc nào cũng cần Lambda ở giữa. IAM service role của data source và auth của người gọi API là hai lớp khác nhau. API key đơn thuần không cung cấp phân quyền từng user giống Cognito/IAM.

Khi dữ liệu được sửa offline hoặc đồng thời, phải có chiến lược conflict resolution; “realtime” không tự giải quyết mọi xung đột. Cache API cũng phải xét người dùng và trường dữ liệu để tránh trả dữ liệu sai quyền.

## Tình huống song ngữ

**EN:** A mobile app needs a GraphQL schema and live updates through subscriptions. Which service fits?

**VI:** App mobile cần GraphQL schema và cập nhật trực tiếp qua subscriptions. Dùng gì?

| | EN | VI |
|---|---|---|
| A | AWS AppSync | Dịch vụ API GraphQL |
| B | AWS CodeDeploy | Dịch vụ deployment |
| C | Amazon EBS | Block storage |

### Đáp án và giải thích

**A.** Đáp ứng mô hình API được yêu cầu. B triển khai code; C lưu dữ liệu dạng block, không cung cấp GraphQL API.

## Tự kiểm tra

Schema và resolver khác nhau ở đâu? AppSync auth và quyền resolver gọi DynamoDB có phải một policy không?

Nguồn: [AppSync GraphQL concepts](https://docs.aws.amazon.com/appsync/latest/devguide/designing-a-graphql-api.html), [Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html).
