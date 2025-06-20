import React, { useState, useEffect } from "react";
import { Button, Form } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { getAllProductsByBrand,deleteProduct } from "../../api/ProductApi";
import { NavLink } from "react-router-dom";
import { getBrands } from "../../api/BrandApi";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const Product = () => {
  const [deleteId, setDeleteId] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState({});
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const [brand, setBrand] = useState([]);
  const history = useHistory();
  const  goBack =() => {
      history.goBack();
  };
  useEffect(() => {
  
    let isMounted = true;
    // Fetch products for current page
    getAllProductsByBrand(0, page, 10, true)
      .then((response) => {
        if (isMounted) {
          console.log("Product sample:", response.data.content[0]); // Debug product structure
          setProducts(response.data.content);
          setTotal(response.data.totalPages);
        }
      })
      .catch((error) => console.log(error));
    // Fetch brands
    getBrands(1, 20)
      .then((resp) => {
        if (isMounted) {
          setBrand(resp.data.content);
        }
      })
      .catch((error) => console.log(error));
    return () => {
      // Cleanup to prevent state updates on unmounted component
      isMounted = false;
    };
  }, [page]);

  const onChangePage = (page) => {
    setPage(page);
  };

  var rows = new Array(total).fill(0).map((zero, index) => (
    <li
      className={page === index + 1 ? "page-item active" : "page-item"}
      key={index}
    >
      <button
        className="page-link"
        style={{ borderRadius: 50 }}
        onClick={() => onChangePage(index + 1)}
      >
        {index + 1}
      </button>
    </li>
  ));

  const getProductByBrandHandler = (value) => {
    if (value == 0) {
      // Fetch products for current page
      getAllProductsByBrand(0, page, 10, true)
        .then((response) => {
          setProducts(response.data.content);
          setTotal(response.data.totalPages);
        })
        .catch((error) => console.log(error));
    } else {
      getAllProductsByBrand(value, 1, 10, true)
        .then((resp) => {
          setProducts(resp.data.content);
          setTotal(resp.data.totalPages);
        })
        .catch((error) => console.log(error));
    }
  };
  return (
    
    <div className="col-12">
      
      <div className="card">
        <div className="card__header">
          <NavLink
            to="/add-product"
            className="btn btn-primary"
            style={{ borderRadius: 50 }}
          >
            Thêm sản phẩm
          </NavLink>
        </div>
        <div className="row mb-3 mt-3">
          <div className="col-sm-4 mt-2">
            <select
              className="form-control"
              onChange={(event) => getProductByBrandHandler(event.target.value)}
            >
              <option value="0">Tất cả</option>
              {brand &&
                brand.map((item, index) => (
                  <option key={index} value={item.id}>
                    {item.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="card__body">
          <div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Tên sản phẩm</th>
                    <th scope="col">Mã sản phẩm</th>
                    <th scope="col">Thương hiệu</th>
                    <th scope="col">Mô tả</th>
                    <th scope="col">Trạng thái</th>
                    <th scope="col">Cập nhật</th>
                    <th scope="col">Xóa</th>

                  </tr>
                </thead>
                <tbody>
                  {products &&
                    products.map((item, index) => (
                      <tr key={index}>
                        <th scope="row">
                           <NavLink to={`/product-view/${item.id}`} exact>
                              #{(page - 1) * 10 + index + 1}
                            </NavLink>
                        </th>
                        <th>{item.name}</th>
                        <th>{item.code}</th>
                        <th>{item.brand}</th>
                        <th>
                          <img
                            className="img-fluid"
                            style={{ width: "100px", height: "100px" }}
                            src={`http://localhost:8080/uploads/${item.image}`}
                            alt={item.name}
                          />
                        </th>
                        <th>{item.active ? "Đang bán" : "Dừng bán"}</th>
                        <th>
                          <NavLink to={`/product-detail/${item.id}`} exact>
                            <i
                              className="fa fa-pencil-square-o"
                              aria-hidden="true"
                            ></i>
                          </NavLink>
                        </th>
                        <th>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              setDeleteId(item.id);
                              setShow(true);
                            }}
                          >
                            Xóa
                          </button>
                        </th>

                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <nav aria-label="Page navigation">
          <ul className="pagination offset-5 mt-3">
            <li className={page === 1 ? "page-item disabled" : "page-item"}>
              <button
                className="page-link"
                style={{ borderRadius: 50 }}
                onClick={() => onChangePage(1)}
              >
                {`<<`}
              </button>
            </li>
            {rows}
            <li className={page === total ? "page-item disabled" : "page-item"}>
              <button
                className="page-link"
                style={{ borderRadius: 50 }}
                onClick={() => onChangePage(total)}
              >
                {`>>`}
              </button>
            </li>
          </ul>
        </nav>
      </div>
  <Modal show={show} onHide={handleClose} centered>
  <Modal.Header>
    <Modal.Title>Xác nhận xóa sản phẩm</Modal.Title>
    <button
      onClick={handleClose}
      style={{
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "30px",
      height: "30px",
      fontWeight: "bold",
      display: "flex",          // Thêm dòng này
      alignItems: "center",     // Căn giữa theo chiều dọc
      justifyContent: "center", // Căn giữa theo chiều ngang
      cursor: "pointer",        // Con trỏ khi hover
      marginLeft: "auto"  
      }}
    >
      ×
    </button>
  </Modal.Header>
  <Modal.Body>
    Bạn có chắc chắn muốn xóa sản phẩm này không? <br />
    <strong>ID sản phẩm:</strong> {deleteId}
  </Modal.Body>
  <Modal.Footer>
    <Button
      variant="danger"
      onClick={() => {
        deleteProduct(deleteId)
          .then(() => {
            setProducts(products.filter((product) => product.id !== deleteId));
            setShow(false);
          })
          .catch((err) => console.log(err));
      }}
    >
      Xác nhận
    </Button>
    <Button variant="secondary" onClick={handleClose}>
      Hủy
    </Button>
  </Modal.Footer>
</Modal>

      
    </div>
  );
};

export default Product;
