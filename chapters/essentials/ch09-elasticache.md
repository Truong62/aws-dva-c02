# Cache: giảm tải nhưng phải quản lý dữ liệu cũ

## Khái niệm cần hiểu

Cache lưu bản sao dữ liệu để đọc nhanh. **Hit** là tìm thấy; **miss** là phải lấy từ nguồn; **TTL** là thời gian giữ; **eviction** là loại dữ liệu để giải phóng chỗ. ElastiCache hỗ trợ các engine như Valkey, Redis OSS và Memcached; không coi mọi engine có cùng tính năng HA/persistence.

## Cơ chế và quyết định cần thi

| Chiến lược | Cách làm | Đánh đổi |
|---|---|---|
| Cache-aside/lazy loading | Đọc cache; miss thì đọc DB và điền cache | Chỉ lưu dữ liệu được đọc; có miss penalty và stale data |
| Write-through | Cập nhật cache trên đường ghi dữ liệu | Giữ cache mới nếu mọi writer tuân thủ; tăng chi phí ghi |
| Invalidation | Xóa key liên quan sau khi dữ liệu thay đổi | Lần đọc sau tải lại |
| TTL | Hết thời gian thì loại bản cache | Giới hạn tuổi, không bảo đảm mới nhất trong khoảng TTL |

“Luôn giá trị mới nhất” trong lựa chọn chiến lược thường hướng tới write-through. Trong hệ thống thật còn phải xử lý lỗi ghi, thứ tự cập nhật, writer bỏ qua cache và concurrent reads; tên chiến lược không tự bảo đảm consistency tuyệt đối.

Session dùng chung giúp các EC2 thay nhau phục vụ. Redis/Valkey HA giảm rủi ro nhưng async replication vẫn có khả năng mất các ghi mới khi failover; nếu đề yêu cầu lưu session bền vững và cho lựa chọn DynamoDB, hãy xét yêu cầu đó.

## Tình huống song ngữ

**EN:** Every application update must also update the cache immediately. Which caching strategy matches this write path?

**VI:** Mỗi lần ứng dụng cập nhật dữ liệu phải cập nhật cache ngay. Đây là chiến lược nào?

| | EN | VI |
|---|---|---|
| A | Lazy loading only | Chỉ nạp khi đọc |
| B | Write-through | Cập nhật cache trên đường ghi |
| C | A long TTL only | Chỉ đặt TTL dài |

### Đáp án và giải thích

**B.** A và C không buộc cache cập nhật khi DB thay đổi. Vẫn cần bảo đảm tất cả đường ghi thực hiện đúng chiến lược.

## Tự kiểm tra

Một key còn TTL có chắc đúng không? Cache toàn bộ dữ liệu có luôn tốt hơn chỉ cache dữ liệu nóng không?

Nguồn: [Caching strategies](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html), [ElastiCache overview](https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html).
