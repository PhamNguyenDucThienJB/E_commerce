import React, { useState, useEffect } from "react";
import { getAllProducts, filterProducts } from "../api/ProductApi";
import { NavLink } from "react-router-dom";
import "./sidebar/sidebar.css";

const brands = [
  {
    display_name: "Nam",
    value: "1",
    icon: "bx bx-category-alt",
  },
  {
    display_name: "Nữ",
    value: "2",
    icon: "bx bx-category-alt",
  },
  {
    display_name: "Trẻ Em",
    value: "3",
    icon: "bx bx-category-alt",
  },
  // {
  //   display_name: "ADIDAS",
  //   value: "4",
  //   icon: "bx bx-category-alt",
  // },
  // {
  //   display_name: "FILA",
  //   value: "5",
  //   icon: "bx bx-category-alt",
  // },
  // {
  //   display_name: "CONVERSE",
  //   value: "6",
  //   icon: "bx bx-category-alt",
  // },
  // {
  //   display_name: "LI-NING",
  //   value: "7",
  //   icon: "bx bx-category-alt",
  // },
];
const categories = [
  {
    display_name: "Màu Đen",
    value: "1",
    icon: "bx bx-category-alt",
  },
  {
    display_name: "Màu Trắng",
    value: "2",
    icon: "bx bx-category-alt",
  },
  {
    display_name: "Phối Màu",
    value: "3",
    icon: "bx bx-category-alt",
  },
  // {
  //   display_name: "Giày đá bóng",
  //   value: "4",
  //   icon: "bx bx-category-alt",
  // },
  // {
  //   display_name: "Giày thời trang",
  //   value: "5",
  //   icon: "bx bx-category-alt",
  // },
  // {
  //   display_name: "Giày bóng rổ",
  //   value: "6",
  //   icon: "bx bx-category-alt",
  // },
  // {
  //   display_name: "Giày chạy bộ",
  //   value: "7",
  //   icon: "bx bx-category-alt",
  // },
];

const prices = [
  // {
  //   display_name: "Dưới 1 triệu",
  //   value: "0",
  //   icon: "bx bx-category-alt",
  //   min: 0,
  //   max: 1000000,
  // },
  {
    display_name: "5000.000- 1.000.000",
    value: "0",
    icon: "bx bx-category-alt",
    min: 500000,
    max: 1000000,
  },
  {
    display_name: "300.000 - 500.000",
    value: "1",
    icon: "bx bx-category-alt",
    min: 300000,
    max: 500000,
  },
  {
    display_name: "200.000 - 300.000",
    value: "2",
    icon: "bx bx-category-alt",
    min: 200000,
    max: 300000,
  },
  {
    display_name: "Trên 1 triệu",
    value: "3",
    icon: "bx bx-category-alt",
    min: 1000000,
    max: 100000000,
  },
];

const count = 12;
const defaultBrand = [1, 2, 3, 4, 5, 6, 7];
const defaultCategory = [1, 2, 3, 4, 5, 6, 7];

