# TVN Intelligence Hub

Trang: https://jukytwo.github.io/tvn-hub/

Trang công khai của TVN Intelligence Hub (TVN & Partners): số liệu thị trường và truyền thông tài chính, đồng hồ tâm lý,
hàm ý của tin quan trọng, báo cáo theo khung TVN Intelligence.

- `index.html`: trang, dựng bằng `python -m hub.pages_build` trong mã Hub (không sửa tay).
- `data/hub_pub.json.gz`, `data/hub_dn_pub.json.gz`: dữ liệu công khai, VPS đẩy mỗi giờ (lịch sử nhánh main được gộp
  về một commit mỗi lượt để kho không phình).
- `phieu/`: phiếu yêu cầu từ nút Thực thi.
- `data/bc/`: báo cáo do lịch Claude viết; `data/bc/index.json` là mục lục.

Dữ liệu chỉ gồm số liệu, phân tích của TVN và link về bài gốc; không đăng lại tiêu đề hay trích đoạn báo.
Không phải khuyến nghị đầu tư.
