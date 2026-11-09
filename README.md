# Mộc Studio — Đề tài 1

Website thời trang mẫu sử dụng Vue 3, Vue Router, Pinia và Vite.

## Chạy trên máy

Cần Node.js 24 và npm. Mở terminal trong thư mục dự án rồi chạy:

```sh
npm ci
npm run dev
```

Mở địa chỉ Vite in ra. Chạy `npm test` để kiểm thử và `npm run build` để tạo thư mục `dist`.

## Luồng trình diễn

1. Vào **Bộ sưu tập**, lọc **Áo**, mở **Sơ mi Linen**.
2. Chọn **Kem / M** để kiểm tra trạng thái hết hàng. Chuyển sang **Kem / S**, còn 3 sản phẩm.
3. Thêm một sản phẩm. Giỏ hàng hiển thị tạm tính 549.000 ₫, tiết kiệm 100.000 ₫ và tổng cộng 449.000 ₫. Tồn khả dụng giảm còn 2.
4. Mở giỏ, tăng số lượng hoặc xóa dòng. Xóa hết sản phẩm trả tồn khả dụng về 3. Tải lại trang để kiểm tra giỏ hàng được lưu trên trình duyệt.
5. Mở **Tư vấn phối đồ**, thử **Tìm túi dưới 300k** và bấm liên kết **Túi Canvas**.

Tồn kho là dữ liệu mẫu. Số lượng trong giỏ chỉ giữ tồn trên trình duyệt hiện tại. Chatbot dùng quy tắc để tra giá, ưu đãi và tồn theo màu hoặc size, gợi ý trang phục trong ngân sách và hiểu câu hỏi tiếp nối về món vừa tư vấn. Ứng dụng demo chưa có đặt hàng, thanh toán hoặc cơ sở dữ liệu chung.

## Nguồn ảnh

Ảnh chụp dùng để minh họa mẫu sản phẩm. Màu và kích cỡ của từng biến thể lấy từ danh mục demo. Ảnh thuộc [giấy phép Pexels](https://www.pexels.com/license/).

- [Sơ mi](https://www.pexels.com/photo/20129409/), [quần ống đứng](https://www.pexels.com/photo/9873425/), [túi canvas](https://www.pexels.com/photo/35685413/), [áo thun](https://www.pexels.com/photo/12039633/)
- [Quần jeans](https://www.pexels.com/photo/1082528/), [áo khoác denim](https://www.pexels.com/photo/13662420/), [hoodie](https://www.pexels.com/photo/867378/), [áo len](https://www.pexels.com/photo/14111130/)
- [Sneaker](https://www.pexels.com/photo/1461048/), [mũ](https://www.pexels.com/photo/8550900/), [kính râm](https://www.pexels.com/photo/29538700/)

## GitHub Actions và GitHub Pages

1. Đưa mã nguồn và `package-lock.json` lên một kho GitHub có nhánh chính `main`.
2. Mở **Settings → Pages → Build and deployment**, chọn nguồn **GitHub Actions**.
3. Đẩy mã lên `main` hoặc chạy workflow **CI and GitHub Pages** từ tab **Actions**. Workflow chạy kiểm thử và build trước khi xuất bản thư mục `dist`.
4. Lấy URL tại bước **deploy** hoặc **Settings → Pages**. Vue Router dùng URL có dấu `#` để mở trực tiếp trang chi tiết trên máy chủ tĩnh.

[Tài liệu triển khai tĩnh của Vite](https://vite.dev/guide/static-deploy.html#github-pages)