const Product = (props) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState({});

  const [category, setCategory] = useState([]);
  const [brand, setBrand] = useState([]);
  const [price, setPrice] = useState([]);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(10000000);

  var rows = new Array(total).fill(0).map((zero, index) => (
    <li
      className={page === index + 1 ? "page-item active" : "page-item"}
      key={index}
    >
      <button className="page-link" onClick={() => onChangePage(index + 1)}>
        {index + 1}
      </button>
    </li>
  ));

  useEffect(() => {
    window.scrollTo(0, 0);
    if (category.length === 0 && brand.length === 0 && price.length === 0) {
      getAllProducts(page, count, true).then((response) => {
        setProducts(response.data.content);
        setTotal(response.data.totalPages);
      });
    } else {
      console.log(false);
      const data = {
        page: page,
        count: count,
        category: category.length > 0 ? category : defaultCategory,
        brand: brand.length > 0 ? brand : defaultBrand,
        min: min,
        max: max,
      };
      filterProducts(data).then((resp) => {
        setProducts(resp.data.content);
        setTotal(resp.data.totalPages);
      });
    }
    props.changeHeaderHandler(2);
  }, [page, category, brand, price]);

  const onChangePage = (page) => {
    setPage(page);
  };

  const chooseCategoryHandler = (value) => {
    const index = category.indexOf(value);
    if (index > -1) {
      setCategory(category.filter((i) => i !== value));
    } else {
      setCategory([...category, value]);
    }
    onChangePage(1);
  };

  const chooseBrandHandler = (value) => {
    const index = brand.indexOf(value);
    if (index > -1) {
      setBrand(brand.filter((i) => i !== value));
    } else {
      setBrand([...brand, value]);
    }
    onChangePage(1);
  };

  const choosePriceHandler = (value) => {
    const index = price.indexOf(value);
    let temp = [];
    if (index > -1) {
      temp = price.filter((i) => i !== value);
      setPrice(price.filter((i) => i !== value));
    } else {
      temp = [...price, value];
      setPrice([...price, value]);
    }
    if (temp.length > 0) {
      temp.sort();
      setMin(prices[temp[0]].min);
      setMax(prices[temp[temp.length - 1]].max);
    } else {
      setMin(0);
      setMax(10000000);
    }
    onChangePage(1);
  };

  return (
    <div>
      <div className="mt-5">
        <div className="row">
          <div className="col-2.5" style={{ position: "sticky", top: "100px", zIndex: 10 }}>
            <div className="col mini-card">
              <h4 className="text-danger fw-bolder">Loại</h4>
              <ul className="list-group">
                {brands.map((item, index) => (
                  <div
                    className="sidebar__item"
                    key={index}
                    onClick={() => chooseBrandHandler(item.value)}
                  >
                    <div
                      className={
                        brand.includes(item.value)
                          ? `sidebar__item-inner active`
                          : `sidebar__item-inner`
                      }
                    >
                      <i className={item.icon}></i>
                      <span>{item.display_name}</span>
                    </div>
                  </div>
                ))}
              </ul>
            </div>
            <div className="col mini-card">
              <h4 className="text-danger fw-bolder">Màu Sắc</h4>
              <ul className="list-group">
                {categories.map((item, index) => (
                  <div
                    className="sidebar__item"
                    key={index}
                    onClick={() => chooseCategoryHandler(item.value)}
                  >
                    <div
                      className={
                        category.includes(item.value)
                          ? `sidebar__item-inner active`
                          : `sidebar__item-inner`
                      }
                    >
                      <i className={item.icon}></i>
                      <span>{item.display_name}</span>
                    </div>
                  </div>
                ))}
              </ul>
            </div>

            <div className="col mt-3 mini-card">
              <h4 className="text-danger fw-bolder">Giá</h4>
              <ul className="list-group">
                {prices.map((item, index) => (
                  <div className="sidebar__item" key={index}>
                    <div
                      className={
                        price.includes(item.value)
                          ? `sidebar__item-inner active`
                          : `sidebar__item-inner`
                      }
                      onClick={() => choosePriceHandler(item.value)}
                    >
                      <i className={item.icon}></i>
                      <span>{item.display_name}</span>
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          </div>
          <div className="col">
            <div className="container-fluid padding">
              <div className="container-fluid padding">
                <div className="row welcome mini-card">
                  <h4 className="title text-danger">Sản phẩm nổi bật</h4>
                </div>
              </div>
              <div className="row padding">
                {products &&
                  products.map((item, index) => (
                    <div className="col-md-4 mb-3" key={index}>
                      <div className="card h-100">
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
                          />
                        </NavLink>
                        <div className="card-body px-2 pb-2 pt-1">
                          <div className="d-flex justify-content-between">
                            <div>
                              <p className="h4 text-primary">
                                {item.price.toLocaleString()} Đ
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
                                className="text-secondary"
                              >
                                {item.name}
                              </NavLink>
                            </strong>
                          </p>
                          <p className="mb-1">
                            <small>
                              <NavLink to="#" className="text-secondary">
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
                                <b>Giá gốc: </b> {item.price.toLocaleString()} Đ
                              </p>
                              <p className="mb-0 small text-danger">
                                <span className="font-weight-bold">
                                  Tiết kiệm:{" "}
                                </span>{" "}
                                0 đ (0%)
                              </p>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between">
                            <div className="col px-0">
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
                                <i
                                  className="fa fa-heart"
                                  aria-hidden="true"
                                ></i>
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
        </div>

        <div className="d-flex justify-content-center mt-5">
          <nav aria-label="Page navigation example">
            <ul className="pagination offset-5">
              <li className={page === 1 ? "page-item disabled" : "page-item"}>
                <button className="page-link" onClick={() => onChangePage(1)}>
                  First
                </button>
              </li>
              {rows}
              <li
                className={page === total ? "page-item disabled" : "page-item"}
              >
                <button
                  className="page-link"
                  onClick={() => onChangePage(total)}
                >
                  Last
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Product;
