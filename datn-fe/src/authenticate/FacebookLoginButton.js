import React from 'react';
import { useHistory } from 'react-router-dom';
import { toast } from "react-toastify";
import { getMe, getAccountDetailByAccountId } from "../api/AccountApi";
import axios from 'axios';
import { FaFacebookF } from 'react-icons/fa';

const FacebookLoginButton = ({ userHandler }) => {
  const history = useHistory();

  const handleFacebookLogin = () => {
    // Kiểm tra xem FB SDK đã được tải chưa
    if (!window.FB) {
      toast.error("Không thể kết nối đến Facebook. Vui lòng thử lại sau.");
      return;
    }

    window.FB.login(function(response) {
      if (response.authResponse) {
        console.log('Đăng nhập Facebook thành công!');
        // Lấy access token từ response
        const accessToken = response.authResponse.accessToken;
        
        // Gửi token đến server để xác thực
        axios.post('http://localhost:8080/api/site/auth/facebook', { accessToken: accessToken })
          .then(res => {
            if (res.data && res.data.accessToken) {
              // Lưu JWT token và thông tin người dùng
              const jwtToken = res.data.accessToken;
              localStorage.setItem("token", jwtToken);
              
              // Lấy thông tin người dùng từ API
              getMe(jwtToken)
                .then((res) => {
                  // Lấy thông tin chi tiết tài khoản
                  getAccountDetailByAccountId(res.data.id)
                    .then(detailRes => {
                      // Kết hợp thông tin cơ bản và chi tiết
                      const userData = {
                        ...res.data,
                        accountDetail: detailRes.data
                      };
                      userHandler(userData);
                      localStorage.setItem("username", res.data.username);
                      toast.success("Đăng nhập bằng Facebook thành công!");
                      history.push('/');
                    })
                    .catch(error => {
                      console.error("Lỗi khi lấy thông tin chi tiết:", error);
                      toast.error("Không thể lấy thông tin chi tiết người dùng");
                    });
                })
                .catch(error => {
                  console.error("Lỗi khi lấy thông tin người dùng:", error);
                  toast.error("Không thể lấy thông tin người dùng");
                });
            } else {
              toast.error("Đăng nhập thất bại");
            }
          })
          .catch(error => {
            console.error("Lỗi khi gửi token đến server:", error);
            toast.error("Đăng nhập thất bại");
          });
      } else {
        console.log('Người dùng hủy đăng nhập hoặc không cấp quyền truy cập.');
        toast.info("Đăng nhập đã bị hủy");
      }
    }, { scope: 'public_profile,email' });
  };

  return (
    <button 
      className="btn-social btn-facebook"
      onClick={handleFacebookLogin}
    >
      <FaFacebookF className="social-icon" />
    </button>
  );
};

export default FacebookLoginButton; 