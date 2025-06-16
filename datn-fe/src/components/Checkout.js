import React, { useState, useEffect } from "react";
import { getAllProvince } from "../api/ProvinceApi";
import { getCartItemByAccountId } from "../api/CartApi";
import { useForm } from "react-hook-form";
import { createOrder } from "../api/OrderApi";
import { toast } from "react-toastify";
import { NavLink, useHistory  } from "react-router-dom";
import { getVoucherByCode } from "../api/VoucherApi";
import Spinner from "./spinner/Spinner";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import "./Checkout.css";

const Checkout = (props) => {
  const [amount, setAmount] = useState();
  const [cart, setCart] = useState([]);
  const [info, setInfo] = useState();
  const [district, setDistrict] = useState();
  const [ward, setWard] = useState();
  const [voucher, setVoucher] = useState("");
  const [flag, setFlag] = useState(false);
  const [sub, setSub] = useState();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("Thanh toán khi giao hàng(COD)");
  const [showFirst, setShowFirst] = useState(false);
  const [obj, setObj] = useState({});
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paypalPaid, setPaypalPaid] = useState(false);
  const exchangeRate = 25000;
  const amountUSD = amount ? (amount / exchangeRate).toFixed(2) : 0;



  function formatVND(amount) {
    return Math.ceil(amount).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  
  
  const handleCloseFirst = () => {
    setShowFirst(false);
  };
  const handleShowFirst = (data) => {
    setObj(data);
    setShowFirst(true);
  };
  const history = useHistory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  useEffect(() => {
    onLoad();
  }, []);
 
  const textHandler = (value) => {
    setText(value);
  };
  const onLoad = () => {
    getAllProvince().then((resp) => setInfo(resp.data));
    if (props.user) {
      getCartItemByAccountId(props.user.id).then((resp) => {
        setCart(resp.data.filter((item) => props.buy.includes(item.id + "")));
        const result = resp.data
          .filter((item) => props.buy.includes(item.id + ""))
          .reduce((price, item) => price + item.lastPrice * item.quantity, 0);
        setAmount(result);
      });
      const flag = {
        address: props.user.address,
        name: props.user.fullName,
        phone: props.user.phone,
        email: props.user.email
      }
      reset(flag);
    } else {
      setCart(
        props.cartItem.filter((item) => props.buy.includes(item.id + ""))
      );
      const result = props.cartItem
        .filter((item) => props.buy.includes(item.id + ""))
        .reduce((price, item) => price + item.lastPrice * item.quantity, 0);
      setAmount(result);
    }
    props.changeHeaderHandler(3);
    props.user ? console.log(props.user) : console.log('');
  };

  const voucherHandler = (value) => {
    setVoucher(value);
  };

  const useVoucherHandler = () => {
    if (flag) {
      toast.warning("Voucher đã được áp dụng.");
    } else {
      getVoucherByCode(voucher)
        .then((resp) => {
          setAmount(
            (prevState) => (prevState * (100 - resp.data.discount)) / 100
          );
          setFlag(true);
          toast.success("Áp dụng voucher thành công.");
          setSub((amount * resp.data.discount) / 100);
        })
        .catch((error) => toast.error(error.response.data.Errors));
    }
  };

  const refreshVoucherHandler = () => {
    setFlag(false);
    setVoucher("");
    setSub("");
    onLoad();
  };
  const onLoadDistrictHandler = (id) => {
    const resp = info.filter((item) => item.name === id);
    setDistrict(resp[0].districts);
  };

  const onLoadWardHandler = (id) => {
    const resp = district.filter((item) => item.name === id);
    setWard(resp[0].wards);
  };

  const handleVNPayPayment = async () => {
    try {
      const orderInfo = "Thanh toán đơn hàng #123";
      const amount = 1000000; // Số tiền thanh toán (VND)
  
      const response = await fetch("http://localhost:8080/api/payment/vnpay", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          amount,
          orderInfo,
        }),
      });
  
      const data = await response.json();
      if (data.code === "00") {
        window.location.href = data.data; // Chuyển hướng sang trang thanh toán VNPAY
      } else {
        alert("Lỗi khi tạo thanh toán!");
      }
    } catch (error) {
      console.error("Lỗi thanh toán VNPAY:", error);
    }
  };
  
  const onSubmitHandler = (data) => {
    if (data.payment === "paypal") {
      if (paypalPaid) {
        toast.info("Thanh toán PayPal đã xử lý.");
        return;
      }
  
      toast.info("Đang xử lý thanh toán PayPal...");
  
      fetch("http://localhost:8080/api/site/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total: amount }),
      })
        .then((res) => res.text())
        .then((url) => {
          if (url.startsWith("http")) {
            window.location.href = url; // Chuyển hướng đến PayPal
          } else {
            toast.error("Thanh toán PayPal thất bại!");
          }
        })
        .catch(() => toast.error("Lỗi kết nối PayPal"));
    } else {
      // Nếu thanh toán không qua PayPal, tạo đơn hàng ngay
      processOrder(data);
    }
  };
  
  // Xử lý khi thanh toán PayPal thành công
  const handlePayPalSuccess = (data) => {
    setPaypalPaid(true);
    toast.success("Thanh toán PayPal thành công!");
  
    // Tạo đơn hàng sau khi thanh toán
    processOrder({ ...obj, payment: "paypal" });
  
    // Đóng Modal
    handleCloseFirst();
  };
  
  // Hàm tạo đơn hàng chung
  const processOrder = (data) => {
    setLoading(true);
    setTimeout(() => setLoading(false), 14000);
  
    const order = {
      fullname: data.name,
      phone: data.phone,
      address: `${data.address}, ${data.ward}, ${data.district}, ${data.province}`,
      email: data.email,
      total: amount,
      note: data.note,
      isPending: false,
      payment: data.payment,
      accountId: props.user ? props.user.id : -1,
      code: voucher,
      orderDetails: cart.map((item) => ({
        quantity: item.quantity,
        originPrice: item.price,
        sellPrice: (item.price * (100 - item.discount)) / 100,
        attribute: { id: item.id },
      })),
    };
  
    console.log("Dữ liệu gửi đi:", order);
  
    createOrder(order)
      .then((resp) => {
        toast.success("Đặt hàng thành công!");
        props.clearHandler();
        history.push(`/order/detail/${resp.data.encodeUrl}`);
      })
      .catch(() => history.push("/out-of-stock"));
  };
  async function convertUSDtoVND(amountUSD) {
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await response.json();
      const rate = data.rates.VND; // Lấy tỷ giá USD → VND
      const amountVND = amountUSD * rate;
  
      console.log("Tỷ giá hiện tại:", rate);
      console.log("Số tiền sau khi quy đổi:", formatVND(amountVND));
  
      return amountVND;
    } catch (error) {
      console.error("Lỗi khi lấy tỷ giá:", error);
      const amountVND = amountUSD * exchangeRate;
      console.log("Số tiền quy đổi (dùng tỷ giá mặc định):", formatVND(amountVND));
      return amountVND;
    }
  }
  

  return (
    <div className="pb-3 container-fluid checkout-container">
      <div className="py-3 col-10 offset-1 text-center">
        <h2 className="text-danger checkout-title">Thông tin mua hàng</h2>
        {loading && <Spinner></Spinner>}
      </div>
      <div className="row checkout-row">
        <div className="col-md-5 col-lg-4 order-md-last checkout-cart">
          <h4 className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-dark">Giỏ hàng của bạn</span>
            <span className="badge bg-primary rounded-pill">{cart.length}</span>
          </h4>
          <ul className="list-group mb-3">
            {cart &&
              cart.map((item, index) => (
                <li
                  className="list-group-item d-flex justify-content-between lh-sm"
                  key={index}
                >
                  <div>
                    <h6 className="my-0">
                      {item.name} - {item.size}
                    </h6>
                    <small className="text-muted">
                      {item.lastPrice.toLocaleString()} x {item.quantity}
                    </small>
                  </div>
                  <strong>
                    {(item.lastPrice * item.quantity).toLocaleString()}
                  </strong>
                </li>
              ))}
            <li className="list-group-item d-flex justify-content-between bg-light">
              <div className="text-success">
                <h6 className="my-2">Mã giảm giá</h6>
                <input
                  className="form-control my-2"
                  value={voucher}
                  disabled={flag}
                  type="text"
                  onChange={(e) => voucherHandler(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary mr-3"
                  onClick={useVoucherHandler}
                >
                  Áp dụng
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={refreshVoucherHandler}
                >
                  Làm mới
                </button>
              </div>
            </li>
            {sub && (
              <li className="list-group-item d-flex justify-content-between">
                <span>Giá giảm (VND)</span>
                <strong>- {sub.toLocaleString()}</strong>
              </li>
            )}
            <li className="list-group-item d-flex justify-content-between">
              <span>Tổng tiền (VND)</span>
              <strong>{amount && amount.toLocaleString()}</strong>
            </li>
          </ul>
          <NavLink
            to="/cart"
            className={cart.length === 0 ? "mb-2 mr-5 disabled" : "mb-2 mr-5"}
            exact
          >
            Quay về giỏ hàng
          </NavLink>
        </div>
        <div className="col-md-7 col-lg-8 checkout-address">
          <h4 className="mb-3">Địa chỉ nhận hàng</h4>
          <form
            className="needs-validation checkout-form"
            onSubmit={handleSubmit(handleShowFirst)}
          >
            <div className="row g-3">
              <div className="col-sm-6">
                <label htmlFor="firstName" className="form-label">
                  <strong>Tỉnh Thành</strong>
                </label>
                <select
                  className="form-control"
                  {...register("province", { required: true })}
                  required
                  onChange={(e) => onLoadDistrictHandler(e.target.value)}
                >
                  <option selected disabled hidden></option>
                  {info &&
                    info.map((item, index) => (
                      <option key={index} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-sm-6">
                <label htmlFor="lastName" className="form-label">
                  <strong>Quận Huyện</strong>
                </label>
                <select
                  className="form-control"
                  {...register("district", { required: true })}
                  required
                  onChange={(e) => onLoadWardHandler(e.target.value)}
                >
                  <option selected disabled hidden></option>
                  {district &&
                    district.map((item, index) => (
                      <option key={index} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-sm-6 mt-2">
                <label htmlFor="lastName" className="form-label">
                  <strong>Phường Xã</strong>
                </label>
                <select
                  className="form-control"
                  {...register("ward", { required: true })}
                  required
                >
                  <option selected disabled hidden></option>
                  {ward &&
                    ward.map((item, index) => (
                      <option value={item.name} key={index}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-12 mt-2">
                <label htmlFor="address" className="form-label">
                  <strong>Địa chỉ</strong>
                </label>
                <textarea
                  className="form-control"
                  id="exampleFormControlTextarea1"
                  rows={3}
                  defaultValue={""}
                  {...register("address", {
                    required: true,
                    pattern: /^\s*\S+.*/,
                  })}
                />
                {errors.address && (
                  <div className="alert alert-danger" role="alert">
                    Địa chỉ không hợp lệ!
                  </div>
                )}
              </div>

              <div className="col-sm-6 mt-2">
                <label htmlFor="lastName" className="form-label">
                  <strong> Họ tên</strong>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  {...register("name", {
                    required: true,
                    pattern: /^\s*\S+.*/,
                  })}
                />
                {errors.name && (
                  <div className="alert alert-danger" role="alert">
                    Họ tên không hợp lệ!
                  </div>
                )}
              </div>
              <div className="col-sm-6 mt-2">
                <label htmlFor="lastName" className="form-label">
                  <strong>Số điện thoại</strong>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  {...register("phone", {
                    required: true,
                    pattern: /^0[0-9]{9}$/,
                  })}
                />
                {errors.phone && (
                  <div className="alert alert-danger" role="alert">
                    Số điện thoại không hợp lệ!
                  </div>
                )}
              </div>
              <div className="col-sm-6 mt-2">
                <label htmlFor="lastName" className="form-label">
                  <strong> Email</strong>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="lastName"
                  {...register("email", {
                    required: true,
                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  })}
                />
                {errors.email && (
                  <div className="alert alert-danger" role="alert">
                    Email không hợp lệ!
                  </div>
                )}
              </div>
              <div className="col-12 mt-2">
                <label htmlFor="address" className="form-label">
                  <strong>Ghi chú</strong>
                </label>
                <textarea
                  className="form-control"
                  id="exampleFormControlTextarea1"
                  rows={3}
                  defaultValue={""}
                  {...register("note", { required: false })}
                />
              </div>
            </div>
            <label htmlFor="lastName" className="form-label mt-3">
              <strong>Phương thức thanh toán</strong>
            </label>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                value="Thanh toán khi giao hàng(COD)"
                {...register("payment", { required: true })}
                defaultChecked={true}
                onChange={(e) => textHandler(e.target.value)}
              />
              <label className="form-check-label">
                Thanh toán khi giao hàng(COD) <br />
              </label>
              {text === "Thanh toán khi giao hàng(COD)" && (
                <div className="alert alert-dark">
                  <p>Bạn được KIỂM TRA hàng và thanh toán khi nhận được hàng</p>
                </div>
              )}
            </div>
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="radio"
                value="Chuyển khoản qua ngân hàng"
                {...register("payment", { required: true })}
                onChange={(e) => textHandler(e.target.value)}
              />
              <label className="form-check-label">
                Chuyển khoản qua ngân hàng <br />
              </label>
              {text === "Chuyển khoản qua ngân hàng" && (
                <div className="alert alert-dark">
                  <p>
                    Vui lòng ghi lại MÃ ĐƠN HÀNG và SỐ ĐIỆN THOẠI của bạn vào
                    mục Nội dung thanh toán. Đơn hàng sẽ đươc giao sau khi tiền
                    đã được chuyển.
                  </p>
                  <p>Ví dụ: 01234 - 0987654321</p>
                  <p>Thông tin tài khoản:</p>
                  <p>
                    Phạm Nguyễn Đức Thiện - stk: 04136519801 - BIDV chi nhánh Đông Sài Gòn
                  </p>
                </div>
              )}
            </div>
            <div className="form-check">
            <input
                  className="form-check-input"
                  type="radio"
                  value="paypal"
                  {...register("payment", { required: true })}
                  onChange={() => textHandler("paypal")}
                />
                <label className="form-check-label">Thanh toán qua PayPal</label>

            </div>
                  <div className="d-flex justify-content-center mt-5 mb-5">
                    <button className="btn btn-primary btn-lg" type="submit">
              Đặt hàng
            </button>
                  </div>
          </form>
        </div>
      </div>
              

          <Modal show={showFirst} onHide={handleCloseFirst}>
            <Modal.Header closeButton>
              <Modal.Title style={{ textAlign: "center" }}>
                Bạn đã chắc chắn chưa?
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {obj.payment === "paypal" ? (
                <PayPalScriptProvider options={{ "client-id": "AeZ36kQifDQpEoJVWEME3Qp6y01B0niaqboOYJBg3JN3IQUcKpAmfcfcEALa-A9OwHxYT873i-2M6enl" }}>
                  <PayPalButtons
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: {
                              currency_code: "USD",
                              value: amountUSD,
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      try {
                        const details = await actions.order.capture();
                        toast.success("Thanh toán PayPal thành công!");
                        const totalUSD = details.purchase_units[0].amount.value;
                        const totalVND = Math.round( (await convertUSDtoVND(totalUSD))/ 1000)*1000;
                        const orderData = {
                          fullname: obj.name || "Tên mặc định",
                          phone: obj.phone || "0000000000",
                          address: `${obj.address}, ${obj.ward}, ${obj.district}, ${obj.province}`,
                          email: obj.email || "example@email.com",
                          total: totalVND,
                          note: obj.note || "",
                          isPending: true,
                          payment: "paypal",
                          accountId: props.user ? props.user.id : -1,
                          code: obj.voucher || "",
                          orderDetails: cart.map((item) => ({
                            quantity: item.quantity,
                            originPrice: item.price,
                            sellPrice: (item.price * (100 - item.discount)) / 100,
                            attribute: { id: item.id },
                          })),
                        };
                        console.log("Dữ liệu đơn hàng gửi lên:", orderData);
                        const resp = await createOrder(orderData);
                        handleCloseFirst();
                        console.log(`Số tiền PayPal (USD): ${totalUSD}`);
                        console.log(`Số tiền lưu vào DB (VND): ${totalVND}`);
                    
                        history.push(`/order/detail/${resp.data.encodeUrl}`);

                      } catch (error) {
                        toast.error("Lỗi khi tạo đơn hàng!");
                        console.error(error);
                      }
                    }}
                  />
                </PayPalScriptProvider>
              ) : obj.payment === "Thanh toán khi giao hàng(COD)" ? (
                <div className="confirmation-message">
                  <p>Xác nhận đặt hàng với phương thức thanh toán COD?</p>
                  <p>Tổng tiền: {amount && amount.toLocaleString()} VND</p>
                  <p>Bạn sẽ thanh toán khi nhận được hàng</p>
                </div>
              ) : (
                <div className="confirmation-message">
                  <p>Xác nhận đặt hàng với phương thức chuyển khoản?</p>
                  <p>Tổng tiền: {amount && amount.toLocaleString()} VND</p>
                  <p>Thông tin chuyển khoản:</p>
                  <p>Phạm Nguyễn Đức Thiện - STK: 04136519801</p>
                  <p>BIDV chi nhánh Hà Nội</p>
                  <p>Nội dung: [Mã đơn hàng] - [Số điện thoại]</p>
                </div>
              )}

            </Modal.Body>
            <Modal.Footer>
              {obj.payment !== "paypal" && (
                <Button variant="danger" onClick={() => onSubmitHandler(obj)}>
                  Xác nhận đặt hàng
                </Button>
              )}
              <Button variant="secondary" onClick={handleCloseFirst}>
                Đóng
              </Button>
            </Modal.Footer>
          </Modal>

    </div>
  );
};

export default Checkout;

