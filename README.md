# 📈 InvestPro - Ứng Dụng Quản Lý Danh Mục Đầu Tư & Phân Bổ Lô Mua Bán Dần (Tax-Lot Portfolio Manager)

**InvestPro** là ứng dụng quản lý tài sản tài chính chuyên nghiệp, được tối ưu cho thị trường chứng khoán Việt Nam (HOSE, HNX, UPCOM) và toàn cầu. Ứng dụng hỗ trợ theo dõi chi tiết **từng lần mua vào (Tax-Lot Tracking)** song song với **Giá vốn bình quân gia quyền (Weighted Average Cost - WAC)**, cùng cơ chế **bán dần từng phần theo 5 chiến lược phân bổ lô**.

---

## 🌟 Tính Năng Nổi Bật

- **Phân Biệt Rõ Ràng Giá Vốn & Giá Thị Trường**:
  - **Giá Mua Vào Từng Đợt (Lô Mua)**: Lưu vết chính xác ngày mua, giá khớp và khối lượng của từng đợt giải ngân.
  - **Giá Vốn Trung Bình (WAC)**: Tự động tính toán theo công thức bình quân gia quyền.
  - **Giá Thị Trường (Bảng Điện)**: Tự động cập nhật từ API uy tín (VNDIRECT, DNSE) hoặc gõ sửa tay trực tiếp ngay trên bảng.
- **Động Cơ Bán Dần 5 Chiến Lược**:
  - `FIFO` (Nhập trước - Xuất trước)
  - `LIFO` (Nhập sau - Xuất trước)
  - `HIGHEST_COST` (Ưu tiên lô giá vốn cao nhất)
  - `LOWEST_COST` (Ưu tiên lô giá vốn thấp nhất)
  - `CUSTOM` (Tự chọn khối lượng bán từ từng lô cụ thể)
  - Xem trước lãi chốt thực tế và Giá vốn TB mới của số cổ phiếu còn lại trước khi xác nhận.
- **Sổ Nhật Ký Chốt Lời / Cắt Lỗ (Realized P&L Tracker)**:
  - Thống kê tỷ lệ thắng (Win Rate), lợi nhuận ròng thực tế, tổng thuế & phí đã khấu trừ.
- **Trợ Lý Quản Trị Rủi Ro (Financial Advisor)**:
  - Cảnh báo tập trung tài sản, khuyến nghị tái cân bằng danh mục, điểm chốt lời / cắt lỗ từng lô theo phân tích kỹ thuật (RSI, MA20, MA50, Bolinger Bands).
- **Xuất / Nhập Sao Lưu Dữ Liệu**:
  - Tự động lưu trên trình duyệt (LocalStorage) và hỗ trợ xuất/nhập file JSON an toàn.

---

## 🚀 Cài Đặt & Chạy Ứng Dụng

### Yêu Cầu
- [Node.js](https://nodejs.org/) (phiên bản 18+ khuyến nghị)
- Trình duyệt hiện đại (Chrome, Edge, Firefox, Brave...)

### Hướng Dẫn Chạy

```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi chạy dev server
npm run dev

# 3. Build sản xuất
npm run build
```

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Glassmorphism UI
- **Biểu Đồ & Trực Quan**: Chart.js, React-Chartjs-2
- **Icons**: Lucide React
- **Hiệu Ứng**: Canvas Confetti

---

## 📄 Bản Quyền
InvestPro © 2024. Giữ toàn quyền tác giả.
