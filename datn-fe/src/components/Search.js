import React, { useState, useEffect } from "react";
import { searchByKeyword, getTotalPage } from "../api/ProductApi";
import { NavLink } from "react-router-dom";

const Search = (props) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState({});

  useEffect(() => {
    searchByKeyword(1, 10, props.keyword).then((response) =>
      setProducts(response.data)
    );
    getTotalPage().then((res) => setTotal(res.data));
  }, [props.keyword]);

  return (
    <div>
      {" "}
      <div className="container-fluid padding">
        <div className="row welcome mini-card">
          <div className="text-danger">
            <h4 className="title">Kết quả tìm kiếm</h4>
          </div>
        </div>
      </div>
      <div className="col-11 container-fluid card">
        <div className="row padding d-flex">
          {products.length === 0 && (
            <div className="error-template">
              <h5 style={{textAlign: 'center'}}>Không sản phẩm nào được tìm thấy</h5>
            </div>
          )}
          {products &&
            products.map((item, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <div className="card h-100 mini-pro">
                  <div className="d-flex justify-content-between position-absolute w-100">
                    <div className="label-new">
                      <span className="text-white bg-success small d-flex align-items-center px-2 py-1">
                        <i className="fa fa-star" aria-hidden="true"></i>
                        <span className="ml-1">New</span>
                      </span>
                    </div>
                  </div>
                  <NavLink to={`/product-detail/${item.id}`}>
                    <img
                      src={require(`../static/images/${item.image}`)}
                      style={{ width: 150, height: 150 }}
                      alt="Product"
                      className="mini-card"
                    />
                  </NavLink>
                  <div className="card-body px-2 pb-2 pt-1">
                    <div className="d-flex justify-content-between">
                      <div>
                        <p className="h4 text-primary mini-card">
                          {(
                            (item.price * (100 - item.discount)) /
                            100
                          ).toLocaleString()}{" "}
                          đ
                        </p>
                      </div>
                    </div>
                    <p className="text-warning d-flex align-items-center mb-2">
                      <i className="fa fa-star" aria-hidden="true"></i>
                      <i className="fa fa-star" aria-hidden="true"></i>
                      <i className="fa fa-star" aria-hidden="true"></i>
                      <i className="fa fa-star" aria-hidden="true"></i>
                      <i className="fa fa-star" aria-hidden="true"></i>
                    </p>
                    <p className="mb-0">
                      <strong>
                        <NavLink
                          to={`/product-detail/${item.id}`}
                          className="text-secondary "
                        >
                          {item.name}
                        </NavLink>
                      </strong>
                    </p>
                    <p className="mb-1">
                      <small>
                        <NavLink to="#" className="text-secondary ">
                          {item.brand}
                        </NavLink>
                      </small>
                    </p>
                    <div className="d-flex mb-3 justify-content-between">
                      <div>
                        <p className="mb-0 small">
                          <b>Yêu thích: </b> {item.view} lượt
                        </p>
                        <p className="mb-0 small">
                          <b>Giá gốc: {item.price.toLocaleString()} đ</b>
                        </p>
                        <p className="mb-0 small text-danger">
                          <span className="font-weight-bold">Tiết kiệm: </span>{" "}
                          {(
                            (item.price * item.discount) /
                            100
                          ).toLocaleString()}{" "}
                          đ ({item.discount}%)
                        </p>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between">
                      <div className="col px-0 ">
                        <NavLink
                          to={`/product-detail/${item.id}`}
                          exact
                          className="btn btn-outline-primary btn-block"
                        >
                          Thêm vào giỏ
                          <i
                            className="fa fa-shopping-basket"
                            aria-hidden="true"
                          ></i>
                        </NavLink>
                      </div>
                      <div className="ml-2">
                        <NavLink
                          to="#"
                          className="btn btn-outline-success"
                          data-toggle="tooltip"
                          data-placement="left"
                          title="Add to Wishlist"
                        >
                          <i className="fa fa-heart" aria-hidden="true"></i>
                        </NavLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
