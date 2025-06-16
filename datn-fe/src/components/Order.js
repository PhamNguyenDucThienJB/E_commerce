import React, { useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { getAllOrder, cancelOrder } from "../api/OrderApi";
import { getAllOrderStatus } from "../api/OrderStatusApi";
import { Button, Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { toast } from "react-toastify";
import Alert from "react-bootstrap/Alert";

const Order = (props) => {
  const [order, setOrder] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [status, setStatus] = useState(0);
  const [show, setShow] = useState(false);
  const [obj, setObj] = useState({});
  const [total, setTotal] = useState();
  const [page, setPage] = useState(1);
  const [showFouth, setShowFouth] = useState(false);
  const [description, setDescription] = useState(null);
  const [reason, setReason] = useState(null);
  const history = useHistory();

  const handleCloseFouth = () => {
    setShowFouth(false);
    setReason(null);
    setDescription(null);
  };
  const handleShowFouth = (orderId, statusId) => {
    setShowFouth(true);
    setObj({
      orderId: orderId,
      statusId: statusId,
    });
  };
  var rows = new Array(total).fill(0).map((zero, index) => (
    <li
      className={page === index + 1 ? "page-item active" : "page-item"}
      key={index}
    >
      <button
        className="page-link"
        style={{ borderRadius: 50 }}
        onClick={() => onChangePage(index + 1)}
      >
        {index + 1}
      </button>
    </li>
  ));

  const onChangePage = (page) => {
    setPage(page);
  };

  const descriptionHandler = (value) => {
    console.log(value);
    setDescription(value);
  };

  const confirmUpdateCancel = () => {
    const data = {
      id: obj.orderId,
      description: `${reason} - ${description}`,
    };

    cancelOrder(data)
      .then(() => {
        toast.success("Cập nhật thành công.");
        setStatus(obj.statusId);
        setPage(1);
        getAllOrderByStatus(obj.statusId)
          .then((res) => {
            setOrder(res.data.content);
            setTotal(res.data.totalPages);
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => toast.error(error.response.data.Errors));

    setReason(null);
    setDescription(null);
    setShowFouth(false);
  };

  const reasonHandler = (value) => {
    console.log(value);
    setReason(value);
  };
  useEffect(() => {
    onLoad();
  }, [page]);
  useEffect(() => {
    if (orderStatus.length > 0) {
      const choXacNhan = orderStatus.find((item) => item.name === "Chờ xác nhận");
      if (choXacNhan) {
        setStatus(choXacNhan.id);
        getAllOrderByStatus(choXacNhan.id); // Gọi API để lấy danh sách đơn hàng theo trạng thái mặc định
      }
    }
  }, [orderStatus]);

  const onLoad = () => {
    if (props.user) {
      getAllOrder(props.user.id, status, page, 8)
        .then((res) => {
          setOrder(res.data.content);
          setTotal(res.data.totalPages);
        })
        .catch((error) => console.log(error.response.data.Errors));

      getAllOrderStatus()
        .then((resp) => setOrderStatus(resp.data))
        .catch((error) => console.log(error.response.data.Errors));

      props.changeHeaderHandler(5);
    } else {
      history.push("/error-page");
    }
  };

  const getAllOrderByStatus = (value) => {
    setPage(1);
    setStatus(value);
    getAllOrder(props.user.id, value, page, 8)
      .then((res) => {
        setOrder(res.data.content);
        setTotal(res.data.totalPages);
      })
      .catch((error) => console.log(error.response.data.Errors));
  };

  // Hàm tiện ích để kiểm tra xem đơn hàng đã giao hay chưa
  const isDelivered = (orderStatus) => {
    if (!orderStatus || !orderStatus.name) return false;
    const status = orderStatus.name.toLowerCase();
    return status.includes("đã giao") || status === "delivered";
  };

  // Điều hướng đến trang chi tiết sản phẩm để đánh giá
  const handleRateProducts = (orderId, orderStatus) => {
    // Chỉ cho phép đánh giá khi đơn hàng đã giao
    if (isDelivered(orderStatus)) {
      try {
        // Mã hóa ID đơn hàng
        const encodedOrderId = btoa(orderId.toString());
        // Chuyển hướng đến trang chi tiết đơn hàng với tham số rate=true
        history.push(`/order/detail/${encodedOrderId}?rate=true`);
      } catch (e) {
        console.error("Error encoding order ID:", e);
        toast.error("Có lỗi xảy ra khi chuyển đến trang đánh giá");
      }
    } else {
      toast.info("Bạn chỉ có thể đánh giá khi đơn hàng đã giao");
    }
  };

  return (
    <div>
      <div className="col-12">
        <div className="container-fluid welcome mb-5 mt-2">
          <div className="col-10 offset-1 text mini-card">
            <p className="text-danger text-center" style={{ fontSize: "34px" }}>
              Đơn hàng của bạn
            </p>
          </div>
          <div className="row col-12 mb-5">
            <div className="col-12 mb-3 mt-3 mini-card">
              <div className="form-check form-check-inline mr-5">
                <input
                  className="form-check-input"
                  type="radio"
                  name="inlineRadioOptions"
                  value="0"
                  onChange={(event) => getAllOrderByStatus(event.target.value)}
                  checked={status == 0}
                />
                <label className="form-check-label">Tất cả</label>
              </div>
              {orderStatus &&
                orderStatus.map((item, index) => (
                  <div
                    className="form-check form-check-inline mr-5 ml-5"
                    key={index}
                  >
                    <input
                      className="form-check-input"
                      type="radio"
                      name="inlineRadioOptions"
                      value={item.id}
                      onChange={(event) =>
                        getAllOrderByStatus(event.target.value)
                      }
                      checked={status == item.id}
                    />
                    <label className="form-check-label" htmlFor="inlineRadio2">
                      {item.name}
                    </label>
                  </div>
                ))}
            </div>
            <table className="table table-striped table-bordered mt-2 text-center">
              <thead>
                <tr>
                  <th scope="col">Đơn hàng</th>
                  <th scope="col">Ngày tạo</th>
                  <th scope="col">Tình trạng thanh toán</th>
                  <th scope="col">Tình trạng vận chuyển</th>
                  <th scope="col">Tổng tiền</th>
                  <th scope="col">Đánh giá</th>
                  <th scope="col">Hủy / Trả hàng</th>
                </tr>
              </thead>
              <tbody>
               {order &&
                  [...order]
                    .sort((a, b) => new Date(b.modifyDate) - new Date(a.modifyDate)) // Sắp xếp giảm dần
                    .map((item, index) => (
                    <tr key={index}>
                      <th scope="row">
                        <h6 className="card-title mt-2 bolder">
                          <NavLink to={`/order/detail/${item.encodeUrl}`} exact>
                            #{item.id}
                          </NavLink>
                        </h6>
                      </th>
                      <td>
                        <h6 className="card-title mt-2 bolder">
                          {item.modifyDate}
                        </h6>
                      </td>
                      <td>
                        {item.isPending ? (
                          <h6 className="card-title mt-2 bolder text-success">
                            Đã thanh toán
                          </h6>
                        ) : (
                          <h6 className="card-title mt-2 bolder text-danger">
                            Chưa thanh toán
                          </h6>
                        )}
                      </td>
                      <td>
                        <h6 className="card-title mt-2 bolder">
                          {item.orderStatus.name}
                        </h6>
                      </td>
                      <td>
                        <h6 className="card-title mt-2 bolder">
                          {item.total.toLocaleString()} ₫
                        </h6>
                      </td>
                      <td>
                        {console.log("Trạng thái đơn hàng:", item.orderStatus.name)}
                        {isDelivered(item.orderStatus) && (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleRateProducts(item.id, item.orderStatus)}
                          >
                            <i className="fa fa-star text-warning" aria-hidden="true"></i> Đánh giá
                          </button>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-light"
                          onClick={() => handleShowFouth(item.id, 5)}
                        >
                          <i
                            className="fa fa-ban text-danger"
                            aria-hidden="true"
                          ></i>
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <nav aria-label="navigation" className="col-4 offset-5">
              <ul className="pagination">
                <li className={page == 1 ? "page-item disabled" : "page-item"}>
                  <button
                    className="page-link"
                    style={{ borderRadius: 50 }}
                    onClick={() => onChangePage(1)}
                  >{`<<`}</button>
                </li>
                {rows}
                <li
                  className={page == total ? "page-item disabled" : "page-item"}
                >
                  <button
                    className="page-link"
                    style={{ borderRadius: 50 }}
                    onClick={() => onChangePage(total)}
                  >
                    {" "}
                    {`>>`}
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <Modal show={showFouth} onHide={handleCloseFouth}>
        <Modal.Header closeButton>
          <Modal.Title style={{ textAlign: "center" }}>
            Xác nhận cập nhật?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <Alert.Heading>Hủy đơn hàng</Alert.Heading>
            <hr />
            <Form.Label style={{ marginRight: 30, marginBottom: 10 }}>
              Lí do hủy đơn
            </Form.Label>
            <Form.Select
              style={{ height: 40, width: 420, marginBottom: 20 }}
              onChange={(e) => reasonHandler(e.target.value)}
            >
              <option value={null}></option>
              <option value="Đặt trùng">Đặt trùng</option>
              <option value="Thêm bớt sản phẩm">Thêm bớt sản phẩm</option>
              <option value="Gojek">Không còn nhu cầu</option>
              <option value="AhaMove">Lí do khác</option>
            </Form.Select>
            <Form>
              <Form.Label style={{ marginRight: 30, marginBottom: 10 }}>
                Mô tả
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                onChange={(e) => descriptionHandler(e.target.value)}
              />
            </Form>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={confirmUpdateCancel}
            disabled={!reason || !description}
          >
            Xác nhận
          </Button>
          <Button variant="primary" onClick={handleCloseFouth}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Order;
