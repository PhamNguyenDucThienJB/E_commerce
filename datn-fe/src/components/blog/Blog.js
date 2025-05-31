import React, { useEffect } from "react";
import "./Blog.css";

const Blog = (props) => {

  useEffect(() => {
    props.changeHeaderHandler(4);
  }, [props]);

  return (
    <div className="col-10 offset-1 card">
      <h4 className="text-uppercase text-primary">Cam kết sản phẩm</h4>
      <p>1. Tất cả sản phẩm áo thun mang thương hiệu <strong>S&A (Sustainable Fashion)</strong> cam kết 100% chất liệu hữu cơ, thân thiện với môi trường và không gây hại cho sức khỏe người sử dụng.</p>
      <p>2. Sản phẩm được sản xuất tại Việt Nam với quy trình kiểm định nghiêm ngặt, đạt các tiêu chuẩn quốc tế về thời trang bền vững.</p>
      <p>3. Chúng tôi cam kết không sử dụng lao động trẻ em, không sử dụng chất liệu có nguồn gốc từ động vật và luôn minh bạch về nguồn gốc sản phẩm.</p>

      <hr />

      <h4 className="text-uppercase text-primary">Hỗ trợ mua hàng</h4>
      <p>1. Bảo hành đường may, hình in, lỗi kỹ thuật từ nhà sản xuất trong vòng 30 ngày kể từ ngày nhận hàng.</p>
      <p>2. Hỗ trợ đổi size miễn phí trong vòng 7 ngày nếu sản phẩm còn nguyên tag và chưa qua sử dụng.</p>
      <p>3. Khách hàng cần cung cấp hoá đơn mua hàng (hoá đơn online khi đặt hàng) để được xác minh bảo hành và hỗ trợ đổi trả.</p>

      <h6 className="fw-fw-bolder">* Những trường hợp không được bảo hành</h6>
      <p>1. Sản phẩm bị hư hỏng do tác động bên ngoài hoặc do người sử dụng bảo quản sai cách (như dùng chất tẩy mạnh, phơi dưới ánh nắng gắt,...).</p>
      <p>2. Sản phẩm đã qua chỉnh sửa hoặc không còn nguyên trạng như lúc ban đầu.</p>
      <p>3. Không có hoá đơn mua hàng hợp lệ.</p>
      <p>4. Trường hợp đổi mẫu khác nếu hết size, khách hàng chịu phí xử lý đổi trả 30.000đ/lần.</p>
      <div className="alert alert-warning mt-3">
        <strong>Lưu ý:</strong> Nếu thanh toán online qua <strong>PayPal</strong>, quý khách sẽ phải thanh toán thêm <strong>phí giao dịch 4.4% – 5%</strong> trên tổng giá trị đơn hàng.
      </div>

    </div>
  );
};

export default Blog;
