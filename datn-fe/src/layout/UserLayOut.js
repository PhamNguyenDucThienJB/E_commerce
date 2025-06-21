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
import { getCartItemByAccountId } from "../api/CartApi";
import { getMe } from "../api/AccountApi";

import VerifyEmail from "../authenticate/VerifyEmail"; 
import VerifyPage from "../authenticate/VerifyPage";

import OAuth2RedirectHandler from "../authenticate/OAuth2RedirectHandler";


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

  // Khôi phục user từ localStorage khi component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      getMe(token)
        .then((res) => {
          setUser(res.data);
        })
        .catch((error) => {
          console.log("Token không hợp lệ, xóa khỏi localStorage:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          localStorage.removeItem("password");
        });
    }
  }, [user]);

  useEffect(() => {
    setCartItem([]);
    setBuy([]);
  }, [temp]);

  useEffect(() => {
    if (user) {
      getCartItemByAccountId(user.id).then((resp) => {
        const items = resp.data.map((item) => ({ ...item, checked: false }));
        setCartItem(items);
      });
    }
  }, [user]);

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

  const setBuyNowHandler = (id) => {
    setBuy([id]);
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

  const fetchCartItems = () => {
    if (user) {
      getCartItemByAccountId(user.id).then((resp) => {
        const items = resp.data.map((item) => ({ ...item, checked: false }));
        setCartItem(items);
      });
    }
  };

  return (
    <div className="col-10 offset-1">
      <Header
        header={header}
        searchHandler={searchHandler}
        user={user}
        userHandler={userHandler}
        refresh={refresh}
        cartItems={cartItem}
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
            updateCart={fetchCartItems}
            buyHandler={buyHandler}
            clearBuyHandler={clearBuyHandler}
            setBuyNowHandler={setBuyNowHandler}
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

        <Route path="/verifyPage"  exact component={VerifyPage} />

        <Route path="/oauth2/redirect" exact>
          <OAuth2RedirectHandler userHandler={userHandler} />
        </Route>

       <Route path="/verify" exact component={VerifyEmail} />
      </Switch>
    
      <Footer></Footer>
      <ToastContainer></ToastContainer>
       

      
    
    </div>
  );
};

export default UserLayOut;
