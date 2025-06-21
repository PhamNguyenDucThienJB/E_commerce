import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import "./verify_page.css"; // <-- Thêm file CSS riêng cho hiệu ứng

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const VerifyPage = () => {
  const query = useQuery();
  const token = query.get("token");
  const [message, setMessage] = useState("Đang xác minh...");
  const [status, setStatus] = useState("loading"); // 'loading', 'success', 'error'
  const history = useHistory();

  useEffect(() => {
    if (!token) {
      setMessage("❌ Token không tồn tại.");
      setStatus("error");
      return;
    }

    axios
      .get(`http://localhost:8080/api/site/verify?token=${token}`)
      .then((res) => {
        setMessage(res.data || "✅ Xác minh thành công! Vui lòng đợi server truyển trang! Còn một bước nữa là thành công rồi nè ");
        setStatus("success");
        setTimeout(() => history.push("/register"), 3000);
      })
      .catch((error) => {
        const msg = error.response?.data || "❌ Xác minh thất bại.";
        setMessage(msg);
        setStatus("error");
      });
  }, [token, history]);

  return (
    <div className="verify-wrapper">
      <div className={`verify-box ${status}`}>
        <h2>Xác minh Email</h2>
        {status === "loading" && <div className="spinner" />}
        <p>{message}</p>
      </div>
    </div>
  );
};

export default VerifyPage;
