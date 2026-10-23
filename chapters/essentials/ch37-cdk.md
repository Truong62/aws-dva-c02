# CDK: dùng code để sinh hạ tầng CloudFormation

## Khái niệm cần hiểu

CDK dùng ngôn ngữ lập trình để mô tả hạ tầng. **Construct** là thành phần mô hình; **stack** là đơn vị CloudFormation; **app** chứa stacks; **asset** là code/image/file cần upload khi deploy. CDK không thay IAM và không bỏ qua CloudFormation.

## Cơ chế và quyết định cần thi

```text
CDK code → synth → CloudFormation template + assets → deploy
```

| Lệnh | Vai trò |
|---|---|
| cdk init | Tạo dự án CDK |
| cdk synth | Sinh template/cloud assembly |
| cdk bootstrap | Chuẩn bị tài nguyên hỗ trợ cho account/Region |
| cdk diff | Xem khác biệt dự kiến |
| cdk deploy | Triển khai stack |
| cdk destroy | Xóa stack theo chính sách tài nguyên |

Bootstrap hiện đại tạo bucket asset, repository và roles hỗ trợ theo cấu hình. Môi trường là **account + Region**. Deploy thành công ở account A không chứng minh account B đã bootstrap.

Lỗi NoSuchBucket khi lần đầu deploy Lambda assets sang môi trường mới gợi ý kiểm tra bootstrap bucket, Region/account và quyền. Chạy synth chỉ tạo template, không tạo bucket AWS. Deploy assets còn cần credentials đúng và mạng tới các dịch vụ liên quan.

## Tình huống song ngữ

**EN:** CDK deployment with Lambda assets succeeds in account A but fails with NoSuchBucket on the first deployment to account B. Which command is most relevant?

**VI:** CDK có Lambda assets deploy được ở A nhưng lần đầu sang B lỗi NoSuchBucket. Lệnh nào phù hợp nhất?

| | EN | VI |
|---|---|---|
| A | cdk bootstrap | Chuẩn bị môi trường đích |
| B | cdk init | Tạo dự án mới |
| C | cdk destroy | Xóa stack |

### Đáp án và giải thích

**A.** Bootstrap đúng account/Region trước khi deploy lại. B không chuẩn bị tài nguyên staging AWS; C xóa hạ tầng, không khắc phục thiếu bucket.

## Tự kiểm tra

Sự khác nhau giữa synth và deploy là gì? Cùng account nhưng đổi Region có cần kiểm tra bootstrap không?

Nguồn: [CDK bootstrapping](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html), [CDK assets](https://docs.aws.amazon.com/cdk/v2/guide/assets.html).
