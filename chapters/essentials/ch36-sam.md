# SAM: từ YAML đến ứng dụng serverless

## Khái niệm cần hiểu

**YAML** là định dạng dữ liệu. Viết chữ bất kỳ vào YAML không làm AWS tự tạo tài nguyên. **SAM template specification** quy định các thuộc tính AWS hiểu; **SAM CLI** là công cụ build/test/deploy; **CloudFormation** tạo và quản lý các tài nguyên sau khi SAM transform mở rộng template.

```text
YAML có khai báo SAM
       ↓ transform
CloudFormation resources
       ↓ triển khai
Lambda + IAM role + API/queue/table theo khai báo
```

Template SAM dùng `Transform: AWS::Serverless-2016-10-31`. Có thể trộn `AWS::Serverless::Function` và resource CloudFormation thông thường như `AWS::S3::Bucket` trong cùng template.

## SAM có tự tạo quyền không?

Nếu function không chỉ định `Role`, SAM có thể tạo execution role cho nó. Bạn khai báo thêm quyền cần thiết bằng `Policies`. Nếu đã chỉ định ARN trong `Role`, SAM dùng role đó và bỏ qua `Policies` của function; bạn quản lý quyền trên role đã cung cấp.

**Policy template** như `S3ReadPolicy` là mẫu có sẵn của SAM, không phải cú pháp YAML phổ thông hay tên tùy ý. Đoạn sau nằm trong `Properties` của function:

```yaml
Policies:
  - S3ReadPolicy:
      BucketName: !Ref DataBucket
```

SAM tạo IAM statements cho phép đọc bucket `DataBucket` và đưa vào role được tạo. `!Ref` là intrinsic function lấy giá trị resource/parameter. Chỉ tạo Lambda và S3 cùng template không tự cấp quyền đọc; phải khai báo quyền. Khi mẫu chưa phù hợp, dùng inline IAM policy hoặc managed policy. Mẫu tiện dụng nhưng vẫn cần xem actions và phạm vi có đúng nhu cầu không. [Function properties](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-resource-function.html), [Policy templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-template-list.html).

## Những lệnh phải phân biệt

| Lệnh | Mục đích |
|---|---|
| `sam init` | Khởi tạo dự án |
| `sam build` | Chuẩn bị code và dependencies |
| `sam local invoke` | Test một event tại local bằng môi trường container |
| `sam local start-api` | Chạy endpoint local để test API |
| `sam package` | Upload artifact, tạo template tham chiếu artifact |
| `sam deploy` | Triển khai stack; có thể thực hiện packaging nên không luôn cần gọi package riêng |

ZIP artifacts dùng S3, container images dùng ECR. Thứ tự khái niệm là **build → package → deploy**; triển khai thường dùng `sam build` rồi `sam deploy --guided`. Local test không chứng minh quyền IAM/network trên AWS đã đúng.

`AutoPublishAlias` và `DeploymentPreference` hỗ trợ triển khai Lambda theo canary/linear qua CodeDeploy. Hook và CloudWatch alarms giúp kiểm tra/rollback. `Globals` giảm cấu hình lặp: primitive bị thay thế, maps merge, lists được cộng với phần global đứng trước. [Globals](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy-globals.html)

## Tình huống song ngữ

**EN:** A SAM application contains Lambda and S3. Lambda must only read bucket objects. What should the developer configure?

**VI:** Ứng dụng SAM có Lambda và S3. Lambda chỉ cần đọc object. Cấu hình nào phù hợp?

| | EN | VI |
|---|---|---|
| A | Add S3ReadPolicy under the function's Policies | Thêm S3ReadPolicy trong Policies của function |
| B | Attach a bucket policy to the function | Gắn bucket policy vào function |
| C | Add another Lambda authorizer | Thêm Lambda authorizer |

### Đáp án và giải thích

**A**, khi để SAM tạo execution role. B sai vị trí: bucket policy gắn vào bucket. C kiểm soát người gọi API, không cấp quyền function đọc S3.

## Tự kiểm tra

YAML, SAM CLI và CloudFormation làm ba việc gì? Nếu đã có `Role`, tại sao thêm `Policies` không thay đổi quyền? Khi deploy image, vì sao chọn ECR thay vì S3?

Nguồn bổ sung: [Deploy a SAM application](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-deploying.html).
