import React, { useState, useEffect } from "react";
import { getAllProducts, filterProducts } from "../api/ProductApi";
import { getProductRatingStatistics } from "../api/RatingApi";
import { NavLink } from "react-router-dom";
import "./sidebar/sidebar.css";
import "./Home.css";
import {
  filterAdvancedProducts,
  getBestSellingProducts,
  getMostViewedProducts,
} from "../api/ProductApi";



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

];

const prices = [

  {
    display_name: "500.000- 1.000.000",
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
  const [sortField, setSortField] = useState("modifyDate");
  const [sortDirection, setSortDirection] = useState("DESC");

  const [products, setProducts] = useState([]);
  const [ratingsStats, setRatingsStats] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState({});

  const [category, setCategory] = useState([]);
  const [brand, setBrand] = useState([]);
  const [price, setPrice] = useState([]);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(10000000);
  const [mostViewedProducts, setMostViewedProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [mostViewedPage, setMostViewedPage] = useState(1);
  const [mostViewedTotal, setMostViewedTotal] = useState(0);
  const [bestSellingPage, setBestSellingPage] = useState(1);
  const [bestSellingTotal, setBestSellingTotal] = useState(0);
  const [filteredProducts, setFilteredProducts] = useState([]);

 
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
  const size = count;

  const fetchProducts = async () => {
    let response;

    // Có lọc? → Luôn dùng filterProducts
    const hasFilter = category.length > 0 || brand.length > 0 || price.length > 0;

    if (hasFilter) {
      const data = {
        page,
        count: size,
        category: category.length > 0 ? category : defaultCategory,
        brand: brand.length > 0 ? brand : defaultBrand,
        min,
        max,
        sortField,
        sortDirection,
        
      };

      // Dùng field sort riêng cho filter
      switch (sortField) {
        case "price-asc":
          data.sort = "price,ASC";
          break;
        case "discount":
          data.sort = "discount,DESC";
          break;
        case "latest":
        default:
          data.sort = "modifyDate,DESC";
          break;
      }

      response = await filterProducts(data);
    } else {
      // Không lọc → Gọi API tương ứng
      switch (sortField) {
        case "best-seller":
          response = await getBestSellingProducts(page, size, "DESC");
          break;
        case "most-viewed":
         const dataViewed = {
            page,
            count: size,
            category: category.length > 0 ? category : defaultCategory,
            brand: brand.length > 0 ? brand : defaultBrand,
            min,
            max,
            sortField: "view", // chính xác tên field trong entity Java
            sortDirection: "DESC",  // hoặc "ASC" nếu muốn
          };
          response = await filterAdvancedProducts(dataViewed);
          break;
        case "price-asc":
          response = await getAllProducts(page, size, true, "price", "DESC");
          break;
        case "discount":
          response = await getAllProducts(page, size, true, "discount", "DESC");
          break;
        case "rating":
          const dataRating = {
            page,
            count: size,
            category: category.length > 0 ? category : defaultCategory,
            brand: brand.length > 0 ? brand : defaultBrand,
            min,
            max,
            sortField: "avgRating", // chính xác tên field trong entity Java
            sortDirection: "DESC",  // hoặc "ASC" nếu muốn
          };
          response = await filterAdvancedProducts(dataRating);
          break;
           case "salerating":
          const datasale = {
            page,
            count: size,
            category: category.length > 0 ? category : defaultCategory,
            brand: brand.length > 0 ? brand : defaultBrand,
            min,
            max,
            sortField: "sale", // chính xác tên field trong entity Java
            sortDirection: "DESC",  // hoặc "ASC" nếu muốn
          };
          response = await filterAdvancedProducts(datasale);
          break;
        case "latest":
        default:
          const dataDate = {
            page,
            count: size,
            category: category.length > 0 ? category : defaultCategory,
            brand: brand.length > 0 ? brand : defaultBrand,
            min,
            max,
            sortField: "modifyDate", // chính xác tên field trong entity Java
            sortDirection: "DESC",  // hoặc "ASC" nếu muốn
          };
          response = await filterAdvancedProducts(dataDate);
          break;
      }
    }

    setProducts(response.data.content);
    setTotal(response.data.totalPages);
    props.changeHeaderHandler(2);
  };

  fetchProducts();
}, [page, category, brand, price, sortField]);


  useEffect(() => {
    if (products.length > 0) {
      const fetchStats = async () => {
        const statsMap = {};
        await Promise.all(products.map(async (item) => {
          try {
            const resp = await getProductRatingStatistics(item.id);
            statsMap[item.id] = resp.data;
          } catch (error) {
            console.error("Failed to fetch rating stats for product", item.id, error);
          }
        }));
        setRatingsStats(statsMap);
      };
      fetchStats();
    }
  }, [products]);

  const onChangePage = (page) => {
    setPage(page);
  };

 const chooseCategoryHandler = (value) => {
  if (category.includes(value)) {
    // Nếu đang chọn rồi, bỏ chọn
    setCategory([]);
  } else {
    // Chọn 1 giá trị duy nhất
    setCategory([value]);
  }
  onChangePage(1);
};

const chooseBrandHandler = (value) => {
  if (brand.includes(value)) {
    setBrand([]);
  } else {
    setBrand([value]);
  }
  onChangePage(1);
};

const choosePriceHandler = (value) => {
  let temp = [];
  if (price.includes(value)) {
    temp = [];
    setPrice([]);
    setMin(0);
    setMax(10000000);
  } else {
    temp = [value];
    setPrice([value]);
    setMin(prices[value].min);
    setMax(prices[value].max);
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
             <div className="d-flex justify-content-between align-items-center">
                <h2 className="section-title mb-0">Sản phẩm của chúng tôi</h2>
               <select
                  className="form-select w-auto mb-3"
                  value={sortField}
                  onChange={(e) => {
                    setSortField(e.target.value);
                    setPage(1); // reset trang
                  }}
                >
                  <option value="latest">Mới nhất</option>
                  <option value="best-seller">Bán chạy</option>
                  <option value="most-viewed">Xem nhiều</option>
                  <option value="salerating">Giảm giá nhiều</option>
                  <option value="rating">Đánh Giá</option>
                </select>

              </div>

              </div>
              
            </div>
            <div className="row d-flex flex-wrap">
              {products && products.map((item, index) => (
                <div className="col-6 col-sm-6 col-md-4 col-lg-4 mb-4 d-flex" key={index}>
                  <div className="product-card flex-fill d-flex flex-column">
                    <NavLink to={`/product-detail/${item.id}`} className="position-relative d-block">
                      {item.discount > 0 && <span className="badge-sale">-{item.discount}%</span>}
                      {ratingsStats[item.id] && (
                        <span className="badge-rating">
                          {ratingsStats[item.id].averageRating.toFixed(1)}★({ratingsStats[item.id].totalRatings})
                        </span>
                      )}
                      <img
                        src={`http://localhost:8080/uploads/${item.image}`}
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
