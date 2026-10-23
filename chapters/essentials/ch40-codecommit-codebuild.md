# Source control và CodeBuild: từ commit tới artifact

## Khái niệm cần hiểu

Git repository lưu lịch sử source. **Branch** là nhánh phát triển di chuyển theo commit; **tag** đánh dấu một commit. CodeCommit là dịch vụ Git trong AWS. **CodeBuild** chạy các lệnh build/test và tạo artifacts theo buildspec.

## Cơ chế và quyết định cần thi

| Nhu cầu | Cách làm |
|---|---|
| QA bản sắp release trong khi main có feature mới | Release branch, bug fixes trên branch đó, merge lại main |
| Chạy build/test | CodeBuild với `buildspec.yml` |
| Hiển thị báo cáo test | Test runner tạo report file; buildspec `reports` thu nhận |
| Giảm tải dependencies lặp lại | Cache phù hợp và khai báo paths |

`buildspec.yml` mô tả phases, artifacts, reports và cache; `appspec.yml` thuộc CodeDeploy. Khai báo reports không tự viết/chạy unit tests; phải có lệnh test sinh format được hỗ trợ.

Local cache nhanh khi build quay lại host có cache; không bảo đảm cache sống vĩnh viễn hoặc mọi build cùng host. S3 cache dùng được qua hosts nhưng có chi phí transfer. Cache paths là đường dẫn dependencies, không phải tên CodeArtifact repository.

Git tag không phải nơi tiếp tục commit bug fixes. Rebase main sau release có thể rewrite lịch sử dùng chung; merge release branch trở lại main thường đáp ứng yêu cầu đưa fixes về mà giữ lịch sử.

## Tình huống song ngữ

**EN:** QA must fix a release in isolation while developers continue new features on main. What should the team use?

**VI:** QA sửa bản release độc lập trong khi main tiếp tục feature mới. Nên dùng gì?

| | EN | VI |
|---|---|---|
| A | Release branch, then merge fixes back | Release branch rồi merge fixes về |
| B | Add commits to a tag | Thêm commit vào tag |
| C | Put all fixes and new features on main during QA | Đưa cả fixes và features vào main khi QA |

### Đáp án và giải thích

**A.** Branch tách dòng công việc. B sai mô hình tag; C không cô lập release khỏi feature mới.

## Tự kiểm tra

CodeBuild reports khác artifacts ở đâu? Vì sao local cache có thể miss dù build trước vừa chạy?

Nguồn: [CodeBuild buildspec](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html), [Test reports](https://docs.aws.amazon.com/codebuild/latest/userguide/test-reporting.html), [Local caching](https://docs.aws.amazon.com/codebuild/latest/userguide/caching-local.html).
