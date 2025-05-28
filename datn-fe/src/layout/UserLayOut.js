import React, { useEffect } from "react";
import Header from "../common/Header";
import Footer from "../common/Footer";
import { Switch, Route } from "react-router-dom";
import Home from "../components/Home";
import ProductDetail from "../components/ProductDetail";
import Cart from "../components/Cart";
import Checkout from "../components/Checkout";
import Order from "../components/Order";
import OrderDetail from "../components/OrderDetail";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Product from "../components/Product";
import { Button, Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useState } from "react";
import OutStock from "../components/OutStock";
import Error from "../components/Error";
import Paypal from "../components/Paypal";
import Search from "../components/Search";
import Register from "../authenticate/Register";
import SignIn from "../authenticate/SignIn";
import Blog from "../components/blog/Blog";
import Chat from "../components/chat/Chat";
import ForgotPassword from "../authenticate/ForgotPassword";
import Profile from "../authenticate/Profile";

const UserLayOut = () => {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [size, setSize] = useState("");
  const [temp, setTemp] = useState(true);
  const [outStock, setOutStock] = useState([]);
  const [buy, setBuy] = useState([]);
  const [cartItem, setCartItem] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [header, setHeader] = useState(1);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setCartItem([]);
    setBuy([]);
  }, [temp]);

  const refresh = (data) => {
    setTemp(data);
  };

  const userHandler = (user) => {
    setUser(user);
  };

  const searchHandler = (keyword) => {
    setKeyword(keyword);
  };

  const changeHeaderHandler = (value) => {
    setHeader(value);
  };

  const buyHandler = (id) => {
    setBuy([...buy, id]);
  };

  const cancelBuyHandler = (id) => {
    const res = buy.filter((item) => item != id);
    setBuy(res);
  };

  const clearBuyHandler = () => {
    setBuy([]);
  };

  const changeSizeHandler = (event) => {
    const len = event.target.value;
    if (len < 220 || len > 320) {
      setSize("Kích thước không hợp lệ.");
    } else {
      if (len >= 200 && len <= 240) {
        setSize("Size: 39");
      } else if (len < 280) {
        setSize("Size: 40");
      } else {
        setSize("Size: 41");
      }
    }
  };

  const addHandler = (data) => {
    const res = cartItem.find((item) => item.id === data.id);
    if (res) {
      setCartItem(
        cartItem.map((item) =>
          item.id === data.id
            ? { ...res, quantity: res.quantity + data.quantity }
            : item
        )
      );
    } else {
      setCartItem([...cartItem, data]);
    }
  };
  const cartHandler = (data) => {
    setCartItem(data);
  };

  const clearHandler = () => {
    const res = cartItem.filter((item) => !buy.includes(item.id + ""));
    setCartItem(res);
  };

  const outStockHandler = (data) => {
    setOutStock(data);
  };

  const setCartItemHandler = (data) => {
    setCartItem(data);
  };

  return (
    <div className="col-10 offset-1">
      <Header
        header={header}
        searchHandler={searchHandler}
        user={user}
        userHandler={userHandler}
        refresh={refresh}
      ></Header>
      <Switch>
        <Route path="/" exact>
          <Home changeHeaderHandler={changeHeaderHandler} user={user}></Home>
        </Route>
        <Route path="/store" exact>
          <Product
            changeHeaderHandler={changeHeaderHandler}
            user={user}
          ></Product>
        </Route>
        <Route path={`/product-detail/:id`} exact>
          <ProductDetail
            changeHeaderHandler={changeHeaderHandler}
            user={user}
            addHandler={addHandler}
          ></ProductDetail>
        </Route>
        <Route path="/cart" exact>
          <Cart
            outStockHandler={outStockHandler}
            buyHandler={buyHandler}
            cancelBuyHandler={cancelBuyHandler}
            clearBuyHandler={clearBuyHandler}
            buy={buy}
            changeHeaderHandler={changeHeaderHandler}
            user={user}
            cartItem={cartItem}
            cartHandler={cartHandler}
          ></Cart>
        </Route>
        <Route path="/checkout" exact>
          <Checkout
            temp={temp}
            buy={buy}
            outStockHandler={outStockHandler}
            changeHeaderHandler={changeHeaderHandler}
            user={user}
            cartItem={cartItem}
            clearHandler={clearHandler}
            setCartItemHandler={setCartItemHandler}
          ></Checkout>
        </Route>
        <Route path="/order" exact>
          <Order changeHeaderHandler={changeHeaderHandler} user={user}></Order>
        </Route>
        <Route path="/order/detail/:id" exact>
          <OrderDetail
            changeHeaderHandler={changeHeaderHandler}
            user={user}
          ></OrderDetail>
        </Route>
        <Route path="/out-of-stock" exact>
          <OutStock
            outStock={outStock}
            buy={buy}
            changeHeaderHandler={changeHeaderHandler}
            user={user}
            cartItem={cartItem}
            setCartItemHandler={setCartItemHandler}
          ></OutStock>
        </Route>
        <Route path="/search-page" exact>
          <Search keyword={keyword} user={user}></Search>
        </Route>
        <Route path="/payment-page" exact>
          <Paypal></Paypal>
        </Route>
        <Route path="/error-page" exact>
          <Error></Error>
        </Route>
        <Route path="/register" exact>
          <Register></Register>
        </Route>
        <Route path="/blog" exact>
          <Blog changeHeaderHandler={changeHeaderHandler}></Blog>
        </Route>
        <Route path="/sign-in" exact>
          <SignIn userHandler={userHandler}></SignIn>
        </Route>
        <Route path="/chat" exact>
          <Chat user={user} changeHeaderHandler={changeHeaderHandler}></Chat>
        </Route>
        <Route path="/forgot-password" exact>
          <ForgotPassword></ForgotPassword>
        </Route>
        <Route path="/profile" exact>
          <Profile user={user} refresh={refresh} userHandler={userHandler}></Profile>
        </Route>
      </Switch>
      <Footer></Footer>
      <ToastContainer></ToastContainer>

      <div id="scroll">
        <Button variant="primary" onClick={handleShow}>
          Hướng dẫn chọn size áo
        </Button>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Hướng dẫn chọn size áo</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Label>Nhập chiều cao (cm)</Form.Label>
                <Form.Control
                  type="number"
                  min={220}
                  max={320}
                  autoFocus
                  onChange={changeSizeHandler}
                />
                {size && <Form.Label className="ml-1 mt-3">{size}</Form.Label>}
              </Form.Group>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Đóng
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default UserLayOut;
