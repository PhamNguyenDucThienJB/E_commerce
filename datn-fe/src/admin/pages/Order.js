import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  getAllOrderAndPagination,
  updateOrderWithStatus,
} from "../../api/OrderApi";
import "../table/table.css";
import Badge from "../badge/Badge";
import { toast } from "react-toastify";
import { Button, Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { getAllOrderStatus } from "../../api/OrderStatusApi";

const orderStatus = {
  "Đang xử lí": "primary",
  "Đang vận chuyển": "warning",
  "Đã giao": "success",
  "Đã hủy": "danger",
};

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = (orderId, statusId) => {
    setShow(true);
    setObj({
      orderId: orderId,
      statusId: statusId,
    });
  };
  const [status, setStatus] = useState(0);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [obj, setObj] = useState({});

  useEffect(() => {
    onLoad();
  }, []);

  const onLoad = () => {
    getAllOrderAndPagination(0, 1, 8)
      .then((res) => setOrders(res.data))
      .catch((error) => console.log(error));
    getAllOrderStatus()
      .then((resp) => setOrderStatuses(resp.data))
      .catch((error) => console.log(error.response.data.Errors));
  };

  const updateStatusHandler = (orderId, statusId) => {
    handleShow(orderId, statusId);
  };

  const confirmUpdateHandler = () => {
    updateOrderWithStatus(obj.orderId, obj.statusId)
      .then(() => {
        onLoad();
        toast.success("Cập nhật thành công.");
      })
      .catch((error) => toast.warning(error.response.data.Errors));
    setShow(false);
  };

  const getAllOrderByStatus = (value) => {
    setStatus(value);
    getAllOrderAndPagination(value, 1, 8)
      .then((res) => setOrders(res.data))
      .catch((error) => console.log(error.response.data.Errors));
  };
  return (
    <div className="col-12">
      <div className="card">
        <div className="card__header">
          <h3>Đơn hàng</h3>
        </div>
        <div className="mb-3 mt-3">
          <div className="form-check form-check-inline mr-5 ml-5">
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
          {orderStatuses &&
            orderStatuses.map((item, index) => (
              <div className="form-check form-check-inline mr-5 ml-5" key={index}>
                <input
                  className="form-check-input"
                  type="radio"
                  name="inlineRadioOptions"
                  value={item.id}
                  onChange={(event) => getAllOrderByStatus(event.target.value)}
                  checked={status == item.id}
                />
                <label className="form-check-label" htmlFor="inlineRadio2">
                  {item.name}
                </label>
              </div>
            ))}
        </div>
        <div className="card__body">
          {orders && (
            <div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Mã đơn hàng</th>
                      <th scope="col">Ngày mua</th>
                      <th scope="col">Thanh toán</th>
                      <th scope="col">Tổng tiền</th>
                      <th scope="col">
                        <Badge
                          type={orderStatus["Đang xử lí"]}
                          content={"Đang xử lí"}
                        />
                      </th>
                      <th scope="col">
                        <Badge
                          type={orderStatus["Đang vận chuyển"]}
                          content={"Đang vận chuyển"}
                        />
                      </th>
                      <th scope="col">
                        <Badge
                          type={orderStatus["Đã giao"]}
                          content={"Đã giao"}
                        />
                      </th>
                      <th scope="col">
                        <Badge
                          type={orderStatus["Đã hủy"]}
                          content={"Đã hủy"}
                        />
                      </th>
                      <th scope="col">#</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders &&
                      orders.map((item, index) => (
                        <tr key={index}>
                          <th scope="row">#OD{item.id}</th>
                          <th>{item.modifyDate}</th>
                          <th
                            className={
                              item.isPending ? "text-success" : "text-danger"
                            }
                          >
                            {item.isPending
                              ? "Đã thanh toán"
                              : "Chưa thanh toán"}
                          </th>
                          <th> {item.total.toLocaleString()} ₫</th>
                          <th>
                            <div className="form-check mb-4">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={index}
                                checked={item.orderStatus.id === 1}
                                value="1"
                                onChange={(e) =>
                                  updateStatusHandler(item.id, e.target.value)
                                }
                              />
                            </div>
                          </th>
                          <th>
                            <div className="form-check mb-4">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={index}
                                checked={item.orderStatus.id === 2}
                                value="2"
                                onChange={(e) =>
                                  updateStatusHandler(item.id, e.target.value)
                                }
                              />
                            </div>
                          </th>
                          <th>
                            <div className="form-check mb-4">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={index}
                                checked={item.orderStatus.id === 3}
                                value="3"
                                onChange={(e) =>
                                  updateStatusHandler(item.id, e.target.value)
                                }
                              />
                            </div>
                          </th>
                          <th>
                            <div className="form-check mb-4">
                              <input
                                className="form-check-input"
                                type="radio"
                                name={index}
                                checked={item.orderStatus.id === 4}
                                value="4"
                                onChange={(e) =>
                                  updateStatusHandler(item.id, e.target.value)
                                }
                              />
                            </div>
                          </th>
                          <th>
                            <NavLink to={`/order-detail/${item.id}`} exact>
                              <i
                                class="fa fa-pencil-square-o"
                                aria-hidden="true"
                              ></i>
                            </NavLink>{" "}
                          </th>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="card__footer">
          <div className="table__pagination">
            <div className="table__pagination-item">First</div>
            <div className="table__pagination-item active">1</div>
            <div className="table__pagination-item">Last</div>
          </div>
        </div>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận cập nhật?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Modal.Footer>
              <Button variant="danger" onClick={confirmUpdateHandler}>
                Xác nhận
              </Button>
              <Button variant="primary" onClick={handleClose}>
                Đóng
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Order;
