# DynamoDB nâng cao: indexes và ghi có điều kiện

## Khái niệm cần hiểu

**Secondary index** cung cấp đường truy vấn khác primary key. **Projection** chọn attributes đưa vào index. **Conditional write** chỉ ghi khi điều kiện đúng; **transaction** nhóm các thao tác all-or-nothing.

## Cơ chế và quyết định cần thi

| | LSI | GSI |
|---|---|---|
| Partition key | Giữ nguyên table | Có thể khác table |
| Sort key | Thay sort key | Có thể khác hoặc không có |
| Tạo | Khi tạo table | Có thể thêm sau |
| Strong reads | Có hỗ trợ | Không hỗ trợ |
| Provisioned capacity | Chung table | Có cấu hình riêng |

Ví dụ table có PK `student_id`, SK `subject_name`; cần tìm học sinh điểm cao nhất theo môn. Tạo GSI PK `subject_name`, SK `top_score`, rồi Query môn với `ScanIndexForward=false`, `Limit=1`. Primary key của table được projected vào index nên có `student_id`. Nếu cần tất cả người đồng điểm, lấy tiếp các item có điểm bằng mức cao nhất.

**Optimistic locking** dùng version attribute và condition để tránh ghi đè update của người khác. **Atomic counter** tăng số không cần read-modify-write riêng, nhưng retry tăng lần nữa vẫn có thể tăng trùng; atomic không có nghĩa idempotent.

Transaction hữu ích khi nhiều item phải thành công/thất bại cùng nhau. Conditional write với business ID hỗ trợ chống tạo đơn trùng. Index tăng chi phí ghi/lưu trữ; chỉ tạo khi cần access pattern cụ thể.

## Tình huống song ngữ

**EN:** A table is keyed by student and subject. The app needs the top score for each subject. Which index fits?

**VI:** Table có khóa theo học sinh và môn. App cần điểm cao nhất theo từng môn. Index nào phù hợp?

| | EN | VI |
|---|---|---|
| A | GSI: subject partition key, score sort key | GSI: PK môn, SK điểm |
| B | LSI with a different partition key | LSI đổi partition key |
| C | GSI: subject partition key, student sort key | GSI: PK môn, SK học sinh |

### Đáp án và giải thích

**A.** Gom đúng môn và sắp xếp theo điểm. B trái định nghĩa LSI; C không sắp xếp theo điểm để lấy top nhanh.

## Tự kiểm tra

GSI có đọc strongly consistent được không? Retry atomic increment có thể tăng hai lần không?

Nguồn: [Secondary indexes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SecondaryIndexes.html), [Conditional expressions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html).
