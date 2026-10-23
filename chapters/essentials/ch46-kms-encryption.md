# KMS: quản lý khóa, không phải kho password

## Khái niệm cần hiểu

KMS quản lý keys và thực hiện cryptographic operations. **Plaintext** là dữ liệu rõ; **ciphertext** là dữ liệu đã mã hóa; **data key** mã hóa dữ liệu; **KMS key** có thể bảo vệ data key. Secrets Manager/Parameter Store lưu giá trị secret/config, KMS hỗ trợ mã hóa.

## Cơ chế và quyết định cần thi

**Envelope encryption**: tạo data key → dùng plaintext data key mã hóa dữ liệu ở ứng dụng → lưu encrypted data key cùng ciphertext → loại plaintext key khỏi memory khi không cần. Khi đọc, KMS giải mã data key rồi ứng dụng giải mã dữ liệu.

Với symmetric KMS key, `Encrypt` có giới hạn plaintext 4 KiB, không gửi trực tiếp video lớn vào API này. Dữ liệu lớn dùng envelope encryption hoặc service encryption tích hợp.

**Key policy** quyết định quyền dùng key và cách IAM policies được ủy quyền. Cross-account thường cần key policy cho phép phía ngoài cùng IAM policy của caller. Có quyền S3 nhưng thiếu `kms:Decrypt` vẫn không đọc được SSE-KMS object.

**Customer managed key** cho bạn kiểm soát policy và rotation theo khả năng key type/origin. Rotation thay key material, không thay key ID và không tự mã hóa lại toàn bộ dữ liệu cũ; KMS giữ material cần để giải mã ciphertext cũ. Phân biệt automatic/on-demand rotation với tạo key mới rồi đổi alias.

## Tình huống song ngữ

**EN:** An application must encrypt a large file using KMS-protected keys. Which pattern fits?

**VI:** App cần mã hóa file lớn bằng khóa được KMS bảo vệ. Mô hình nào phù hợp?

| | EN | VI |
|---|---|---|
| A | Envelope encryption with a data key | Envelope encryption bằng data key |
| B | Send the entire large file to KMS Encrypt | Gửi nguyên file lớn vào KMS Encrypt |
| C | Store the password as a KMS key alias | Lưu password trong alias key |

### Đáp án và giải thích

**A.** KMS bảo vệ key, app xử lý dữ liệu lớn. B vượt giới hạn plaintext của API; C nhầm alias định danh key với nơi lưu secret.

## Tự kiểm tra

Rotation key có đổi password database không? SSE-KMS và client-side envelope encryption khác nhau ở đâu thực hiện mã hóa?

Nguồn: [Envelope encryption](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#enveloping), [Key rotation](https://docs.aws.amazon.com/kms/latest/developerguide/rotate-keys.html), [Encrypt API](https://docs.aws.amazon.com/kms/latest/APIReference/API_Encrypt.html).
