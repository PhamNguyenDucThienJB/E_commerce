import { React, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getProductById, relateProduct } from "../api/ProductApi";
import { useParams } from "react-router-dom";
import { modifyCartItem } from "../api/CartApi";
import { toast } from "react-toastify";
import { getAttribute, getAttributeById } from "../api/AttributeApi";
import { isEnoughCartItem } from "../api/CartApi";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import { getCartItemByAccountId } from "../api/CartApi";

const ProductDetail = (props) => {
  const { id } = useParams();
  const [item, setItem] = useState();
  const [attributes, setAttributes] = useState([]);
  const [price, setPrice] = useState();
  const [stock, setStock] = useState();
  const [flag, setFlag] = useState();
  const [count, setCount] = useState(1);
  const [status, setStatus] = useState(true);
  const [relate, setRelate] = useState([]);
  const [show, setShow] = useState(false);
  const [temp, setTemp] = useState();
  const [cart, setCart] = useState();

  const handleClose = () => setShow(false);
  const handleShow = (value) => {
    getProductById(value)
      .then((res) => {
        setTemp(res.data);
        console.log(res.data);
      })
      .catch((error) => console.log(error));
    setShow(true);
  };

  useEffect(() => {
    onLoad();
  }, [id]);

  const onLoad = () => {
    getProductById(id)
      .then((res) => {
        setItem(res.data);
        setAttributes(res.data.attributes);
        relateProduct(res.data.id, res.data.brandId)
          .then((resp) => {
            setRelate(resp.data.content);
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));

    getAttribute(id, 39)
      .then((res) => {
        onModify(res.data.price, res.data.stock, res.data.id);
      })
      .catch((error) => console.log(error));
    setStatus(stock > count);

    if(props.user){
      getCartItemByAccountId(props.user.id).then((resp) => {
        setCart(resp.data.map((item) => ({ ...item, checked: false })));
      });
    }

    props.changeHeaderHandler(2);
  };

  const onModify = (price, stock, flag) => {
    setCount(1);
    setStatus(stock > count);
    setPrice(price);
    setStock(stock);
    setFlag(flag);
  };

  const onAddCartHandler = async (attributeId, lastPrice) => {
    if (!status) {
      toast.warning("Sản phẩm đã hết hàng.");
    } else {
      if (flag) {
        if (props.user) {
          const flagId = cart.map((item) => item.id);
          const obj = cart.filter((i) => i.id == attributeId)[0];
          console.log(obj);
          const data = {
            accountId: props.user.id,
            attributeId: attributeId,
            quantity: flagId.includes(attributeId) ? (count + obj.quantity) : count,
            lastPrice: lastPrice,
          };
          console.log(data);
          modifyCartItem(data)
            .then(() => {
              toast.success("Thêm vào giỏ hàng thành công.");
            })
            .catch((error) => {
              setCount(1);
              toast.error(error.response.data.Errors);
            });
        } else {
          getAttributeById(attributeId)
            .then((resp) => {
              const data = {
                id: attributeId,
                image: item.main,
                name: item.name,
                size: resp.data.size,
                price: resp.data.price,
                stock: resp.data.stock,
                discount: item.discount,
                quantity: count,
                lastPrice: lastPrice,
              };
              props.addHandler(data);
              toast.success("Thêm vào giỏ hàng thành công.");
            })
            .catch((error) => console.log(error));
        }
      } else {
        toast.warning("Mời chọn size.");
      }
    }
  };

  const updateCount = (value) => {
    console.log(value);
    if(value >= 1){
      isEnoughCartItem(flag, value)
      .then(() => {
        setCount(value);
      })
      .catch((error) => {
        toast.warning(error.response.data.Errors);
        setCount(1);
      });
    }else{
      toast.warning("Số lượng không hợp lệ");
    }
   
  };

  const addCount = (value) => {
    isEnoughCartItem(flag, value)
      .then(() => {
        setCount(value);
      })
      .catch((error) => {
        toast.warning(error.response.data.Errors);
      });
  };

  return (
    <div>
      {item && (
        <div className="col-12 mt-5">
          <div>
            <div className="card mb-3 border-0">
              <div className="row g-0">
                <div className="col-md-4">
                  <img
                    src={require(`../static/images/${item.main}`)}
                    className="img-fluid rounded-start"
                    style={{ width: "600px", height: "400px" }}
                    alt=""
                  />
                </div>
                <div className="col-md-8">
                  <div className="card-body">
                    <h1 className="card-title text-danger fw-bolder">
                      {item.name}
                    </h1>
                    <hr />
                    <p className="card-text fw-bold fs-5">Mã SP: {item.code}</p>
                    <hr />
                    <h4 className="card-text fw-bolder text-danger fs-5">
                      Giá bán:{" "}
                      {price &&
                        (
                          (price * (100 - item.discount)) /
                          100
                        ).toLocaleString() + " đ"}
                    </h4>
                    <h6 className="card-text fw-bolder fs-5">
                      Giá gốc:{" "}
                      <del>{price && price.toLocaleString() + " đ"}</del>
                    </h6>
                    <h6 className="card-text fw-bolder fs-5" hidden>
                      Sản phẩm còn: {stock && stock + " đôi"}
                    </h6>
                    <hr />
                    <div className="div">
                      <label className="mr-5">Chọn size</label>
                      {attributes.map((i, index) => (
                        <div
                          className="form-check form-check-inline"
                          key={index}
                        >
                          <input
                            className="form-check-input"
                            type="radio"
                            name="inlineRadioOptions"
                            id="inlineRadio3"
                            defaultValue="option3"
                            onChange={() => onModify(i.price, i.stock, i.id)}
                            disabled={i.stock === 0}
                            checked={flag == i.id}
                          />
                          <label className="form-check-label">{i.size}</label>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5">
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => addCount(count + 1)}
                      >
                        +
                      </button>
                      <input
                      className="text-center"
                        type="number"
                        name="quantity"
                        style={{ width: "60px" }}
                        value={count}
                        onChange={(e) => updateCount(e.target.value)}
                        min={1}
                      />
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => addCount(count - 1)}
                        disabled={count == 1}
                      >
                        -
                      </button>
                    </div>
                    <hr />
                    <button
                      onClick={() =>
                        onAddCartHandler(
                          flag,
                          (price * (100 - item.discount)) / 100
                        )
                      }
                      className="btn btn-primary text-white"
                    >
                      Thêm vào giỏ
                    </button>
                    <NavLink to="/cart" className="btn btn-primary ml-2">
                      Đi đến giỏ hàng
                    </NavLink>
                  </div>
                </div>
                <div className="container row offset-3 mt-5">
                  <img
                    src={require(`../static/images/${item.images[0]}`)}
                    alt="..."
                    className="img-thumbnail mr-3"
                    style={{ width: "200px", height: "200px" }}
                  />
                  <img
                    src={require(`../static/images/${item.images[1]}`)}
                    alt="..."
                    className="img-thumbnail mr-3"
                    style={{ width: "200px", height: "200px" }}
                  />
                  <img
                    src={require(`../static/images/${item.images[2]}`)}
                    alt="..."
                    className="img-thumbnail mr-3"
                    style={{ width: "200px", height: "200px" }}
                  />
                  <img
                    src={require(`../static/images/${item.images[3]}`)}
                    alt="..."
                    className="img-thumbnail mr-3"
                    style={{ width: "200px", height: "200px" }}
                  />
                  <img
                    src={require(`../static/images/${item.images[4]}`)}
                    alt="..."
                    className="img-thumbnail mr-3"
                    style={{ width: "200px", height: "200px" }}
                  />
                </div>
              </div>
            </div>
            <div className="col-8 offset-2">
              <div className="container-fluid padding">
                <div className="row welcome text-center text-dark mb-2 mt-5">
                  <div className="col-12">
                    <p className="display-4" style={{ fontSize: "34px" }}>
                      Mô tả sản phẩm
                    </p>
                  </div>
                </div>
              </div>
              <div className="container-fluid padding">
                <h5 className="font-italic">{item.description}</h5>
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="container-fluid padding">
              <div className="row welcome text-center text-dark mb-5 mt-5">
                <div className="col-12">
                  <p className="display-4" style={{ fontSize: "34px" }}>
                    Sản phẩm liên quan
                  </p>
                </div>
              </div>
            </div>
            <div className="container-fluid padding">
              <div className="row padding">
                {relate &&
                  relate.map((item, index) => (
                    <div className="col-md-4 mb-3" key={index}>
                      <div className="card h-100 mini-pro">
                        <div className="d-flex justify-content-between position-absolute w-100">
                          <div className="label-new">
                            <span className="text-white bg-success small d-flex align-items-center px-2 py-1">
                              <i className="fa fa-star" aria-hidden="true"></i>
                              <span className="ml-1">New</span>
                            </span>
                          </div>
                        </div>
                        <NavLink to={`/product-detail/${item.id}`}>
                          <img
                            src={require(`../static/images/${item.image}`)}
                            style={{ width: 150, height: 150 }}
                            alt="Product"
                            className="mini-card"
                          />
                        </NavLink>
                        <div className="card-body px-2 pb-2 pt-1">
                          <div className="d-flex justify-content-between">
                            <div>
                              <p className="h4 text-primary mini-card">
                                {(
                                  (item.price * (100 - item.discount)) /
                                  100
                                ).toLocaleString()}{" "}
                                đ
                              </p>
                            </div>
                          </div>
                          <p className="text-warning d-flex align-items-center mb-2">
                            <i className="fa fa-star" aria-hidden="true"></i>
                            <i className="fa fa-star" aria-hidden="true"></i>
                            <i className="fa fa-star" aria-hidden="true"></i>
                            <i className="fa fa-star" aria-hidden="true"></i>
                            <i className="fa fa-star" aria-hidden="true"></i>
                          </p>
                          <p className="mb-0">
                            <strong>
                              <NavLink
                                to={`/product-detail/${item.id}`}
                                className="text-secondary "
                              >
                                {item.name}
                              </NavLink>
                            </strong>
                          </p>
                          <p className="mb-1">
                            <small>
                              <NavLink to="#" className="text-secondary ">
                                {item.brand}
                              </NavLink>
                            </small>
                          </p>
                          <div className="d-flex mb-3 justify-content-between">
                            <div>
                              <p className="mb-0 small">
                                <b>Yêu thích: </b> {item.view} lượt
                              </p>
                              <p className="mb-0 small">
                                <b>Giá gốc: {item.price.toLocaleString()} đ</b>
                              </p>
                              <p className="mb-0 small text-danger">
                                <span className="font-weight-bold">
                                  Tiết kiệm:{" "}
                                </span>{" "}
                                {(
                                  (item.price * item.discount) /
                                  100
                                ).toLocaleString()}{" "}
                                đ ({item.discount}%)
                              </p>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <div className="col px-0 ">
                              <button
                                onClick={() => handleShow(item.id)}
                                className="btn btn-outline-primary btn-block"
                              >
                                So sánh
                                <i
                                  className="fa fa-shopping-basket"
                                  aria-hidden="true"
                                ></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>So sánh sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>{item && item.name}</th>
                <th>{temp && temp.name}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Code</td>
                <td>{item && item.code}</td>
                <td>{temp && temp.code}</td>
              </tr>
              <tr>
                <td>Thương hiệu</td>
                <td>{item && item.brand}</td>
                <td>{temp && temp.brand}</td>
              </tr>
              <tr>
                <td>Giá</td>
                <td>{item && item.price.toLocaleString()} đ</td>
                <td>{temp && temp.price.toLocaleString()} đ</td>
              </tr>
              <tr>
                <td>Giảm giá</td>
                <td>{item && item.discount} %</td>
                <td>{temp && temp.discount} %</td>
              </tr>
              <tr>
                <td>Lượt thích</td>
                <td>{item && item.view}</td>
                <td>{temp && temp.view}</td>
              </tr>
              <tr>
                <td>Size</td>
                <td>
                  {item &&
                    item.attributes.reduce(
                      (result, item) => result + " " + item.size + "",
                      ""
                    )}
                </td>
                <td>
                  {temp &&
                    temp.attributes.reduce(
                      (result, item) => result + " " + item.size + "",
                      ""
                    )}
                </td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductDetail;
