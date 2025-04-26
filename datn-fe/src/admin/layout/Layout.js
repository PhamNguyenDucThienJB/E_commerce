import React from "react";
import Sidebar from "../sidebar/Sidebar";
import Routes from "../Routes";
import TopNav from "../topnav/TopNav";
import { Route, BrowserRouter } from "react-router-dom";
import './layout.css'

const Layout = (props) => {
  return (
    <BrowserRouter>
      <Route
        render={(props) => (
          <div className="layout">
            <Sidebar {...props}/>
              <div className="layout__content">
                <TopNav></TopNav>
                <div className="layout__content-main">
                  <Routes></Routes>
                </div>
              </div>
          </div>
        )}
      ></Route>
    </BrowserRouter>
  );
};

export default Layout;
