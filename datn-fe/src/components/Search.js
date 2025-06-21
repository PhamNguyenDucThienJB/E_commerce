import React, { useState, useEffect } from "react";
import { searchByKeyword, getTotalPage } from "../api/ProductApi";
import { NavLink } from "react-router-dom";
import { getProductRatingStatistics } from "../api/RatingApi";

const Search = (props) => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [ratingsStats, setRatingsStats] = useState({});

  useEffect(() => {
    if (!props.keyword || props.keyword.trim() === "") {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    searchByKeyword(1, 10, props.keyword)
      .then((response) => setProducts(response.data))
      .finally(() => setIsLoading(false));

    getTotalPage().then((res) => setTotal(res.data));
  }, [props.keyword]);
  // Gọi API lấy rating khi products thay đổi
  useEffect(() => {
    if (products.length > 0) {
      const fetchRatings = async () => {
        const statsMap = {};
        await Promise.all(
          products.map(async (item) => {
            try {
              const resp = await getProductRatingStatistics(item.id);
              statsMap[item.id] = resp.data;
            } catch (error) {
              console.error("Lỗi lấy rating cho sản phẩm", item.id, error);
            }
          })
        );
        setRatingsStats(statsMap);
      };
      fetchRatings();
    }
  }, [products]);
  return (
    <div className="container">
      <div className="row my-4">
        <h4 className="text-danger">Kết quả tìm kiếm:</h4>
      </div>

      {/* Trường hợp không nhập từ khóa */}
      {(!props.keyword || props.keyword.trim() === "") && (
        <div className="text-center my-4">
          <h1>Vui lòng nhập từ khóa tìm kiếm</h1>
        </div>
      )}

      {/* Trường hợp đang loading */}
      {isLoading && (
        <div className="text-center my-4">
          <h5>Đang tìm kiếm...</h5>
        </div>
      )}

      {/* Trường hợp không có kết quả */}
      {props.keyword && products.length === 0 && !isLoading && (
        <div className="text-center my-4">
          <h5>Không có sản phẩm nào được tìm thấy</h5>
        </div>
      )}

      {/* Danh sách sản phẩm */}
      <div className="row d-flex flex-wrap">
        {products &&
          products.map((item, index) => (
            <div
              className="col-6 col-sm-6 col-md-4 col-lg-4 mb-4 d-flex"
              key={index}
            >
              <div className="product-card flex-fill d-flex flex-column">
                <NavLink
                  to={`/product-detail/${item.id}`}
                  className="position-relative d-block"
                >
                  {item.discount > 0 && (
                    <span className="badge-sale">-{item.discount}%</span>
                  )}
                  {ratingsStats[item.id] && (
                    <span className="badge-rating">
                      {ratingsStats[item.id].averageRating.toFixed(1)}★(
                      {ratingsStats[item.id].totalRatings})
                    </span>
                  )}
                  <img
                    src={`http://localhost:8080/uploads/${item.image}`}
                    alt={item.name}
                    className="product-image"
                    style={{ width: "100%", height: "auto", objectFit: "cover" }}
                  />
                </NavLink>
                <div className="product-card-details mt-auto p-2">
                  <p className="product-card-title">{item.name}</p>
                  <p className="product-card-price">
                    {((item.price * (100 - item.discount)) / 100).toLocaleString()} đ
                  </p>
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
  );
};

export default Search;
