import React, { useState, useEffect } from "react";
import { getAllProducts, filterProducts } from "../api/ProductApi";
import { NavLink } from "react-router-dom";
import "./sidebar/sidebar.css";
import "./Home.css";

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
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-lg-3 col-md-4 mb-4">
          <div className="filter-section">
            <div className="category-card mb-3">
              <div className="category-title">
                <h5 className="text-primary mb-0">Loại sản phẩm</h5>
              </div>
              <div className="category-items">
                {brands.map((item, index) => (
                  <div 
                    key={index}
                    className={`category-item ${brand.includes(item.value) ? 'category-active' : ''}`}
                    onClick={() => chooseBrandHandler(item.value)}
                  >
                    <span className="category-icon">⊞</span> {item.display_name}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="category-card mb-3">
              <div className="category-title">
                <h5 className="text-primary mb-0">Màu sắc</h5>
              </div>
              <div className="category-items">
                {categories.map((item, index) => (
                  <div 
                    key={index}
                    className={`category-item ${category.includes(item.value) ? 'category-active' : ''}`}
                    onClick={() => chooseCategoryHandler(item.value)}
                  >
                    <span className="category-icon">⊞</span> {item.display_name}
                  </div>
                ))}
              </div>
            </div>

            <div className="category-card">
              <div className="category-title">
                <h5 className="text-primary mb-0">Giá</h5>
              </div>
              <div className="category-items">
                {prices.map((item, index) => (
                  <div 
                    key={index}
                    className={`category-item ${price.includes(item.value) ? 'category-active' : ''}`}
                    onClick={() => choosePriceHandler(item.value)}
                  >
                    <span className="category-icon">⊞</span> {item.display_name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
          
        <div className="col-lg-9 col-md-8">
          <div className="product-section bg-white p-4 rounded">
            <div className="row mb-4">
              <div className="col-12">
                <h2 className="section-title">Sản phẩm của chúng tôi</h2>
              </div>
            </div>
            <div className="row d-flex flex-wrap">
              {products && products.map((item, index) => (
                <div className="col-6 col-sm-6 col-md-4 col-lg-4 mb-4 d-flex" key={index}>
                  <div className="product-card flex-fill d-flex flex-column">
                    <NavLink to={`/product-detail/${item.id}`} className="position-relative d-block">
                      {item.discount > 0 && <span className="badge-sale">-{item.discount}%</span>}
                      <img
                        src={require(`../static/images/${item.image}`)}
                        alt={item.name}
                        className="product-image"
                      />
                    </NavLink>
                    <div className="product-card-details mt-auto">
                      <p className="product-card-title">{item.name}</p>
                      <p className="product-card-price">{((item.price * (100 - item.discount)) / 100).toLocaleString()} đ</p>
                      <div className="d-flex justify-content-center">
                        <NavLink
                          to={`/product-detail/${item.id}`} 
                          className="btn btn-primary me-2"
                        >
                          Thêm vào giỏ hàng
                        </NavLink>
                        <button className="btn btn-outline-danger">
                          <i className="fa fa-heart"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
            
          <div className="d-flex justify-content-center mt-4">
            <nav aria-label="Page navigation">
              <ul className="pagination justify-content-center mt-3 mb-0">
                <li className={page === 1 ? "page-item disabled" : "page-item"}>
                  <button
                    className="page-link"
                    disabled={page === 1}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => onChangePage(page - 1)}
                  >
                    <i className="fa fa-chevron-left"></i>
                  </button>
                </li>
                {rows}
                <li className={page === total ? "page-item disabled" : "page-item"}>
                  <button
                    className="page-link"
                    disabled={page === total}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => onChangePage(page + 1)}
                  >
                    <i className="fa fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
