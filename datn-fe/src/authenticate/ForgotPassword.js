import React from "react";
import { NavLink, useHistory } from "react-router-dom";
import "./signin.css";
import { forgotPassword } from "../api/AuthenticateApi";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const history = useHistory();

  const signInHandler = (data) => {
    const userFlag = {
      username: data.username
    };
    forgotPassword(userFlag)
      .then((res) => {
        toast.success(res.data);
        history.push("/sign-in");
      })
      .catch(() => toast.error("Đã xảy ra lỗi vui lòng quay lại sau!"));
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <div>
      {" "}
      <section className="vh-100 gradient-custom">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div
                className="card bg-dark text-white"
                style={{ borderRadius: "1rem" }}
              >
                <div className="card-body p-5 text-center">
                  <div className="mb-md-5 mt-md-4 pb-5">
                    <h2 className="fw-bold mb-5 text-uppercase">Quên mật khẩu</h2>
                    <form
                      className="needs-validation"
                      onSubmit={handleSubmit(signInHandler)}
                    >
                      <div className="form-outline form-white mb-4">
                        <input
                          type="text"
                          id="typeEmailX"
                          className="form-control form-control-lg"
                          {...register("username", {
                            required: true,
                            pattern: /^\s*\S+.*/,
                          })}
                        />
                        <label className="form-label" htmlFor="typeEmailX">
                          Tài khoản
                        </label>
                        {errors.username && (
                          <div className="alert alert-danger" role="alert">
                            Tài khoản không hợp lệ!
                          </div>
                        )}
                      </div>
                      <button
                        className="btn btn-outline-light btn-lg px-5"
                        type="submit"
                      >
                        Lấy lại mật khẩu
                      </button>
                    </form>
                  </div>
                  <div>
                    <p className="mb-0">
                      Quay lại{" "}
                      <NavLink
                        to="/sign-in"
                        exact
                        className="text-white-50 fw-bold"
                      >
                        Đăng nhập
                      </NavLink>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>    
    </div>
  );
};

export default ForgotPassword;
