# CloudFront: cache gần người dùng

## Khái niệm cần hiểu

CloudFront là CDN. **Origin** là nguồn nội dung như S3/HTTP server; **edge cache** giữ bản sao; **cache behavior** chọn cấu hình theo đường dẫn; **cache key** quyết định các request nào dùng chung bản cache.

## Cơ chế và quyết định cần thi

Thay file ở S3 không tự xóa mọi bản cache. Có hai hướng: **invalidation** khi cần bỏ bản cũ, hoặc **versioned filename** như `app.hash.js` để URL mới nhận nội dung mới. S3 version ID và tên file có hash là hai khái niệm khác nhau.

Headers, query strings và cookies được đưa vào cache key sẽ chia cache thành nhiều bản. Forward một trường tới origin không nhất thiết đưa trường đó vào cache key; dùng đúng cache policy và origin request policy để tránh chia sẻ dữ liệu cá nhân giữa user.

Origin Access Control giúp CloudFront truy cập S3 origin riêng tư. CloudFront signed URL/cookie kiểm soát người xem; khác S3 presigned URL ký trực tiếp quyền đọc object.

CloudFront real-time logs gửi tới Kinesis Data Streams để xử lý nhanh. Có thể dùng consumer đưa dữ liệu tới OpenSearch cho dashboard. Standard logs và real-time logs là hai cơ chế, không suy luận mọi loại CloudFront logs cùng đích đến.

## Tình huống song ngữ

**EN:** New files are visible in S3, but CloudFront still serves old content. What should the developer do for the affected paths?

**VI:** S3 đã có file mới nhưng CloudFront vẫn trả nội dung cũ. Nên làm gì với các path liên quan?

| | EN | VI |
|---|---|---|
| A | Invalidate cached objects | Invalidate bản cache |
| B | Enable S3 Object Lock | Bật S3 Object Lock |
| C | Change the bucket's Region | Đổi Region của bucket |

### Đáp án và giải thích

**A.** Vấn đề là bản sao tại CDN. B bảo vệ retention; C không xử lý cache. Với triển khai lâu dài, cân nhắc tên asset có version và cache headers phù hợp.

## Tự kiểm tra

S3 đã strong consistency, vì sao người dùng vẫn thấy bản cũ? API trả dữ liệu theo user thì cache key cần xét gì?

Nguồn: [Invalidation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html), [Real-time logs](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/real-time-logs.html).
