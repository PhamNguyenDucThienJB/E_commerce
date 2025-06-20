import addidas from "../static/images/operation/op_01.png";
import nike from "../static/images/operation/op_02.png";
import puma from "../static/images/operation/op_03.png";
import fila from "../static/images/operation/op_04.png";
import { NavLink } from "react-router-dom";
import first from "../static/images/slide_Bar.jpg";
import second from "../static/images/slide_09.jpg";
import third from "../static/images/slide_07.jpg";
import fourth from "../static/images/slide_06.jpg";
import React, { useState, useEffect } from "react";
import { getAllProducts, getMostViewedProducts, getBestSellingProducts } from "../api/ProductApi";
import { getProductRatingStatistics } from "../api/RatingApi";
import './Home.css';

const Home = (props) => {
  const [products, setProducts] = useState([]);
  const [ratingsStats, setRatingsStats] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState({});
  const [active, setActive] = useState(true);
  const [mostViewedProducts, setMostViewedProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [mostViewedPage, setMostViewedPage] = useState(1);
  const [mostViewedTotal, setMostViewedTotal] = useState(0);
  const [bestSellingPage, setBestSellingPage] = useState(1);
  const [bestSellingTotal, setBestSellingTotal] = useState(0);
  const jwtToken = localStorage.getItem("token"); // Lấy token từ localStorage
if (!jwtToken) {
  console.error("JWT Token không tồn tại!");
}


var rows = new Array(Math.min(total, 2)).fill(0).map((zero, index) => (
  <li
    className={page === index + 1 ? "page-item active" : "page-item"}
    key={index}
  >
    <button
      className="page-link"
      style={{ borderRadius: 50 }}
      onMouseDown={e => e.preventDefault()}
      onClick={() => onChangePage(index + 1)}
    >
      {index + 1}
    </button>
  </li>
));


  // Pagination for Most Viewed
  const mostViewedRows = new Array(mostViewedTotal).fill(0).map((_, index) => (
    <li
      className={mostViewedPage === index + 1 ? "page-item active" : "page-item"}
      key={index}
    >
      <button
        className="page-link"
        style={{ borderRadius: 50 }}
        onMouseDown={e => e.preventDefault()}
        onClick={() => setMostViewedPage(index + 1)}
      >
        {index + 1}
      </button>
    </li>
  ));

  // Pagination for Best Sellers
  const bestSellingRows = new Array(bestSellingTotal).fill(0).map((_, index) => (
    <li
      className={bestSellingPage === index + 1 ? "page-item active" : "page-item"}
      key={index}
    >
      <button
        className="page-link"
        style={{ borderRadius: 50 }}
        onMouseDown={e => e.preventDefault()}
        onClick={() => setBestSellingPage(index + 1)}
      >
        {index + 1}
      </button>
    </li>
  ));

  useEffect(() => {
    getAllProducts(page, 8, active).then((response) =>
      {
        setProducts(response.data.content);
        setTotal(response.data.totalPages);
      }
    );
    props.changeHeaderHandler(1);
  }, [page]);

  // Fetch most-viewed products by page
  useEffect(() => {
    getMostViewedProducts(mostViewedPage, 8).then(res => {
      setMostViewedProducts(res.data.content);
      setMostViewedTotal(res.data.totalPages);
    });
  }, [mostViewedPage]);

  // Fetch best-selling products by page
  useEffect(() => {
    getBestSellingProducts(bestSellingPage, 8).then(res => {
      setBestSellingProducts(res.data.content);
      setBestSellingTotal(res.data.totalPages);
    });
  }, [bestSellingPage]);

  // Fetch rating statistics for all homepage products
  useEffect(() => {
    const allItems = [...products, ...mostViewedProducts, ...bestSellingProducts];
    if (allItems.length > 0) {
      const fetchStats = async () => {
        const statsMap = {};
        await Promise.all(allItems.map(async (item) => {
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
  }, [products, mostViewedProducts, bestSellingProducts]);

  const onChangePage = (page) => {
    setPage(page);
  };

  return (
    <div>
      {/* Carousel */}
      <div className="hero-carousel">
        <div id="slides" className="carousel slide mb-5" data-ride="carousel">
          <ul className="carousel-indicators">
            <li data-target="#slides" data-slide-to={0} className="active" />
            <li data-target="#slides" data-slide-to={1} />
            <li data-target="#slides" data-slide-to={2} />
            <li data-target="#slides" data-slide-to={3} />
          </ul>
          <div className="carousel-inner mini-card">
            <div className="carousel-item active">
              <img src={second} alt="" />
            </div>
            <div className="carousel-item">
              <img src={first} alt="" />
            </div>
            <div className="carousel-item">
              <img src={third} alt="" />
            </div>
            <div className="carousel-item">
              <img src={fourth} alt="" />
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid padding">
        <div className="row text-center padding">
          <div className="col-xs-12 col-sm-6 col-md-3 mini-card">
            <img src={addidas} alt="" height={50} />
          </div>
          <div className="col-xs-12 col-sm-6 col-md-3 mini-card">
            <img src={nike} alt="" height={50} />
          </div>
          <div className="col-xs-12 col-sm-6 col-md-3 mini-card">
            <img src={puma} alt="" height={50} />
          </div>
          <div className="col-xs-12 col-sm-6 col-md-3 mini-card">
            <img src={fila} alt="" height={50} />
          </div>
        </div>
      </div>
      <div className="container-fluid padding product-section">
        <div className="row welcome">
          <h2 className="section-title">Sản Phẩm Mới</h2>
        </div>
        <div className="row d-flex flex-wrap">
          {products && products.map((item, index) => (
            <div className="col-6 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex" key={index}>
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
                      className="btn btn-primary mr-2"
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
      <nav aria-label="Sản phẩm mới page navigation">
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
      <div className="container-fluid padding mt-5 product-section">
        <div className="row welcome">
          <h2 className="section-title">Xem nhiều nhất</h2>
        </div>
        <div className="row d-flex flex-wrap">
          {mostViewedProducts && mostViewedProducts.map((item, index) => (
            <div className="col-6 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex" key={index}>
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
                      className="btn btn-primary mr-2"
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
        <nav aria-label="Most viewed page navigation">
          <ul className="pagination justify-content-center mt-3 mb-0">
            <li className={mostViewedPage === 1 ? "page-item disabled" : "page-item"}>
              <button
                className="page-link"
                disabled={mostViewedPage === 1}
                onMouseDown={e => e.preventDefault()}
                onClick={() => setMostViewedPage(mostViewedPage - 1)}
              >
                <i className="fa fa-chevron-left"></i>
              </button>
            </li>
            {mostViewedRows}
            <li className={mostViewedPage === mostViewedTotal ? "page-item disabled" : "page-item"}>
              <button
                className="page-link"
                disabled={mostViewedPage === mostViewedTotal}
                onMouseDown={e => e.preventDefault()}
                onClick={() => setMostViewedPage(mostViewedPage + 1)}
              >
                <i className="fa fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="container-fluid padding mt-5 product-section">
        <div className="row welcome">
          <h2 className="section-title">Bán chạy</h2>
        </div>
        <div className="row d-flex flex-wrap">
          {bestSellingProducts && bestSellingProducts.map((item, index) => (
            <div className="col-6 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex" key={index}>
              <div className="product-card flex-fill d-flex flex-column">
                <NavLink to={`/product-detail/${item.id}`} className="position-relative d-block">
                  {item.discount > 0 && <span className="badge-sale">-{item.discount}%</span>}
                  {ratingsStats[item.id] && (
                    <span className="badge-rating">
                      {ratingsStats[item.id].averageRating.toFixed(1)}★({ratingsStats[item.id].totalRatings})
                    </span>
                  )}
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
                      className="btn btn-primary mr-2"
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
        <nav aria-label="Best sellers page navigation">
          <ul className="pagination justify-content-center mt-3 mb-0">
            <li className={bestSellingPage === 1 ? "page-item disabled" : "page-item"}>
              <button
                className="page-link"
                disabled={bestSellingPage === 1}
                onMouseDown={e => e.preventDefault()}
                onClick={() => setBestSellingPage(bestSellingPage - 1)}
              >
                <i className="fa fa-chevron-left"></i>
              </button>
            </li>
            {bestSellingRows}
            <li className={bestSellingPage === bestSellingTotal ? "page-item disabled" : "page-item"}>
              <button
                className="page-link"
                disabled={bestSellingPage === bestSellingTotal}
                onMouseDown={e => e.preventDefault()}
                onClick={() => setBestSellingPage(bestSellingPage + 1)}
              >
                <i className="fa fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Home;
