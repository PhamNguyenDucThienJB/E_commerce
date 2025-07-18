import React, { useState } from "react";
import { Switch, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Account from "./account/Account";
import Order from "./pages/Order";
import OrderForm from "./pages/OrderForm";
import Product from "./product/Product";
import ProductForm from "./product/ProductForm";
import Voucher from "./voucher/Voucher";
import Category from "./category/Category";
import Sale from "./sale/Sale";
import Brand from "./brand/Brand";
import NewVoucher from "./voucher/NewVoucher";
import EditVoucher from "./voucher/EditVoucher";
import NewBrand from "./brand/NewBrand";
import EditBrand from "./brand/EditBrand";
import NewAccount from "./account/NewAccount";
import EditCategory from "./category/EditCategory";
import NewCategory from "./category/NewCategory";
import NewSale from "./sale/NewSale";
import EditSale from "./sale/EditSale";
import EditAccount from "./account/EditAccount";
import OrderDetail from "./pages/OrderDetail";
import EditProduct from "./product/EditProduct";
import ReportProduct from "./report/ReportProduct";
import OrderProduct from "./report/OrderProduct";
import ReportMonth from "./report/ReportMonth";
import OrderMonth from "./report/OrderMonth";
import Upload from "./pages/Upload";
import Detail from "./product/Detail";
import Chat from "./chat/Chat";
import SearchOrder from './pages/SearchOrder';
import Error from "./error/Error";
import ReviewsManagement from "./pages/ReviewsManagement.js";
import CommentsManagement from "./pages/CommentsManagement.js";
import ReturnOrders from "./pages/ReturnOrders";

const Routes = () => {
  const [year, setYear] = useState();

  const yearHandler = (year) => {
    setYear(year);
  };

  return (
    <Switch>
      <Route path={`/dashboard`} exact>
        <Dashboard></Dashboard>
      </Route>
      <Route path={`/account`} exact>
        <Account></Account>
      </Route>
      <Route path={`/order`} exact>
        <Order></Order>
      </Route>
      <Route path={`/return-orders`} exact>
        <ReturnOrders></ReturnOrders>
      </Route>
      <Route path={`/order-form/:id`} exact>
        <OrderForm></OrderForm>
      </Route>
      <Route path={`/product`} exact>
        <Product></Product>
      </Route>
      <Route path={`/add-product`} exact>
        <ProductForm></ProductForm>
      </Route>
      <Route path={`/voucher`} exact>
        <Voucher></Voucher>
      </Route>
      <Route path={`/category`} exact>
        <Category></Category>
      </Route>
      <Route path={`/sale`} exact>
        <Sale></Sale>
      </Route>
      <Route path={`/brand`} exact>
        <Brand></Brand>
      </Route>
      <Route path={`/add-voucher`} exact>
        <NewVoucher></NewVoucher>
      </Route>
      <Route path={`/voucher-detail/:id`} exact>
        <EditVoucher></EditVoucher>
      </Route>
      <Route path={`/add-brand`} exact>
        <NewBrand></NewBrand>
      </Route>
      <Route path={`/brand-detail/:id`} exact>
        <EditBrand></EditBrand>
      </Route>
      <Route path={`/add-account`} exact>
        <NewAccount></NewAccount>
      </Route>
      <Route path={`/account-detail/:id`} exact>
        <EditAccount></EditAccount>
      </Route>
      <Route path={`/order-detail/:id`} exact>
        <OrderDetail></OrderDetail>
      </Route>
      <Route path={`/product-detail/:id`} exact>
        <EditProduct></EditProduct>
      </Route>
      <Route path={`/add-category`} exact>
        <NewCategory></NewCategory>
      </Route>
      <Route path={`/category-detail/:id`} exact>
        <EditCategory></EditCategory>
      </Route>
      <Route path={`/sale-detail/:id`} exact>
        <EditSale></EditSale>
      </Route>
      <Route path={`/add-sale`} exact>
        <NewSale></NewSale>
      </Route>
      <Route path={`/report-product`} exact>
        <ReportProduct></ReportProduct>
      </Route>
      <Route path={`/order-product/:id`} exact>
        <OrderProduct></OrderProduct>
      </Route>
      <Route path={`/report-month/:id`} exact>
        <ReportMonth yearHandler={yearHandler}></ReportMonth>
      </Route>
      <Route path={`/order-month/:id`} exact>
        <OrderMonth year={year}></OrderMonth>
      </Route>
      <Route path={`/upload`} exact>
        <Upload></Upload>
      </Route>
      <Route path={`/product-view/:id`} exact>
        <Detail></Detail>
      </Route>
      <Route path={`/chat`} exact>
        <Chat></Chat>
      </Route>
      <Route path={`/search/:id`} exact>
       <SearchOrder></SearchOrder>
      </Route>
      <Route path={`/reviews`} exact>
        <ReviewsManagement></ReviewsManagement>
      </Route>
      <Route path={`/comments`} exact>
        <CommentsManagement></CommentsManagement>
      </Route>
      <Route path={`/error-page`} exact>
       <Error></Error>
      </Route>
    </Switch>
  );
};

export default Routes;
