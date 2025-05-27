import React, { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { toast } from "react-toastify";
import { getMe } from "../api/AccountApi";

const OAuth2RedirectHandler = (props) => {
    const location = useLocation();
    const history = useHistory();

    useEffect(() => {
        // Kiểm tra cookie hoặc query param cho token
        const getCookieValue = (name) => {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? match[2] : null;
        };
        
        // Ưu tiên lấy token từ URL
        const params = new URLSearchParams(location.search);
        let token = params.get('token');
        
        // Nếu không có token trong URL nhưng có facebook_login_pending, thử lấy từ cookie
        const isFacebookLogin = localStorage.getItem('facebook_login_pending') === 'true';
        if (!token && isFacebookLogin) {
            token = getCookieValue('oauth2_token');
            // Xóa state variable
            localStorage.removeItem('facebook_login_pending');
        }
        
        if (token) {
            // Lưu token và lấy thông tin người dùng
            localStorage.setItem("token", token);
            
            getMe(token)
                .then((res) => {
                    props.userHandler(res.data);
                    localStorage.setItem("username", res.data.username);
                    toast.success("Đăng nhập thành công!");
                    history.push("/");
                    // Scroll to top after redirect
                    window.scrollTo(0, 0);
                })
                .catch((error) => {
                    console.log(error);
                    toast.error("Đăng nhập thất bại!");
                    history.push("/sign-in");
                    // Scroll to top on failure redirect
                    window.scrollTo(0, 0);
                });
        } else {
            toast.error("Đăng nhập thất bại!");
            history.push("/sign-in");
        }
    }, [history, location.search, props]);

    return (
        <div className="d-flex justify-content-center mt-5">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Đang tải...</span>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler; 