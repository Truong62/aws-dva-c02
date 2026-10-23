# DynamoDB: bắt đầu từ khóa và cách đọc dữ liệu

## Khái niệm cần hiểu

Table chứa **items**, item chứa **attributes**. Primary key có partition key, hoặc partition key kết hợp sort key. Cặp khóa xác định item duy nhất. **Partition key** phân bố dữ liệu và định hướng truy vấn; **sort key** tổ chức các item cùng partition key.

## Cơ chế và quyết định cần thi

| API | Cách đọc |
|---|---|
| GetItem | Đọc theo đầy đủ primary key |
| Query | Bắt buộc equality trên partition key; có thể thêm điều kiện sort key |
| Scan | Đọc qua table/index rồi lọc |

`FilterExpression` được áp sau khi đọc, không biến Scan thành Query và không giảm read capacity đã tiêu thụ cho dữ liệu được đọc. Query trả theo sort key; `ScanIndexForward=false` đảo chiều trong partition được query, không sắp xếp toàn table theo thuộc tính bất kỳ.

**Provisioned capacity** cấp RCU/WCU; **on-demand** tính theo requests với các giới hạn/scaling riêng. **Hot partition** xảy ra khi tải dồn vào một vùng khóa; tổng capacity còn dư vẫn có thể throttle. Retry backoff giảm tác động tạm thời nhưng không sửa thiết kế key lệch tải.

Strongly consistent read phản ánh các ghi đã hoàn tất trước đó trên table/LSI; GSI chỉ hỗ trợ eventual reads. Item tối đa 400 KB. Capacity đọc tính theo khối 4 KB và kiểu consistency; ghi theo khối 1 KB, transaction tốn thêm capacity. Làm bài tính phải làm tròn theo từng item/thao tác đúng quy tắc.

## Tình huống song ngữ

**EN:** A Query currently returns numeric sort keys in ascending order. How can it return descending order?

**VI:** Query trả sort key số tăng dần. Làm sao đảo thành giảm dần?

| | EN | VI |
|---|---|---|
| A | Set ScanIndexForward to false | Đặt ScanIndexForward=false |
| B | Set KeyConditionExpression to false | Đặt KeyConditionExpression=false |
| C | Rename the sort key | Đổi tên sort key |

### Đáp án và giải thích

**A.** Tham số điều khiển thứ tự. B phải là biểu thức điều kiện hợp lệ; C không đổi cách Query sắp xếp.

## Tự kiểm tra

Query cần biết khóa nào? FilterExpression có tiết kiệm RCU đã dùng không? Vì sao tổng request thấp vẫn throttle?

Nguồn: [Query](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html), [Read consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html), [Partition key design](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html).
