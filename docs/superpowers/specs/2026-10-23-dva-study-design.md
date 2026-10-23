# Biên tập giáo trình DVA-C02

Người dùng giao quyền tự lên kế hoạch, thực hiện và đẩy bản hoàn chỉnh lên remote. Mục tiêu là học hiểu khái niệm và cơ chế để giải tình huống DVA-C02, dùng tiếng Việt và giữ thuật ngữ tiếng Anh. Câu hỏi ôn tập có đề và lựa chọn Anh–Việt; không dẫn số trang PDF.

## Phạm vi

Biên tập phần học chính cho toàn bộ 50 chương, ưu tiên IAM, Lambda, API Gateway, SAM. Mỗi chương có khái niệm, cơ chế, quyết định cần thi, tình huống song ngữ, giải thích, tự kiểm tra và nguồn AWS. Chương mở đầu chỉ đường học; chương cuối hướng dẫn chữa câu sai. Nội dung chuyên sâu hiện có được giữ trong phần Đọc thêm đóng mặc định. Các lỗi đã xác minh trong tài liệu gốc được sửa cả bản ghép và các bản part để tránh tái xuất hiện khi ghép lại.

## Cách triển khai

Đặt bản ôn thi trong chapters/essentials theo tên chương hiện có. lib/content.js đọc bản này làm nội dung chính, tính thời gian đọc cho bản ôn thi, và render bản dài trong native details. Không thay URL chương, localStorage hay cách tính quiz. Dùng giao diện và dependency hiện có. Trang chủ ghi đúng phạm vi mới, có thứ tự học phù hợp kiến thức nền. Điểm quiz 72% được ghi rõ là mốc luyện tập của website, không phải quy đổi điểm AWS.

## Độ chính xác

Dùng AWS Exam Guide xác định phạm vi; dùng tài liệu dịch vụ xác minh cơ chế và giới hạn. Không dùng mẹo keyword như bảo đảm tuyệt đối. Phân biệt default quota với hard limit, REST API với HTTP API, FIFO deduplication với idempotency, IAM identity với policy evaluation. Ghi ngày rà soát và giới hạn của đợt rà soát: nội dung chính được biên tập, bộ 510 câu gốc không được tuyên bố đã kiểm chứng toàn bộ.

## Kiểm chứng

Kiểm tra render nội dung chính trước phần tham khảo, details đóng mặc định, anchors không trùng và mục lục trỏ đúng; đủ 50 bài, nguồn và câu song ngữ; không có comment trong code mới. Chạy kiểm tra quiz hiện có và production build. Kiểm tra HTTP bản local/đã export rồi commit, push; theo dõi remote và website. Không tự thay thiết lập hosting nếu không cần.
