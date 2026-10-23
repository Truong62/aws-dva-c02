# IAM: ai gọi và được phép làm gì?

## Khái niệm cần hiểu

**Authentication** xác định danh tính; **authorization** xác định quyền. IAM quản lý danh tính và quyền truy cập tài nguyên AWS. Một request được ký bằng credentials của một **principal** cụ thể, chẳng hạn IAM user hoặc assumed-role session.

| Khái niệm | Ý nghĩa |
|---|---|
| User | Danh tính IAM có thể có credentials dài hạn |
| Group | Nhóm IAM users để quản lý quyền chung; không gắn vào EC2 |
| Role | Danh tính có thể được assume để nhận credentials tạm thời |
| Policy | Tài liệu quy định hành động nào được phép hoặc bị cấm |
| Trust policy | Ai được assume role này |
| Permissions policy | Sau khi assume, role được thực hiện hành động gì |

Ứng dụng trên EC2/Lambda/ECS nên dùng role thay vì nhúng access key. Đội ngũ truy cập nhiều account nên dùng IAM Identity Center với permission sets; không chia sẻ một tài khoản admin cho cả nhóm.

## Cơ chế cấp quyền

Một policy thường có **Effect**, **Action**, **Resource** và tùy chọn **Condition**. Identity-based policy gắn vào user/group/role; resource-based policy gắn vào tài nguyên và chỉ định principal được áp dụng.

Ví dụ Lambda cần đọc S3: function dùng execution role; permissions policy cho role có `s3:GetObject` trên object ARN. API Gateway được gọi Lambda lại là chiều quyền khác, thường được khai báo bằng resource-based policy của function.

```text
API Gateway → quyền invoke Lambda → Lambda
Lambda → execution role → quyền GetObject → S3
```

**Execution role không phải authorizer.** Role cấp quyền cho code đang chạy gọi AWS. Authorizer quyết định request của người dùng có được đi vào API không.

## Đánh giá quyền theo đúng thứ tự

1. Xác định credentials nào thực sự ký request.
2. Xác định các policy áp dụng: identity, resource và các giới hạn như SCP, boundary, session policy.
3. Explicit Deny phù hợp sẽ chặn. Không có quyền Allow cần thiết thì mặc định bị từ chối.

Đừng trộn policy của hai identity khác nhau. Nếu SDK dùng admin credentials trong file thay vì instance role, Deny của instance role không tự áp vào request của admin đó. Thứ tự provider phụ thuộc công cụ/SDK; kiểm tra caller thực tế trước.

**Permissions boundary và SCP đặt giới hạn quyền, không tự cấp quyền.** Cross-account thường cần cấp phép ở cả phía caller và tài nguyên/role đích. Các trường hợp resource policy cấp trực tiếp cho session có quy tắc riêng; tránh công thức “mọi policy luôn cộng lại”. [AWS policy evaluation](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)

## Tình huống song ngữ

**EN:** A Lambda function must only read objects from a specific S3 bucket. Where should the developer grant its runtime permissions?

**VI:** Lambda chỉ cần đọc object trong một S3 bucket cụ thể. Developer nên cấp quyền thực thi ở đâu?

| | EN | VI |
|---|---|---|
| A | Its execution role | Execution role của Lambda |
| B | An API Gateway authorizer | Authorizer của API Gateway |
| C | An IAM group attached to Lambda | IAM group gắn vào Lambda |

### Đáp án và giải thích

**A.** Role cung cấp danh tính và quyền để function gọi S3. B xác thực người gọi API, không cấp quyền cho code đọc bucket. C không hợp lệ vì Lambda không sử dụng IAM group làm execution role. SAM có thể tạo role và quyền này từ `S3ReadPolicy`; xem [SAM](/chuong/36/).

## Tự kiểm tra

- Trust policy và permissions policy trả lời hai câu hỏi nào?
- Lambda được gọi thành công nhưng đọc S3 bị AccessDenied: kiểm tra chiều quyền nào?
- Vì sao Deny trên role EC2 không nhất thiết chặn request dùng credentials khác?

Nguồn: [Lambda execution role](https://docs.aws.amazon.com/lambda/latest/dg/lambda-intro-execution-role.html), [IAM roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html).
