# CodePipeline và CodeArtifact: điều phối khác lưu package

## Khái niệm cần hiểu

**CodePipeline** điều phối các stage/actions của quá trình release. **Artifact** là đầu vào/đầu ra giữa actions. **CodeArtifact** là package repository cho dependencies. Pipeline không tự build code nếu chưa có build action.

## Cơ chế và quyết định cần thi

```text
Source change → Pipeline → CodeBuild/test → artifact → deploy → kiểm tra
```

Muốn chạy ngay khi source thay đổi, dùng event-based trigger như EventBridge hoặc integration/webhook phù hợp source. Poll mỗi 15 phút không đáp ứng yêu cầu “immediately” theo các lựa chọn đề.

Source S3 theo dõi object nguồn được cấu hình, không phải mọi file trong mọi bucket. CodeCommit source theo repository/branch. GitHub/GitLab có thể dùng CodeConnections theo hỗ trợ provider.

Pipeline role, build role, deploy role và cross-account role có trách nhiệm khác nhau. Artifact lưu S3 mã hóa KMS cần quyền object và key thích hợp. Thêm role trust mà chưa cấp phép action cần thiết vẫn có thể AccessDenied.

CodeArtifact lưu packages/dependencies, ECR lưu container images. Token tải package có thời hạn, không hardcode lâu dài trong buildspec. Manual approval chặn bước tiếp theo để người có quyền duyệt; không tự kiểm tra chất lượng code.

## Tình huống song ngữ

**EN:** A build should start immediately after a commit to the configured source branch. Which approach fits?

**VI:** Build phải chạy ngay sau commit vào source branch đã cấu hình. Cách nào phù hợp?

| | EN | VI |
|---|---|---|
| A | Event-based source change detection | Phát hiện thay đổi bằng event |
| B | A 15-minute timer only | Chỉ timer 15 phút |
| C | Store source on an EBS volume only | Chỉ lưu source trên EBS |

### Đáp án và giải thích

**A.** Pipeline được kích hoạt theo thay đổi. B có thời gian chờ theo lịch; C không tạo source trigger native cho pipeline.

## Tự kiểm tra

Build thành công nhưng deploy không đọc được artifact: kiểm tra những role, bucket và KMS permissions nào?

Nguồn: [CodePipeline concepts](https://docs.aws.amazon.com/codepipeline/latest/userguide/concepts.html), [CodeArtifact](https://docs.aws.amazon.com/codeartifact/latest/ug/welcome.html).
