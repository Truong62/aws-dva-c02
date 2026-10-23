# CloudFormation nâng cao: rollback và vòng đời tài nguyên

## Khái niệm cần hiểu

**Rollback** cố đưa tài nguyên về trạng thái trước operation thất bại. **UPDATE_ROLLBACK_FAILED** nghĩa là bước quay lui cũng thất bại, không chỉ đơn giản “template sai”. **DELETE_FAILED** nghĩa là có tài nguyên chưa xóa được.

## Cơ chế và quyết định cần thi

Đọc stack events và status reason của resource lỗi đầu tiên. Resource bị xóa/sửa ngoài stack là một nguyên nhân rollback fail, nhưng thiếu quyền, quota và dependency cũng có thể gây lỗi. Không kết luận mọi rollback fail đều do drift.

| Cơ chế | Khi dùng |
|---|---|
| Continue update rollback | Tiếp tục sau khi sửa nguyên nhân rollback fail |
| DeletionPolicy: Retain | Giữ tài nguyên khi nó bị loại khỏi stack theo hành vi policy |
| UpdateReplacePolicy | Quy định xử lý tài nguyên cũ khi replacement |
| Retain resources khi retry delete | Bỏ qua resource chưa xóa được để hoàn tất xóa stack |
| Nested stacks / exports | Tổ chức và chia sẻ hạ tầng có quản lý dependency |

Stack ở DELETE_FAILED không phải lúc nào cũng update template được để thêm Retain. Có thể retry delete và chọn giữ resource lỗi; kiểm tra rồi cleanup thủ công. AWS cũng có force-delete stack cho trường hợp hỗ trợ, không nên học “CloudFormation tuyệt đối không có force delete”.

ECS blue/green qua CloudFormation dùng **Transform `AWS::CodeDeployBlueGreen`** và **Hook type `AWS::CodeDeploy::BlueGreen`**. Tên transform và hook khác nhau. Kiểm tra các giới hạn trước khi áp dụng, đặc biệt nested stacks và loại update kết hợp.

## Tình huống song ngữ

**EN:** A stack is UPDATE_ROLLBACK_FAILED. What should the developer investigate first?

**VI:** Stack bị UPDATE_ROLLBACK_FAILED. Cần điều tra gì trước?

| | EN | VI |
|---|---|---|
| A | Resource failure reasons in stack events | Nguyên nhân lỗi resource trong stack events |
| B | Delete all resources immediately | Xóa ngay mọi resource |
| C | Disable all application logs | Tắt mọi application logs |

### Đáp án và giải thích

**A.** Phải sửa nguyên nhân trước khi tiếp tục rollback. B có thể mất dữ liệu; C làm mất bằng chứng và không sửa lỗi triển khai.

## Tự kiểm tra

Retain tài nguyên có nghĩa tài nguyên đó miễn phí không? Không: tài nguyên còn tồn tại vẫn có thể tính phí.

Nguồn: [Troubleshooting](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/troubleshooting.html), [ECS blue/green](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/blue-green.html).
