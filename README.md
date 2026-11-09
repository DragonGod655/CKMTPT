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

Tồn kho là dữ liệu mẫu. Số lượng trong giỏ chỉ giữ tồn trên trình duyệt hiện tại. Chatbot dùng quy tắc mô phỏng, đọc danh mục và tồn khả dụng, chạy với dữ liệu có sẵn. Ứng dụng demo chưa có đặt hàng, thanh toán hoặc cơ sở dữ liệu chung.

## GitHub Actions và GitHub Pages

1. Đưa mã nguồn và `package-lock.json` lên một kho GitHub có nhánh chính `main`.
2. Mở **Settings → Pages → Build and deployment**, chọn nguồn **GitHub Actions**.
3. Đẩy mã lên `main` hoặc chạy workflow **CI and GitHub Pages** từ tab **Actions**. Workflow chạy kiểm thử và build trước khi xuất bản thư mục `dist`.
4. Lấy URL tại bước **deploy** hoặc **Settings → Pages**. Vue Router dùng URL có dấu `#` để mở trực tiếp trang chi tiết trên máy chủ tĩnh.

[Tài liệu triển khai tĩnh của Vite](https://vite.dev/guide/static-deploy.html#github-pages)

