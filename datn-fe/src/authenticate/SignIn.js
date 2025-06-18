import React, {useState} from "react";
import { NavLink, useHistory } from "react-router-dom";
import "./signin.css";
import { signIn } from "../api/AuthenticateApi";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getMe } from "../api/AccountApi";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import FacebookLoginButton from './FacebookLoginButton';
import { FaFacebook, FaGoogle } from 'react-icons/fa';

const SignIn = (props) => {
  const history = useHistory();
  const [loadingLogin, setLoadingLogin] = useState(false);
  
  // Xử lý đăng nhập tài khoản bình thường
  const signInHandler = (data) => {
    setLoadingLogin(true);
    const loginData = {
      username: data.username,
      password: data.password,
      admin: false
    };
    signIn(loginData)
      .then((res) => {
        toast.success("Đăng nhập thành công!");
        localStorage.setItem("token", res.data.accessToken);
        getMe(res.data.accessToken)
          .then((res) => {
            props.userHandler(res.data);
            localStorage.setItem("username", res.data.username);
            localStorage.setItem("password", "123456");
          })
          .catch((error) => console.log(error));
        history.push("/");
      })
      .catch((error) => {
        toast.error(error.response?.data?.Errors || "Đăng nhập thất bại");
      })
      .finally(() => {
        setLoadingLogin(false);
      });
  };

  // Xử lý đăng nhập Google
  const handleGoogleSuccess = (credentialResponse) => {
    axios.post('http://localhost:8080/api/site/oauth2/google', { token: credentialResponse.credential })
      .then(response => {
        toast.success("Đăng nhập Google thành công!");
        localStorage.setItem("token", response.data.accessToken);
        getMe(response.data.accessToken)
          .then((res) => {
            props.userHandler(res.data);
            localStorage.setItem("username", res.data.username);
          })
          .catch((error) => console.log(error));
        history.push("/");
      })
      .catch(error => {
        toast.error("Đăng nhập Google thất bại!");
        console.error("Lỗi đăng nhập Google:", error);
      });
  };
  
  const handleGoogleFailure = () => {
    toast.error("Đăng nhập Google thất bại!");
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <div>
      <section className="vh-100 gradient-custom">
        <div className="container py-5 h-100">
          <div className="row d-flex justify-content-center align-items-center h-100">
            <div className="col-12 col-md-8 col-lg-6 col-xl-5">
              <div className="card">
                <div className="card-body p-5 text-center">
                  <h1 className="brand-title text-white">ART <span>Doodle</span></h1>
                  <h2 className="fw-bold mb-4 text-uppercase text-white">Đăng nhập</h2>
                  <form className="needs-validation" onSubmit={handleSubmit(signInHandler)}>
                    <div className="form-outline form-white mb-4">
                      <input
                          type="text"
                          id="typeEmailX"
                          className="form-control form-control-lg"
                          placeholder=" "
                          {...register("username", {
                            required: true,
                            pattern: /^\s*\S+.*/,
                          })}
                      />
                      <label className="form-label" htmlFor="typeEmailX">
                        Tài khoản
                      </label>
                      {errors.username && (
                          <div className="alert alert-danger mt-2" role="alert">
                            Tài khoản không hợp lệ!
                          </div>
                      )}
                    </div>
                    <div className="form-outline form-white mb-4">
                      <input
                          type="password"
                          id="typePasswordX"
                          className="form-control form-control-lg"
                          placeholder=" "
                          {...register("password", {
                            required: true,
                            pattern: /^\s*\S+.*/,
                          })}
                      />
                      <label className="form-label" htmlFor="typePasswordX">
                        Mật khẩu
                      </label>
                      {errors.password && (
                          <div className="alert alert-danger mt-2" role="alert">
                            Mật khẩu không hợp lệ!
                          </div>
                      )}
                    </div>
                    <div className="text-end mb-4">
                      <NavLink to="/forgot-password" className="text-white-50 small">
                        Quên mật khẩu?
                      </NavLink>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-login"
                        disabled={loadingLogin}
                    >
                      {loadingLogin ? (
                          <div className="spinner-border text-light" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                      ) : (
                          "Đăng nhập"
                      )}
                    </button>
                  </form>
                  <div className="divider-section">
                    <div className="social-divider">hoặc</div>
                  </div>
                  <div className="social-login-container">
                    <FacebookLoginButton userHandler={props.userHandler}/>
                    <div className="google-btn-container">
                      <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={handleGoogleFailure}
                          useOneTap
                          type="icon"
                          shape="circle"
                          theme="filled_blue"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="mb-0 text-white-50">
                      Chưa có tài khoản?{' '}
                      <NavLink to="/verify" className="register-link">
                        Đăng ký ngay
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

export default SignIn;
