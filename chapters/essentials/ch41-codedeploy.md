# CodeDeploy: chuyển bản mới tới compute và kiểm soát traffic

## Khái niệm cần hiểu

CodeDeploy quản lý deployment cho các compute platforms được hỗ trợ. **Application** nhóm deployment; **deployment group** chọn targets/config; **revision** là phiên bản cần triển khai; **AppSpec** mô tả tài nguyên/files/hooks của deployment.

## Cơ chế và quyết định cần thi

| Platform | Điểm cần nhớ |
|---|---|
| EC2/on-premises | Agent, AppSpec files/hooks; in-place hoặc blue/green |
| Lambda | Chuyển traffic giữa published versions qua alias |
| ECS | CodeDeploy blue/green với task sets/target groups theo mô hình hỗ trợ |

**Canary** chuyển một phần nhỏ rồi phần còn lại; **linear** tăng đều từng bước; **all-at-once** chuyển toàn bộ. Blue/green tách môi trường/bản mới và cũ; canary/linear mô tả cách chuyển traffic, nên có thể kết hợp.

CloudWatch alarms và lifecycle hooks giúp phát hiện lỗi/rollback theo cấu hình. CodeBuild chạy test/build; CodeDeploy mới quản lý traffic shifting trong các lựa chọn thường gặp.

Kiểm tra package local bằng CodeDeploy agent không cần tạo application/deployment group đầy đủ. Agent cũ dùng `codedeploy-local`; tài liệu agent 2.x dùng `codedeploy-agent deploy-local`. Có thể lấy bundle S3 với cấu hình/quyền phù hợp. Đây là kiểm tra AppSpec/package/lifecycle, không thay mọi loại unit test.

## Tình huống song ngữ

**EN:** A new Lambda version must gradually receive live traffic with automatic rollback on alarms. Which service handles the deployment?

**VI:** Lambda mới cần nhận traffic dần và tự rollback khi alarm kích hoạt. Dịch vụ nào quản lý deployment?

| | EN | VI |
|---|---|---|
| A | CodeDeploy | Dịch vụ triển khai và chuyển traffic |
| B | CodeArtifact | Kho package |
| C | CloudTrail | Audit API calls |

### Đáp án và giải thích

**A.** Versions/alias, deployment config và alarms phải được cấu hình. B lưu dependencies; C cung cấp lịch sử hoạt động, không triển khai bản mới.

## Tự kiểm tra

Canary có đáp ứng “không user production nào bị ảnh hưởng” không? AppSpec và buildspec thuộc dịch vụ nào?

Nguồn: [CodeDeploy deployment types](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-overview.html), [Local validation](https://docs.aws.amazon.com/codedeploy/latest/userguide/deployments-local.html).
