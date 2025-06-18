import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  getAllOrderAndPagination,
  getOrderByOrderStatusAndYearAndMonth,
  getOrderByOrderStatusBetweenDate,
  getOrderById,
  getOrderDetailByOrderId,
  approveReturnOrder,
  rejectReturnOrder
} from "../../api/OrderApi";
import "../table/table.css";
import Badge from "../badge/Badge";
import { toast } from "react-toastify";
import { Button, Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";

const pendingStatus = {
  true: "success",
  false: "danger",
};

const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const ReturnOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState([]);
  const [returnReason, setReturnReason] = useState("");
  const [total, setTotal] = useState();
  const [page, setPage] = useState(1);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Set up pagination UI
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

  useEffect(() => {
    loadReturnOrders();
  }, [page]);

  const loadReturnOrders = () => {
    // Load all orders and filter return-related statuses (waiting, returned, rejected)
    getAllOrderAndPagination(0, 1, 1000)
      .then((res) => {
        const allOrders = res.data.content || [];
        // Keep orders with status ID 7 (waiting), 6 (returned), or 8 (rejected)
        const returnOrders = allOrders.filter(
          (order) =>
            order.orderStatus && [6, 7, 8].includes(order.orderStatus.id)
        );
        // Paginate client-side
        const pageSize = 20;
        const totalPages = Math.max(Math.ceil(returnOrders.length / pageSize), 1);
        setTotal(totalPages);
        const startIdx = (page - 1) * pageSize;
        const pageSlice = returnOrders.slice(startIdx, startIdx + pageSize);
        setOrders(pageSlice);
      })
      .catch((error) => {
        console.error("Error loading return orders:", error);
        toast.error("Lỗi tải đơn hàng hoàn trả");
      });
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedOrder(null);
    setOrderDetails([]);
    setReturnReason("");
  };

  const handleShowDetails = (orderId) => {
    getOrderById(orderId)
      .then((resp) => setSelectedOrder(resp.data))
      .catch((error) => console.log(error));

    getOrderDetailByOrderId(orderId)
      .then((resp) => setOrderDetails(resp.data))
      .catch((error) => console.log(error));

    setShowDetails(true);
  };

  const getAllOrderByOrderStatusAndYearAndMonth = (value) => {
    setMonth(value);
    setFrom("");
    setTo("");
    getOrderByOrderStatusAndYearAndMonth(7, year, value, page, 20)
      .then((res) => {
        console.log("Orders by year/month:", res.data);
        setOrders(res.data.content);
        setTotal(res.data.totalPages);
      })
      .catch((error) => console.log(error));
  };

  const changeYearHandler = (value) => {
    setYear(value);
  };

  const searchHandler = () => {
    if (from.length === 0 || to.length === 0) {
      toast.warning("Chọn ngày cần tìm kiếm.");
    } else {
      if (from > to) {
        toast.warning("Chọn ngày tìm kiếm không hợp lệ.");
      } else {
        let a = from.split("-");
        let strFrom = a[2] + "-" + a[1] + "-" + a[0];
        let b = to.split("-");
        let strTo = b[2] + "-" + b[1] + "-" + b[0];
        getOrderByOrderStatusBetweenDate(7, strFrom, strTo, page, 20)
          .then((res) => {
            setOrders(res.data.content);
            setTotal(res.data.totalPages);
          })
          .catch((error) => console.log(error));
      }
    }
  };

  const handleReturn = (isApproved) => {
    if (!selectedOrder || !selectedOrder.id) return;
    const data = { id: selectedOrder.id, isApproved };
    if (!isApproved) {
      if (!returnReason) {
        toast.warning("Vui lòng nhập lý do từ chối.");
        return;
      }
      data.description = returnReason;
    }
    const apiCall = isApproved ? approveReturnOrder : rejectReturnOrder;
    apiCall(data)
      .then((res) => {
        toast.success(
          isApproved ? "Đã chấp nhận yêu cầu hoàn trả" : "Đã từ chối yêu cầu hoàn trả"
        );
        handleCloseDetails();
        loadReturnOrders();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
      });
  };

  return (
    <div className="col-12">
      <div className="card">
        <div className="card__header">
          <h3>Đơn hoàn hàng</h3>
        </div>
        <div className="row">
          <div className="col-sm-4 mt-2">
            <select
              className="form-control"
              onChange={(e) => changeYearHandler(e.target.value)}
              value={year}
            >
              <option value="">Chọn năm</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>
          </div>
          <div className="col-sm-4 mt-2">
            <select
              className="form-control"
              onChange={(e) =>
                getAllOrderByOrderStatusAndYearAndMonth(e.target.value)
              }
              value={month}
            >
              <option value="">Chọn tháng</option>
              {months &&
                months.map((item, index) => (
                  <option key={index} value={item}>
                    Tháng {item}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4 mt-2">
            <input
              type="date"
              className="border"
              onChange={(e) => setFrom(e.target.value)}
              value={from}
            />
          </div>

          <div className="col-sm-4 mt-2">
            <input
              type="date"
              className="border"
              onChange={(e) => setTo(e.target.value)}
              value={to}
            />
          </div>
          <button
            className="btn btn-primary mt-2"
            onClick={() => searchHandler()}
          >
            Tìm kiếm
          </button>
        </div>
        <div className="row"></div>
        <div className="card__body">
          {orders && (
            <div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Mã đơn hàng</th>
                      <th scope="col">Ngày hoàn trả</th>
                      <th scope="col">Thanh toán</th>
                      <th scope="col">Tổng tiền</th>
                      <th scope="col">Lý do hoàn trả</th>
                      <th scope="col">Trạng thái</th>
                      <th scope="col">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders &&
                      orders.map((item, index) => (
                        <tr key={index}>
                          <th scope="row">
                            <NavLink to={item && item.id ? `/order-detail/${item.id}` : '#'} exact>
                              #OD{item && item.id}
                            </NavLink>
                          </th>
                          <th>{item && item.modifyDate}</th>
                          <th>
                            {item && item.isPending !== undefined && (
                              <Badge
                                type={pendingStatus[item.isPending]}
                                content={
                                  item.isPending
                                    ? "Đã thanh toán"
                                    : "Chưa thanh toán"
                                }
                              />
                            )}
                          </th>
                          <th>{item && item.total ? item.total.toLocaleString() : 0} ₫</th>
                          <th>{item && item.description ? item.description : "Không có lý do"}</th>
                          {/* Trạng thái badge */}
                          <th>
                            {item.orderStatus && (
                              <Badge
                                type={{ 6: 'success', 7: 'warning', 8: 'danger' }[item.orderStatus.id]}
                                content={{ 6: 'Đã hoàn trả', 7: 'Chờ xác nhận', 8: 'Đã từ chối' }[item.orderStatus.id]}
                              />
                            )}
                          </th>
                          {/* Nút chi tiết */}
                          <th>
                            <button
                              className="btn btn-primary"
                              onClick={() => item && item.id && handleShowDetails(item.id)}
                            >
                              Chi tiết
                            </button>
                          </th>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <nav aria-label="Page navigation">
          <ul className="pagination offset-5 mt-3">
            <li className={page === 1 ? "page-item disabled" : "page-item"}>
              <button
                className="page-link"
                style={{ borderRadius: 50 }}
                onClick={() => onChangePage(1)}
              >
                {`<<`}
              </button>
            </li>
            {rows}
            <li className={page === total ? "page-item disabled" : "page-item"}>
              <button
                className="page-link"
                style={{ borderRadius: 50 }}
                onClick={() => onChangePage(total)}
              >
                {`>>`}
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Order Details Modal */}
      <Modal show={showDetails} onHide={handleCloseDetails} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng hoàn trả</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <p className="font-weight-bold">
              Mã đơn hàng: #{selectedOrder && selectedOrder.id}
            </p>
            <p className="font-weight-bold">
              Tên khách hàng: {selectedOrder && selectedOrder.fullname}
            </p>
            <p className="font-weight-bold">
              Số điện thoại: {selectedOrder && selectedOrder.phone}
            </p>
            <p className="font-weight-bold">
              Địa chỉ nhận hàng: {selectedOrder && selectedOrder.address}
            </p>
            <p className="font-weight-bold">
              Lý do hoàn trả: {selectedOrder && selectedOrder.description}
            </p>
            <p className="font-weight-bold">Sản phẩm hoàn trả:</p>
            {orderDetails &&
              orderDetails.map((item, index) => (
                <p key={index}>
                  {item.attribute && item.attribute.name} - Size {item.attribute && item.attribute.size} - Số lượng {item && item.quantity}
                </p>
              ))}
            <p className="font-weight-bold">
              Tổng tiền: {selectedOrder && selectedOrder.total ? selectedOrder.total.toLocaleString() : 0} đ
            </p>
          </Alert>
          <Form.Group controlId="returnReason" className="mt-2">
            <Form.Label>Lý do từ chối (nếu từ chối):</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập lý do từ chối"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => handleReturn(false)}>
            Từ chối
          </Button>
          <Button variant="success" onClick={() => handleReturn(true)}>
            Chấp nhận
          </Button>
          <Button variant="secondary" onClick={handleCloseDetails}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReturnOrders; 