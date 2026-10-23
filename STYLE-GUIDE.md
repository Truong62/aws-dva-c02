# Quy chuẩn biên tập giáo trình DVA-C02

## Người đọc và mục đích

Developer đã biết lập trình nhưng cần hiểu AWS từ khái niệm đến cách giải tình huống. Ưu tiên cơ chế và điều kiện áp dụng. Không kéo dài bài để đạt số từ; không tuyên bố thuộc keyword là đủ đậu thi.

## Nội dung chính và tham khảo

- `chapters/essentials/chXX-slug.md` là bài ôn thi hiển thị đầu tiên, ngắn hơn chương gốc và đọc độc lập được.
- `chapters/chXX-slug.md` là phần chuyên sâu trong Đọc thêm.
- `.part1.md` và `.part2.md` là bản nguồn cũ. Sửa lỗi bản ghép thì sửa phần tương ứng nếu còn tồn tại.
- Giữ số chương, slug và URL để không mất liên kết/tiến độ.

## Cấu trúc mỗi bài

1. Một H1: tên chủ đề.
2. H2 “Khái niệm cần hiểu”: giải nghĩa trước khi dùng thuật ngữ.
3. Cơ chế và quyết định cần thi: ai gọi ai, dữ liệu đi đâu, quyền nằm đâu, lỗi xử lý ở chặng nào.
4. Bảng so sánh khi có lựa chọn dễ nhầm, kèm điều kiện và giới hạn.
5. H2 “Tình huống song ngữ”: có `**EN:**`, `**VI:**` và lựa chọn Anh–Việt. Có đáp án tốt nhất rõ ràng hoặc ghi số đáp án cần chọn.
6. H3 “Đáp án và giải thích”: vì sao đúng và vì sao phương án gần đúng không đạt yêu cầu. Reader tự gập đáp án.
7. H2 “Tự kiểm tra”: buộc diễn giải, không chỉ nhắc tên dịch vụ.
8. Link tài liệu AWS trực tiếp ở đoạn liên quan hoặc cuối bài.

Chương 1 và 49–50 có thêm lộ trình/chiến lược. Không dẫn số trang PDF trong bài chính.

## Ngôn ngữ và ví dụ

Tiếng Việt rõ ràng, giữ thuật ngữ tiếng Anh và giải nghĩa lần đầu. Ví dụ code ngắn, ghi ngôn ngữ code fence. Không thêm comment, docstring, JSDoc hoặc TODO trong code; giải thích bằng văn bản bên ngoài. Không dùng credentials thật.

## Độ chính xác

- Đối chiếu AWS cho quota, cú pháp và giới hạn hỗ trợ; phân biệt default với adjustable quota/hard limit.
- Nêu API/service type: REST vs HTTP API, queue DLQ vs async Lambda DLQ, EC2 vs Fargate.
- Không nói FIFO tự bảo đảm nghiệp vụ exactly-once, mọi 502 là malformed response, mọi rollback fail là drift, hay write-through loại bỏ mọi race condition.
- Không quy đổi 720 thành 72%. Điểm mock chỉ đo tiến bộ nội bộ.
- Đề cũ có giả định lỗi thời phải sửa hoặc ghi rõ điều kiện; không yêu cầu học thuộc thông tin sai vì “đề hay hỏi”.
- Ghi phạm vi rà soát trong `docs/content-review.md`; không tuyên bố đã kiểm chứng toàn bộ bài tập nếu mới kiểm tra bài chính.

## Kiểm chứng

Chạy `npm run check:content`, `npm run check`, `npm run build`, `git diff --check`. Kiểm tra trang chủ/chương desktop/mobile, mở đáp án và Đọc thêm, kiểm tra mục lục và link nội bộ. Không thêm dependency nếu renderer hiện có đáp ứng.
