# Giáo trình ôn luyện AWS Certified Developer – Associate (DVA-C02)

Giáo trình tiếng Việt **50 chương** (~365.000 từ), từ cơ bản đến nâng cao: lý thuyết sâu + code AWS SDK JS v3 / CLI v2 + hands-on lab + exam tips + quiz 10 câu mỗi chương + bộ đề mô phỏng 65 câu. Trình đọc dựng bằng **Next.js**, phong cách **máy đọc sách** (e-reader).

## Cấu trúc

```
aws-dva-c02/
├── chapters/           # Nội dung 50 chương: ch01-*.md → ch50-*.md (+ .part1/.part2 gốc)
├── app/                # Next.js App Router: trang bìa + /chuong/[num]
├── components/         # Reader, Sidebar, AaPanel, Home (client components)
├── lib/                # data.js (mục lục), content.js (đọc & render markdown)
├── MUC-LUC.md          # Mục lục kèm phạm vi chi tiết từng chương
└── STYLE-GUIDE.md      # Quy chuẩn biên soạn
```

## Chạy local

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build & xuất tĩnh

```bash
npm run build      # xuất ra thư mục out/ (static export, host ở đâu cũng được)
```

Thư mục `out/` là HTML/CSS/JS tĩnh — markdown được render sẵn lúc build, **không cần server Node** khi chạy.

## Deploy

- **Vercel:** import repo → tự nhận Next.js, không cần cấu hình.
- **Netlify / Cloudflare Pages:** build command `npm run build`, publish directory `out`.
- **GitHub Pages / S3 / bất kỳ static host nào:** upload nội dung thư mục `out/`.
  - Nếu host trong subfolder (vd GitHub Pages project site `/aws-dva-c02`), mở `next.config.mjs` và bỏ comment dòng `basePath`.

## Tính năng trình đọc (e-reader)

- 4 nền giấy: **Giấy / Sepia / Đêm / Trắng đen**, lưu theo thiết bị, không nhấp nháy khi tải.
- Bảng **Aa**: chỉnh cỡ chữ, giãn dòng, phông (Sách/Báo/Sans), khổ trang (Hẹp/Vừa/Rộng), canh trái/đều.
- Drop-cap đầu chương, typography tối ưu đọc lâu.
- Sidebar 10 phần / 50 chương + tìm kiếm (`/`), đánh dấu **đã học xong**, thanh tiến độ toàn khoá.
- "Đọc tiếp" nhớ chương đang đọc; thanh tiến độ cuộn; phím `←` `→` chuyển chương.
- Đáp án quiz **tự gập**; mục lục trong chương; nút in/xuất PDF từng chương.

## Bộ đề luyện tập — `/quiz`

510 câu trắc nghiệm có đáp án và giải thích tiếng Việt: 16 quiz theo chủ đề (120 câu) và 6 đề mô phỏng full 65 câu (390 câu). Chạy hoàn toàn trong trình duyệt, không cần đăng nhập.

- Vào đề theo 2 bước trượt ngang: **chọn đề → vào làm bài**. Bấm lại vào bước trên thanh để quay lui.
- Chế độ suy ra từ đề, không phải chọn tay: 16 quiz theo chủ đề chạy **Luyện tập** (hiện đáp án ngay), 6 đề mô phỏng chạy **Thi thử** (chấm khi nộp, ngưỡng đạt 72%, mặc định đếm ngược 130 phút như kỳ thi thật).
- Mỗi đề là trọn bộ câu của phần đó, không phải nhập số câu. Tuỳ chọn: trộn câu hỏi, trộn đáp án, đếm ngược.
- Code trong đề bài và giải thích được syntax-highlight (highlight.js, tự đoán JSON/YAML/bash) trên nền tối bảng màu Dracula — chỉ trong `/quiz`, trang giáo trình vẫn dùng gruvbox.
- Đánh dấu câu, bảng số câu, tự lưu tiến độ (thoát ra vào lại vẫn làm tiếp được), làm lại riêng các câu sai.
- Lịch sử và điểm cao nhất từng phần lưu trong `localStorage`.
- Phím tắt khi làm bài: `←` `→` chuyển câu, `1`–`9` chọn đáp án.

Dữ liệu câu hỏi nằm ở `public/quiz-questions.json`; logic thuần ở `lib/quiz.mjs`, kiểm tra bằng `npm run check`.
