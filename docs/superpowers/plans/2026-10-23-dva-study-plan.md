# DVA-C02 Study Cleanup Implementation Plan

> Thực hiện trực tiếp trong phiên này theo quyền người dùng giao; không cần thêm vòng duyệt kế hoạch.

**Goal:** Biến 50 chương thành lộ trình ôn thi dễ hiểu, sửa các lỗi đã xác minh và xuất bản bản đã kiểm tra.

**Architecture:** Giữ reader và URL. Thêm chapters/essentials/*.md làm bài chính; render chương dài trong details. Nguồn AWS nằm cạnh nội dung cần xác minh.

**Tech Stack:** Next.js 14, React 18, marked, Markdown, Node built-in assertions.

## Công việc

- [x] Rà mục lục và các đoạn dễ sai; đối chiếu AWS Exam Guide và tài liệu dịch vụ.
- [x] Viết lib/content.check.mjs kiểm tra 50 chương, thứ tự bản ôn thi/tham khảo, mục lục và anchors; chạy để thấy thiếu bài ôn thi.
- [x] Viết 50 bài chapters/essentials/chXX-slug.md: khái niệm, cơ chế, lựa chọn, tình huống EN/VI, đáp án, tự kiểm tra, nguồn. Nhóm IAM/Lambda/API Gateway/SAM được giải thích sâu hơn.
- [x] Sửa lib/content.js: đọc essentials, render riêng phần tham khảo và tính metadata theo bản ôn thi. Giữ fallback cho chương không có bản ôn thi. Không thêm dependency.
- [x] Sửa thông tin sai đã xác minh trong chapters/*.md và bản part; ghi phạm vi rà soát trong docs/content-review.md.
- [x] Cập nhật nội dung trang chủ, nhãn thời gian đọc, mô tả điểm quiz; cập nhật README.md và STYLE-GUIDE.md cho biên tập về sau.
- [x] Chạy node lib/content.check.mjs, npm run check, npm run build, git diff --check. Kiểm tra HTML export cho 50 route và links nội bộ.
- [ ] Rà diff, commit và push branch hiện tại. Kiểm tra remote commit và website đã nhận nội dung mới; báo kết quả thật và mọi giới hạn còn lại.

## Tiêu chí chấp nhận

Người học mở mỗi chương thấy ngay phần cần hiểu để thi. Đọc thêm vẫn truy cập được. Không mất quiz/history. Không diễn giải 720 là 72%; các giới hạn mới có phạm vi và nguồn. Đủ 50 bài chính, không placeholder. Không tuyên bố toàn bộ 510 câu đã được kiểm chứng. Build xuất tĩnh thành công trước khi push.
