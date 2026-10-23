# STS và federation: quyền tạm thời qua account

## Khái niệm cần hiểu

STS cấp temporary credentials. **AssumeRole** tạo session của role; **federation** dùng identity provider để truy cập AWS; **permission set** trong IAM Identity Center mô tả quyền dùng cho việc cấp access tới accounts.

## Cơ chế và quyết định cần thi

```text
Caller → được phép AssumeRole + role tin caller → STS credentials → AWS API
```

Cross-account AssumeRole thường cần caller được phép `sts:AssumeRole` và trust policy của role đích chấp nhận caller. Sau khi assume, requests dùng quyền role/session, không cộng toàn bộ quyền user gốc.

**Session policy** giới hạn phiên; **permissions boundary** đặt trần identity permissions; **SCP** đặt rào quyền trong Organizations. Chúng không tự cấp quyền. Explicit Deny áp dụng vẫn chặn.

**ExternalId** giúp chống confused deputy khi bên thứ ba assume role cho nhiều khách. Không coi ExternalId là password duy nhất thay trust policy. **ABAC** dùng attributes/tags để quyết định quyền; **RBAC** tổ chức theo roles.

Đội dev nhiều account nên dùng Identity Center với permission sets/groups thay quản lý từng access key dài hạn. User pool dùng cho người dùng ứng dụng; Identity Center phục vụ workforce access, hai nhóm bài toán khác nhau.

## Tình huống song ngữ

**EN:** Developers need centrally managed access to repositories across several AWS accounts. Which approach reduces administration?

**VI:** Dev cần truy cập repositories ở nhiều account với quản lý tập trung. Cách nào ít vận hành?

| | EN | VI |
|---|---|---|
| A | IAM Identity Center permission sets | Permission sets qua Identity Center |
| B | Share one administrator key | Chia sẻ một key admin |
| C | Manually distribute permanent keys per developer/account | Phát key dài hạn thủ công từng người/account |

### Đáp án và giải thích

**A.** Cấp/thu hồi quyền tập trung và dùng sessions tạm. B khó audit và quá quyền; C tăng quản lý vòng đời credentials.

## Tự kiểm tra

AssumeRole thành công có nghĩa đọc mọi S3 bucket được không? ExternalId giải quyết vấn đề gì?

Nguồn: [Cross-account role access](https://docs.aws.amazon.com/IAM/latest/UserGuide/tutorial_cross-account-with-roles.html), [Identity Center permission sets](https://docs.aws.amazon.com/singlesignon/latest/userguide/permissionsetsconcept.html).
