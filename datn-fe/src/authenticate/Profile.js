import React, { useEffect, useState } from "react";
import "./register.css";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getAccountDetailByAccountId, updatepProfile, getByUsername } from '../api/AccountApi';
import ChangeEmail from "../components/ChangeEmail";

const Profile = (props) => {
  const history = useHistory();
  const [flag, setFlag] = useState();
  const [loading, setLoading] = useState(true);
  const [showChangeEmail, setShowChangeEmail] = useState(false);

  useEffect(() => {
    // Kiểm tra token trước khi redirect
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.log("Không có token, redirect về sign-in");
      history.push("/sign-in");
      return;
    }

    // Nếu có token nhưng chưa có user, chờ một chút để UserLayout kịp load
    if (!props.user || !props.user.id) {
      console.log("User đang được load từ token...");
      setLoading(true);
      // Chờ 2 giây để UserLayout kịp khôi phục user
      const timer = setTimeout(() => {
        if (!props.user || !props.user.id) {
          console.log("Không thể load user, redirect về sign-in");
          history.push("/sign-in");
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
    
    // Nếu có user, load thông tin profile
    setLoading(true);
    getAccountDetailByAccountId(props.user.id)
    .then((res) => {
      reset(res.data);
      setFlag(res.data);
      setLoading(false);
    })
    .catch((error) => {
      console.log(error);
      setLoading(false);
    });
  }, [props.user]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmitHandler = (data) => {
    if (!props.user || !props.user.username) {
      toast.error("Thông tin người dùng không hợp lệ!");
      return;
    }
    
    const result = {
      ...data,
      id: flag.id,
    };
    console.log(result);
    updatepProfile(result)
      .then(() => {
        toast.success("Cập nhật thông tin thành công!");
        props.refresh(false);
        getByUsername(props.user.username)
        .then((res) => {
          props.userHandler(res.data)
        })
        .catch((error) => console.log(error))
        history.push("/");
      })
      .catch((error) => toast.error(error.response.data.Errors));
  };

  const handleEmailChangeSuccess = (newEmail) => {
    setShowChangeEmail(false);
    // Reload profile data to get updated email
    if (props.user && props.user.id) {
      getAccountDetailByAccountId(props.user.id)
        .then((res) => {
          reset(res.data);
          setFlag(res.data);
          toast.success("Email đã được cập nhật thành công!");
        })
        .catch((error) => console.log(error));
    }
  };

  const handleEmailChangeCancel = () => {
    setShowChangeEmail(false);
  };

  // Show loading if user data is not available
  if (loading || !props.user) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
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
                    Thông tin tài khoản
                  </h3>
                  <form
                    className="needs-validation"
                    onSubmit={handleSubmit(onSubmitHandler)}
                  >
                    <div className="row">
                      <div className="col-md-12 mb-4 d-flex align-items-center">
                        <div className="form-outline datepicker w-100">
                           <label htmlFor="birthdayDate" className="form-label">
                            Họ tên
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            id="birthdayDate"
                            {...register("fullname", {
                              required: true,
                              pattern: /^\s*\S+.*/,
                            })}
                          />
                        
                          {errors.fullName && (
                            <div className="alert alert-danger" role="alert">
                              Họ tên không hợp lệ!
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-12 mb-4">
                        <h6 className="mb-2 pb-1">Giới tính: </h6>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="inlineRadioOptions"
                            id="femaleGender"
                            defaultValue="Nữ"
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
                      <div className="col-md-12 mb-4 d-flex align-items-center">
                        <div className="form-outline datepicker w-100">
                          <input
                            type="date"
                            className="form-control form-control-lg"
                            id="birthDate"
                            {...register("birthDate", { required: true })}
                          />
                          <label htmlFor="birthDate" className="form-label">
                            Ngày sinh
                          </label>
                          {errors.birthDate && (
                            <div className="alert alert-danger" role="alert">
                              Ngày sinh không hợp lệ!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12 mb-4 pb-2">
                        <div className="form-outline d-flex align-items-center">
                         
                          <label className="form-label" htmlFor="emailAddress">
                          Email
                          </label> 
                          <input
                            type="text"
                            id="emailAddress"
                            className="form-control form-control-lg"
                            readOnly
                            {...register("email", {
                              required: true,
                              pattern:
                                /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            })}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-light btn-sm ms-2"
                            onClick={() => setShowChangeEmail(true)}
                          >
                            <i className="fas fa-edit"></i> Đổi
                          </button>
                        </div>
                       
                        {errors.email && (
                          <div className="alert alert-danger" role="alert">
                            Email không hợp lệ!
                          </div>
                        )}
                      </div>
                      <div className="col-md-12 mb-4 pb-2">
                        <div className="form-outline">
                              <label className="form-label" htmlFor="phoneNumber">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            id="phoneNumber"
                            className="form-control form-control-lg"
                            {...register("phone", {
                              required: true,
                              pattern: /^0[0-9]{9}$/,
                            })}
                          />
                     
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
                   <label className="form-label select-label">
                          Địa chỉ
                        </label>
                        <textarea
                          name=""
                          id=""
                          cols="62"
                          rows="5"
                          {...register("address", { required: false })}
                        ></textarea>

                      </div>
                    </div>
                    <div className="mt-4 pt-2 mb-3">
                      <button className="btn btn-primary btn-lg" type="submit">
                        Cập nhật
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Change Email Modal */}
      {showChangeEmail && (
        <ChangeEmail
          currentEmail={flag?.email}
          onSuccess={handleEmailChangeSuccess}
          onCancel={handleEmailChangeCancel}
        />
      )}
    </div>
  );
};

export default Profile; 