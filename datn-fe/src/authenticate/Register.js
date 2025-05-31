import React, { useState, useEffect }from "react";
import "./register.css";
import { NavLink, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { registerAccount } from "../api/AuthenticateApi";




const Register = () => {
  const history = useHistory();
  const [savedEmail, setSavedEmail] = useState("");

    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
    } = useForm();


  const onSubmitHandler = (data) => {
    const result = {
      ...data,
      roleId: "3",
    };
    console.log(result);
    registerAccount(result)
      .then(() => {
        toast.success("Đăng kí thành công!");
        history.push("/sign-in");
      })
      .catch((error) => toast.error(error.response.data.Errors));
  };
useEffect(() => {
  const emailFromStorage = localStorage.getItem("verifyEmail");
  if (emailFromStorage) {
    setSavedEmail(emailFromStorage);
    setValue("email", emailFromStorage); // 🛠️ Quan trọng
  }
}, [setValue]);


  return (
    <div>
      {" "}
      <section className="vh-100 gradient-custom">
        <div className="container py-5 h-100">
          <div className="row justify-content-center align-items-center h-100">
            <div className="col-12 col-lg-9 col-xl-7">
              <div
                className="card bg-dark text-white"
                style={{ borderRadius: "15px" }}
              >
                <div className="card-body p-4 p-md-5">
                  <h3 className="mb-4 pb-2 pb-md-0 mb-md-5 text-center">
                    Đăng kí
                  </h3>
                  <form
                    className="needs-validation"
                    onSubmit={handleSubmit(onSubmitHandler)}
                  >
                    <div className="row">
                      <div className="col-md-6 mb-4">
                        <div className="form-outline">
                          <input
                            type="text"
                            id="firstName"
                            className="form-control form-control-lg"
                            {...register("username", {
                              required: true,
                              pattern: /^\s*\S+.*/,
                            })}
                          />
                          <label className="form-label" htmlFor="firstName">
                            Username
                          </label>
                          {errors.username && (
                            <div className="alert alert-danger" role="alert">
                              Tài khoản không hợp lệ!
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6 mb-4">
                        <div className="form-outline">
                          <input
                            type="password"
                            id="lastName"
                            className="form-control form-control-lg"
                            {...register("password", {
                              required: true,
                              pattern: /^\s*\S+.*/,
                            })}
                          />
                          <label className="form-label" htmlFor="lastName">
                            Password
                          </label>
                          {errors.password && (
                            <div className="alert alert-danger" role="alert">
                              Mật khẩu không hợp lệ!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-4 d-flex align-items-center">
                        <div className="form-outline datepicker w-100">
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            id="birthdayDate"
                            {...register("fullName", {
                              required: true,
                              pattern: /^\s*\S+.*/,
                            })}
                          />
                          <label htmlFor="birthdayDate" className="form-label">
                            Họ tên
                          </label>
                          {errors.fullName && (
                            <div className="alert alert-danger" role="alert">
                              Họ tên không hợp lệ!
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6 mb-4">
                        <h6 className="mb-2 pb-1">Giới tính: </h6>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="inlineRadioOptions"
                            id="femaleGender"
                            defaultValue="Nữ"
                            defaultChecked
                            {...register("gender", {
                              required: true,
                            })}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="femaleGender"
                          >
                            Nữ
                          </label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="inlineRadioOptions"
                            id="maleGender"
                            defaultValue="Nam"
                            {...register("gender", {
                              required: true,
                            })}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="maleGender"
                          >
                            Nam
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-4 pb-2">
                        <div className="form-outline">
                          <input
                                type="text"
                                id="emailAddress"
                                className="form-control form-control-lg"
                                readOnly
                                {...register("email", {
                                  required: true,
                                  pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                })}
                              />
                          <label className="form-label" htmlFor="emailAddress">
                            Email
                          </label>
                          {errors.email && (
                            <div className="alert alert-danger" role="alert">
                              Email không hợp lệ!
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6 mb-4 pb-2">
                        <div className="form-outline">
                          <input
                            type="tel"
                            id="phoneNumber"
                            className="form-control form-control-lg"
                            {...register("phone", {
                              required: true,
                              pattern: /^0[0-9]{9}$/,
                            })}
                          />
                          <label className="form-label" htmlFor="phoneNumber">
                            Số điện thoại
                          </label>
                          {errors.phone && (
                            <div className="alert alert-danger" role="alert">
                              Số điện thoại không hợp lệ!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-12">
                        <textarea
                          name=""
                          id=""
                          cols="50"
                          rows="5"
                          {...register("address", { required: false })}
                        ></textarea>
                        <label className="form-label select-label">
                          Địa chỉ
                        </label>
                      </div>
                    </div>
                    <div className="mt-4 pt-2 mb-3">
                      <button className="btn btn-primary btn-lg" type="submit">
                        Đăng kí
                      </button>
                    </div>
                    <div>
                      <p className="mb-0">
                        Đã có tài khoản?{" "}
                        <NavLink
                          to="/sign-in"
                          exact
                          className="text-white-50 fw-bold"
                        >
                          Đăng nhập ngay
                        </NavLink>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
