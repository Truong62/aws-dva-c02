# Giáo trình ôn luyện AWS Certified Developer – Associate (DVA-C02)

Giáo trình tiếng Việt **50 bài ôn thi**, tập trung khái niệm, cơ chế, lựa chọn theo yêu cầu và tình huống Anh–Việt. Nội dung lý thuyết dài, code, lab và bài tập gốc được giữ trong **Đọc thêm**, đóng mặc định. Trình đọc Next.js giữ giao diện máy đọc sách và URL chương hiện có.

Lộ trình bắt đầu: IAM → Lambda → API Gateway → SAM, sau đó DynamoDB, messaging, deployment, monitoring và security. Thời gian đọc hiển thị chỉ tính phần ôn thi. Phạm vi rà soát và các hiệu chỉnh có nguồn được ghi trong [content review](docs/content-review.md).

## Cấu trúc

```
aws-dva-c02/
├── chapters/essentials/
├── chapters/
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

Dữ liệu câu hỏi nằm ở `public/quiz-questions.json`; logic thuần ở `lib/quiz.mjs`, kiểm tra bằng `npm run check`. Mốc 72% là mốc luyện tập của website, không quy đổi sang điểm AWS 720/1000. Bộ 510 câu gốc chưa được kiểm chứng toàn bộ trong đợt biên tập nội dung chính.

## Kiểm tra nội dung và build

```bash
npm run check:content
npm run check
npm run build
git diff --check
```

`check:content` kiểm tra đủ 50 bài, tình huống song ngữ, nguồn AWS, metadata, mục lục/anchors và phần tham khảo đóng mặc định. Build xuất HTML sẵn vào `out/`.
