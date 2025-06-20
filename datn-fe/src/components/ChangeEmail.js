import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { 
  initiateEmailChange, 
  verifyOldEmailOtp, 
  verifyNewEmailOtp, 
  completeEmailChange 
} from "../api/EmailChangeApi";

const ChangeEmail = ({ currentEmail, onSuccess, onCancel }) => {
  const [step, setStep] = useState(1);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm();

  // Bước 1: Nhập email mới
  const handleInitiateEmailChange = (data) => {
    setLoading(true);
    setNewEmail(data.newEmail);
    
    console.log("Sending email change request for:", data.newEmail);
    
    initiateEmailChange(data.newEmail)
      .then((res) => {
        console.log("Email change response:", res);
        toast.success(res.data.message);
        setStep(2);
        reset();
      })
      .catch((error) => {
        console.error("Email change error:", error);
        console.error("Error response:", error.response);
        toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Bước 2: Xác thực OTP email cũ
  const handleVerifyOldEmail = (data) => {
    setLoading(true);
    
    verifyOldEmailOtp(data.oldEmailOtp)
      .then((res) => {
        toast.success(res.data.message);
        setStep(3);
        reset();
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Mã OTP không hợp lệ");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Bước 3: Xác thực OTP email mới
  const handleVerifyNewEmail = (data) => {
    setLoading(true);
    
    verifyNewEmailOtp(data.newEmailOtp)
      .then((res) => {
        toast.success(res.data.message);
        setStep(4);
        reset();
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Mã OTP không hợp lệ");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Bước 4: Hoàn tất đổi email
  const handleCompleteEmailChange = () => {
    setLoading(true);
    
    completeEmailChange()
      .then((res) => {
        toast.success(res.data.message);
        onSuccess(newEmail);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <div className="text-center mb-4">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{ width: "80px", height: "80px", fontSize: "32px" }}>
                <i className="fas fa-envelope"></i>
              </div>
              <h4 className="text-dark mb-2">Thay đổi email tài khoản</h4>
              <p className="text-muted">Vui lòng nhập email mới để tiếp tục</p>
            </div>

            <form onSubmit={handleSubmit(handleInitiateEmailChange)}>
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  <i className="fas fa-envelope me-2 text-muted"></i>
                  Email hiện tại
                </label>
                <input
                  type="email"
                  className="form-control form-control-lg bg-light"
                  value={currentEmail}
                  disabled
                  style={{ 
                    border: "2px solid #e9ecef",
                    borderRadius: "12px",
                    fontSize: "16px",
                    backgroundColor: "#f1f3f4",
                    color: "#6c757d"
                  }}
                />
              </div>
              
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  <i className="fas fa-at me-2 text-primary"></i>
                  Email mới *
                </label>
                <input
                  type="email"
                  className={`form-control form-control-lg ${errors.newEmail ? 'is-invalid' : ''}`}
                  placeholder="Nhập email mới của bạn"
                  style={{ 
                    border: "2px solid #dee2e6",
                    borderRadius: "12px",
                    fontSize: "16px",
                    backgroundColor: "#f8fafc",
                    color: "#1e293b"
                  }}
                  onFocus={(e) => e.target.style.backgroundColor = "#ffffff"}
                  onBlur={(e) => e.target.style.backgroundColor = "#f8fafc"}
                  {...register("newEmail", {
                    required: "Email mới không được để trống",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email không hợp lệ"
                    }
                  })}
                />
                {errors.newEmail && (
                  <div className="invalid-feedback d-block">
                    <i className="fas fa-exclamation-circle me-1"></i>
                    {errors.newEmail.message}
                  </div>
                )}
              </div>
              
              <div className="d-flex gap-3 justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-light btn-lg px-4"
                  onClick={onCancel}
                  style={{ borderRadius: "12px", border: "2px solid #dee2e6" }}
                >
                  <i className="fas fa-times me-2"></i>
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg px-4"
                  disabled={loading}
                  style={{ borderRadius: "12px" }}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Gửi OTP
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case 2:
        return (
          <div>
            <div className="text-center mb-4">
              <div className="bg-warning text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{ width: "80px", height: "80px", fontSize: "32px" }}>
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4 className="text-dark mb-2">Xác thực email hiện tại</h4>
              <p className="text-muted mb-3">
                Chúng tôi đã gửi mã xác thực đến email hiện tại của bạn
              </p>
              <div className="alert alert-info border-0" style={{ borderRadius: "12px" }}>
                <i className="fas fa-envelope me-2"></i>
                <strong>{currentEmail}</strong>
              </div>
            </div>

            <form onSubmit={handleSubmit(handleVerifyOldEmail)}>
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark text-center d-block">
                  <i className="fas fa-key me-2 text-warning"></i>
                  Nhập mã OTP (6 chữ số)
                </label>
                <input
                  type="text"
                  className={`form-control form-control-lg text-center ${errors.oldEmailOtp ? 'is-invalid' : ''}`}
                  placeholder="000000"
                  maxLength="6"
                  style={{ 
                    border: "3px solid #ffc107",
                    borderRadius: "16px",
                    fontSize: "24px",
                    letterSpacing: "8px",
                    fontWeight: "bold",
                    backgroundColor: "#fff8e1",
                    color: "#bf8f00"
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = "#fffbf0";
                    e.target.style.borderColor = "#ffb300";
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = "#fff8e1";
                    e.target.style.borderColor = "#ffc107";
                  }}
                  {...register("oldEmailOtp", {
                    required: "Mã OTP không được để trống",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "Mã OTP phải là 6 chữ số"
                    }
                  })}
                />
                {errors.oldEmailOtp && (
                  <div className="invalid-feedback d-block text-center mt-2">
                    <i className="fas fa-exclamation-circle me-1"></i>
                    {errors.oldEmailOtp.message}
                  </div>
                )}
              </div>
              
              <div className="d-flex gap-3 justify-content-between">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-lg px-4"
                  onClick={() => setStep(1)}
                  style={{ borderRadius: "12px" }}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Quay lại
                </button>
                <button 
                  type="submit" 
                  className="btn btn-warning btn-lg px-4"
                  disabled={loading}
                  style={{ borderRadius: "12px" }}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Xác thực
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case 3:
        return (
          <div>
            <div className="text-center mb-4">
              <div className="bg-info text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                   style={{ width: "80px", height: "80px", fontSize: "32px" }}>
                <i className="fas fa-envelope-open"></i>
              </div>
              <h4 className="text-dark mb-2">Xác thực email mới</h4>
              <p className="text-muted mb-3">
                Chúng tôi đã gửi mã xác thực đến email mới của bạn
              </p>
              <div className="alert alert-success border-0" style={{ borderRadius: "12px" }}>
                <i className="fas fa-envelope me-2"></i>
                <strong>{newEmail}</strong>
              </div>
            </div>

            <form onSubmit={handleSubmit(handleVerifyNewEmail)}>
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark text-center d-block">
                  <i className="fas fa-key me-2 text-info"></i>
                  Nhập mã OTP (6 chữ số)
                </label>
                <input
                  type="text"
                  className={`form-control form-control-lg text-center ${errors.newEmailOtp ? 'is-invalid' : ''}`}
                  placeholder="000000"
                  maxLength="6"
                  style={{ 
                    border: "3px solid #17a2b8",
                    borderRadius: "16px",
                    fontSize: "24px",
                    letterSpacing: "8px",
                    fontWeight: "bold",
                    backgroundColor: "#e6f7ff",
                    color: "#0c5460"
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = "#f0fbff";
                    e.target.style.borderColor = "#138496";
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = "#e6f7ff";
                    e.target.style.borderColor = "#17a2b8";
                  }}
                  {...register("newEmailOtp", {
                    required: "Mã OTP không được để trống",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "Mã OTP phải là 6 chữ số"
                    }
                  })}
                />
                {errors.newEmailOtp && (
                  <div className="invalid-feedback d-block text-center mt-2">
                    <i className="fas fa-exclamation-circle me-1"></i>
                    {errors.newEmailOtp.message}
                  </div>
                )}
              </div>
              
              <div className="d-flex gap-3 justify-content-between">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-lg px-4"
                  onClick={() => setStep(2)}
                  style={{ borderRadius: "12px" }}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Quay lại
                </button>
                <button 
                  type="submit" 
                  className="btn btn-info btn-lg px-4"
                  disabled={loading}
                  style={{ borderRadius: "12px" }}
                >
                  {loading ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check me-2"></i>
                      Xác thực
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case 4:
        return (
          <div className="text-center">
            <div className="mb-4">
              <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                   style={{ width: "100px", height: "100px", fontSize: "40px" }}>
                <i className="fas fa-check"></i>
              </div>
              <h3 className="text-success mb-3">🎉 Xác thực thành công!</h3>
              <p className="text-muted mb-4 fs-5">
                Cả hai email đã được xác thực thành công.<br/>
                Bạn có thể hoàn tất việc đổi email ngay bây giờ.
              </p>
              
              <div className="card border-0 bg-light mb-4" style={{ borderRadius: "16px" }}>
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-12 mb-3">
                      <small className="text-muted">Email cũ</small>
                      <div className="fw-semibold text-decoration-line-through text-muted">
                        <i className="fas fa-envelope me-2"></i>
                        {currentEmail}
                      </div>
                    </div>
                    <div className="col-12">
                      <small className="text-muted">Email mới</small>
                      <div className="fw-bold text-success">
                        <i className="fas fa-envelope me-2"></i>
                        {newEmail}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              className="btn btn-success btn-lg px-5 py-3" 
              onClick={handleCompleteEmailChange}
              disabled={loading}
              style={{ 
                borderRadius: "16px",
                fontSize: "18px",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)"
              }}
            >
              {loading ? (
                <>
                  <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  Đang hoàn tất...
                </>
              ) : (
                <>
                  <i className="fas fa-rocket me-2"></i>
                  Hoàn tất đổi email
                </>
              )}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Nhập email mới";
      case 2: return "Xác thực email cũ";
      case 3: return "Xác thực email mới";
      case 4: return "Hoàn tất";
      default: return "";
    }
  };

  return (
    <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0" style={{ borderRadius: "20px", overflow: "hidden" }}>
          {/* Header */}
          <div className="modal-header bg-gradient text-white border-0 p-4" 
               style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <div className="d-flex align-items-center">
              <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                <i className="fas fa-envelope" style={{ fontSize: "24px" }}></i>
              </div>
              <div>
                <h5 className="modal-title mb-1 fw-bold">Đổi email tài khoản</h5>
                <small className="opacity-75">{getStepTitle()}</small>
              </div>
            </div>
            {step < 4 && (
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={onCancel}
                style={{ fontSize: "16px" }}
              ></button>
            )}
          </div>

          {/* Progress */}
          <div className="px-4 pt-4">
            <div className="progress mb-3" style={{ height: "8px", borderRadius: "10px" }}>
              <div 
                className="progress-bar bg-gradient" 
                style={{ 
                  width: `${(step / 4) * 100}%`,
                  background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "10px",
                  transition: "width 0.3s ease"
                }}
              ></div>
            </div>
            <div className="d-flex justify-content-between">
              <small className={`fw-semibold ${step >= 1 ? "text-primary" : "text-muted"}`}>
                <i className="fas fa-at me-1"></i>Email mới
              </small>
              <small className={`fw-semibold ${step >= 2 ? "text-warning" : "text-muted"}`}>
                <i className="fas fa-shield-alt me-1"></i>OTP cũ
              </small>
              <small className={`fw-semibold ${step >= 3 ? "text-info" : "text-muted"}`}>
                <i className="fas fa-envelope-open me-1"></i>OTP mới
              </small>
              <small className={`fw-semibold ${step >= 4 ? "text-success" : "text-muted"}`}>
                <i className="fas fa-check-circle me-1"></i>Hoàn tất
              </small>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body p-5">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangeEmail; 