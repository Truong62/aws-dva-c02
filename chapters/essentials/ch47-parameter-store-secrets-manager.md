# Parameter Store, Secrets Manager và cấu hình runtime

## Khái niệm cần hiểu

**Parameter Store** lưu named parameters; **SecureString** mã hóa giá trị bằng KMS. **Secrets Manager** quản lý secrets cùng các khả năng rotation/replication. **AppConfig** triển khai cấu hình động có kiểm soát. Không chọn chỉ dựa vào từ “config”; đọc yêu cầu vòng đời.

## Cơ chế và quyết định cần thi

| Nhu cầu | Hướng chọn |
|---|---|
| Parameter thông thường, hierarchy/version | Parameter Store |
| Secret có rotation tự động/replication | Secrets Manager |
| Thay giới hạn, feature flags runtime có rollout/rollback | AppConfig |
| Loại bỏ password DB trên engine hỗ trợ | IAM DB authentication |

Lambda đọc secret bằng execution role và quyền KMS cần thiết. Environment variables đã mã hóa at rest; chuyển sang secret store phục vụ quản lý quyền/vòng đời, không phải vì env vars mặc định là plaintext trên storage.

Cache secret/config giảm API calls nhưng phải có refresh phù hợp. Đổi secret trong store không tự cập nhật biến môi trường đã inject vào ECS task hoặc mọi process giữ cache. CloudFormation dynamic reference được resolve trong quá trình triển khai phù hợp, không phải cơ chế live reload.

Secrets Manager replication cấu hình từ secret nguồn, chọn Region đích và key ở Region đích. Rotation secret nguồn có thể propagate tới replicas; không cần tự chép secret qua S3. Replicate secret không tự chuyển DB endpoint trong giá trị secret thành endpoint regional mới.

## Tình huống song ngữ

**EN:** Credentials must be stored encrypted in Parameter Store. Which parameter type should be used?

**VI:** Credentials cần lưu mã hóa trong Parameter Store. Dùng kiểu nào?

| | EN | VI |
|---|---|---|
| A | SecureString | Giá trị mã hóa bằng KMS |
| B | StringList only | Chỉ danh sách chuỗi |
| C | A KMS alias instead of a parameter | Dùng alias KMS thay parameter |

### Đáp án và giải thích

**A.** App lấy giá trị với decryption và quyền phù hợp. B không tự bảo vệ như SecureString; C không phải kho credentials. Khi yêu cầu rotation/secret lifecycle, ưu tiên đánh giá Secrets Manager.

## Tự kiểm tra

Xoay KMS key có tự đổi mật khẩu SFTP không? Secret đã đổi nhưng app vẫn dùng giá trị cũ: kiểm tra cache/injection ở đâu?

Nguồn: [Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html), [Secret replication](https://docs.aws.amazon.com/secretsmanager/latest/userguide/replicate-secrets.html).
