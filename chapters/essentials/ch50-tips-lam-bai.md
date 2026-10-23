# Chiến lược ôn: chuyển câu sai thành kiến thức

## Khái niệm cần hiểu

**Constraint** là điều kiện bắt buộc: không downtime, không ảnh hưởng production, không credentials dài hạn. **Optimization goal** là tiêu chí chọn giữa các giải pháp hợp lệ: ít code, ít vận hành, chi phí thấp. Một giải pháp rẻ nhưng vi phạm constraint phải bị loại trước.

## Cách đọc một câu tình huống

1. Vẽ luồng: nguồn → xử lý → lưu trữ → người dùng.
2. Xác định ai gọi ai, dùng identity nào.
3. Xác định yêu cầu về thời gian, retry, ordering, consistency và retention.
4. Loại đáp án không được hỗ trợ hoặc đặt cấu hình sai chỗ.
5. So sánh các đáp án còn lại theo tiêu chí đề đưa ra.

“Least development effort” thường ưu tiên tính năng có sẵn, nhưng chỉ sau khi xác nhận nó đáp ứng đúng điều kiện. Keyword là gợi ý, không thay việc kiểm tra khả năng kỹ thuật.

## Những cặp phải giải thích được

| Cặp | Khác biệt quyết định |
|---|---|
| Execution role / authorizer | Quyền code gọi AWS / quyền người dùng vào API |
| Reserved / provisioned concurrency | Dành và giới hạn quota / chuẩn bị môi trường |
| User pool / identity pool | JWT / AWS credentials tạm |
| GSI / LSI | Đổi partition key được / giữ partition key |
| Logs / metrics / traces / audit | Nội dung sự kiện / số liệu / đường request / hoạt động API |
| Canary / test stage | Traffic thật một phần / môi trường test tách riêng |
| Buildspec / AppSpec | Build-test / deployment |

## Lịch ôn theo điểm yếu

Vòng đầu học [IAM](/chuong/2/) → [Lambda](/chuong/28/) → [API Gateway](/chuong/34/) → [SAM](/chuong/36/). Vòng hai học DynamoDB và SQS/SNS. Vòng ba học deployment, monitoring và security. Các chương hạ tầng đọc để bổ sung khái niệm khi cần.

Mỗi buổi: đọc một bài chính, tự nói lại luồng hoạt động, giải tình huống, ghi một lỗi đã sửa. Sau vài buổi làm một nhóm quiz và quay lại đúng lỗ hổng. Phân bổ đủ bốn domain theo [AWS Exam Guide](https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02.html); không chỉ làm liên tục đề mới.

## Tình huống song ngữ

**EN:** Updated Lambda code must be tested without affecting any production user. Which approach fits?

**VI:** Code Lambda mới phải được test mà không ảnh hưởng bất kỳ user production nào. Chọn gì?

| | EN | VI |
|---|---|---|
| A | Send 10% of production traffic to the new version | Chuyển 10% traffic production sang bản mới |
| B | Use an isolated test stage and version | Dùng test stage và version tách riêng |
| C | Replace production code immediately | Thay code production ngay |

### Đáp án và giải thích

**B.** “Không user production” là constraint quyết định. A là canary, giảm phạm vi ảnh hưởng nhưng không bằng zero; C ảnh hưởng toàn bộ. Cần cô lập cả side effects khi test, không chỉ URL.

## Tự kiểm tra

Sổ lỗi mỗi câu chỉ cần: yêu cầu quyết định → cơ chế đúng → vì sao đáp án mình chọn sai. Sau khi hiểu, hãy đổi một constraint và thử xem đáp án có đổi không.
