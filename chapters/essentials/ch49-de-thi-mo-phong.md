# Luyện đề: đo khả năng giải thích, không chỉ đếm đáp án

## Khái niệm cần hiểu

Đề mô phỏng là công cụ tìm lỗ hổng kiến thức. Tỷ lệ đúng trong bộ luyện tập không phải scaled score của AWS. Đúng một câu do đoán không chứng minh đã hiểu, và lời giải từ bộ đề có thể cũ hoặc thiếu điều kiện.

## Cách dùng bộ đề

1. Làm một lượt không xem đáp án, ghi những câu đoán.
2. Sau khi chấm, phân loại lỗi: chưa biết service, nhầm cơ chế, bỏ sót constraint, hay lời giải đáng nghi.
3. Đọc lại bài chính liên quan và giải thích vì sao phương án gần đúng không đạt yêu cầu.
4. Làm lại sau một khoảng nghỉ, đổi tình huống/điều kiện để tránh chỉ nhớ chữ cái.

[Mở bộ quiz trên website](/quiz/). Phần Đọc thêm giữ đề 65 câu của giáo trình. Bộ 510 câu hiện có là tài liệu luyện tập gốc, chưa được xác minh từng câu trong đợt biên tập này. Khi giới hạn/tính năng mâu thuẫn, kiểm tra tài liệu AWS theo API/service type cụ thể.

## Những câu cần đọc bằng cơ chế

| Dấu hiệu | Cần kiểm tra |
|---|---|
| Lambda/API Gateway 502 | Exception hay response sai format? REST hay HTTP API? |
| FIFO chống duplicate | Dedup gửi hay tác dụng nghiệp vụ idempotent? |
| DynamoDB numeric filtering | Số JSON thật hay chuỗi trong `N`? |
| S3 xóa sau một năm | Current/noncurrent, tuổi tính từ lúc nào? |
| Rollback fail | Resource event báo lỗi gì, không chỉ đoán drift |

Mốc luyện tập 72% của website chỉ là cách phân loại nội bộ. AWS chấm trên thang 100–1000 với ngưỡng 720; không có phép nhân trực tiếp tỷ lệ đúng với 1000 để suy ra điểm thi. [AWS exam scoring](https://docs.aws.amazon.com/aws-certification/latest/developer-associate-02/developer-associate-02.html)

## Tình huống song ngữ

**EN:** A learner scores 72% on a practice test. Does that guarantee a passing AWS scaled score?

**VI:** Người học đúng 72% đề luyện tập. Có bảo đảm đạt điểm AWS không?

| | EN | VI |
|---|---|---|
| A | Yes, multiply the percentage by 1000 | Có, nhân tỷ lệ với 1000 |
| B | No, the scoring systems are different | Không, hai hệ chấm khác nhau |
| C | Only if the test has exactly 65 questions | Chỉ khi đề có đúng 65 câu |

### Đáp án và giải thích

**B.** Số câu bằng nhau không làm đề mô phỏng có cùng calibrated difficulty hay scoring model. Dùng kết quả để quyết định ôn gì, không xem như chứng nhận sẽ đậu.

## Tự kiểm tra

Chọn ba câu đã đúng và tự giải thích từng phương án sai. Nếu không giải thích được, đánh dấu là “đúng nhưng chưa chắc”.
