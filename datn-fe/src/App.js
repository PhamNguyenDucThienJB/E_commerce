import "./App.css";
import UserLayOut from "./layout/UserLayOut";
import AdminLayOut from "./layout/AdminLayOut";
import { BrowserRouter as Router } from "react-router-dom";
import React, { useEffect } from "react";

function App() {
  useEffect(() => {
    // Khởi tạo Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: '526446266364446',
        cookie: true,
        xfbml: true,
        version: 'v17.0'
      });
    };
    // Load Facebook SDK script
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  return (
    <div className="container-fluid">
      <Router>
        <UserLayOut></UserLayOut>
      </Router>
    </div>
  );
}

export default App;
