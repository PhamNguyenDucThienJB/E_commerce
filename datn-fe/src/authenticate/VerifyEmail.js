import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useHistory } from "react-router-dom";
import "./verify_email.css";

const VerifyEmail = () => {
  const [email, setEmail] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const history = useHistory();

  useEffect(() => {
    let intervalId;
    

    if (checkingVerification) {
      intervalId = setInterval(() => {
        axios
          .get(`http://localhost:8080/api/site/check_email_verified?email=${email}`)
          .then((res) => {
            if (res.data === true) {
              clearInterval(intervalId);
              toast.success("Email đã được xác minh! Đang chuyển hướng...");
              setLoading(false);
              setCheckingVerification(false);
              localStorage.setItem("verifyEmail", email);

              setTimeout(() => {
                history.push("/sign-in");
              }, 2000);
            }
          })
          .catch((err) => {
            console.error("Lỗi kiểm tra xác minh:", err);
          });
      }, 5000); // kiểm tra mỗi 5 giây
    }

    return () => clearInterval(intervalId);
  }, [checkingVerification, email, history]);

  const handleSendVerification = () => {
    if (!email) {
      toast.error("Vui lòng nhập email.");
      return;
    }
    if (!agreePolicy) {
      toast.error("Bạn cần đồng ý với chính sách trước khi tiếp tục.");
      return;
    }

    setLoading(true);

    axios
      .post("http://localhost:8080/api/site/verify_email", { email })
      .then(() => {
        toast.success("Đã gửi email xác minh. Vui lòng kiểm tra hộp thư.");
        setCheckingVerification(true);
        localStorage.setItem("verifyEmail", email);

      })
      .catch((err) => {
        const errorMessage = err.response?.data || "Đã xảy ra lỗi khi gửi email.";
        toast.error(errorMessage);
        setLoading(false);
      });
      
  };

  return (
    <div className="verify-container">
      {loading && (
        <div className="loading-overlay">
          <p>Yêu cầu xác minh đang được gửi...<br />Vui lòng kiểm tra email</p>
        </div>
      )}
      <div className={`verify-card ${loading ? "blurred" : ""}`}>
        <h2>Xác minh Email</h2>
        <input
          type="email"
          placeholder="Nhập địa chỉ email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="verify-input"
          disabled={loading}
        />
        <div className="verify-checkbox">
          <input
            type="checkbox"
            id="agreePolicy"
            checked={agreePolicy}
            onChange={() => setAgreePolicy(!agreePolicy)}
            disabled={loading}
          />
          <label htmlFor="agreePolicy">
            Tôi đồng ý với{" "}
            <a href="/blog" target="_blank" rel="noopener noreferrer">
              chính sách bảo mật
            </a>
          </label>
        </div>
        <button
          onClick={handleSendVerification}
          className="verify-button"
          disabled={loading}
        >
          {loading ? "Đang gửi..." : "Xác minh Gmail"}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
