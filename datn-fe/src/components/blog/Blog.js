import React, { useEffect } from "react";
import "./Blog.css";

const Blog = (props) => {

  useEffect(() => {
    props.changeHeaderHandler(4);
  }, [props]);

  return (
    <div className="col-10 offset-1 card">
        <h4 className="text-uppercase text-primary">Cam kết sản phẩm</h4>
        <p>1 . Tất cả sản phẩm Sneaker bán ra 100% là Chính Hãng , được nhập 100% từ các nước như MỸ, ANH, NHẬT, HÀN, VIỆT NAM… Full Box, tem tag giấy gói. Giấy giữ form giày sẽ bỏ khi vận chuyển, khách hàng yêu cầu vẫn có.</p>
        <p>2 . Tất cả sản phẩm được nhập từ website Adidas US, Adidas UK, Adidas Japan, Adidas Korea, Adidas Việt Nam</p>
        <p>3 . Chúng Tôi chịu trách nhiệm 100% sản phẩm của Chúng Tôi bán ra , nếu Quý Khách phát hiện BountySneakers bán hàng nhái , hàng fake Chúng Tôi sẽ đền tiền gấp 10 lần giá trị sản phẩm Quý Khách mua hàng.</p>
        <hr />
        <h4 className="text-uppercase text-primary">HỖ TRỢ MUA HÀNG</h4>
        <p>1 . Bảo Hành Chính Hãng Trọn Đời Cho Quý Khách .</p>
        <p>2 . Bảo Hành Bong Tróc, Sổ Chỉ, Bung Keo, Hỏng Đế, Lỗi Sản Phẩm… Chúng Tôi sẽ Bảo Hành cho Quý Khách trong vòng 1 tháng . Sẽ tiến hành sửa chữa khắc phục cho Quý Khách</p>
        <p>3 . Khách Hàng mua hàng phải có Hoá Đơn Mua Hàng (Hoá đơn online khi đặt hàng) để chúng Tôi xác minh thời gian được Bảo Hành.</p>
        <h6 className="fw-fw-bolder">* Những trường hợp không được Bảo Hành</h6>
        <p>1 . Khách Hàng bảo quản không tốt sản phẩm , dùng hoá chất tẩy rửa để làm sạch vết bẩn.</p>
        <p>2 . Lỗi do không phải tự nhiên thì sẽ không được Bảo Hành.</p>
        <p>3 . Không có hoá đơn sẽ không được Bảo Hành.</p>
        <p>4 . Hỗ trợ đổi size nếu không vừa trong vòng 3 ngày. giữ nguyên tag. Trường hợp hết size đổi mẫu khác, trả lại hàng mất phí 150.000đ.</p>
    </div>
  );
};

export default Blog;
