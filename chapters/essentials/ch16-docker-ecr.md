# Docker và ECR: đóng gói khác với chạy ứng dụng

## Khái niệm cần hiểu

**Container image** là gói filesystem/code/dependencies; **container** là một lần chạy image. **Registry** lưu image, **repository** nhóm các image, **tag** là nhãn, **digest** định danh nội dung image.

ECR lưu container images. ECS/Fargate hoặc Lambda có thể chạy image phù hợp; ECR không tự chạy ứng dụng. CodeArtifact quản lý packages như npm/PyPI, không thay ECR để deploy Lambda image.

## Cơ chế và quyết định cần thi

```text
Source code → build image → push ECR → deploy compute dùng image
```

Muốn triển khai lặp lại chính xác, dùng digest hoặc quản lý tag bất biến; tag `latest` có thể trỏ sang nội dung khác. Push image mới không mặc định cập nhật mọi service đang chạy.

Đăng nhập registry không thay cho IAM authorization đối với repository. Role pull image, network tới registry và image architecture đều phải đúng. Với ECS, execution role hỗ trợ agent pull image/logs; task role cấp quyền cho code trong container gọi AWS.

Lambda ZIP có giới hạn giải nén; dependency 500 MB thường cần container image từ ECR trong các lựa chọn đề. Image Lambda vẫn phải tuân thủ Lambda runtime interface và giới hạn execution, không biến Lambda thành server chạy vô hạn.

## Tình huống song ngữ

**EN:** Lambda needs 500 MB of packaged dependencies. Which deployment source fits a container image?

**VI:** Lambda cần dependencies đóng gói 500 MB. Container image nên lấy từ đâu?

| | EN | VI |
|---|---|---|
| A | ECR repository | Repository ECR |
| B | CodeArtifact npm repository | Repository npm CodeArtifact |
| C | A ZIP in S3 bypassing the unzip limit | ZIP trên S3 để bỏ giới hạn giải nén |

### Đáp án và giải thích

**A.** Lambda hỗ trợ image từ ECR. B là package repository; C không bỏ giới hạn giải nén của ZIP.

## Tự kiểm tra

Ai lưu image, ai chạy image? Execution role và task role khác nhau ở đâu?

Nguồn: [Lambda container images](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html), [ECR concepts](https://docs.aws.amazon.com/AmazonECR/latest/userguide/what-is-ecr.html).
