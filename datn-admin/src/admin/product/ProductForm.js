import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "../image/CardProfile.css";
import { getBrands } from "../../api/BrandApi";
import { getSale } from "../../api/SaleApi";
import { getCategory } from "../../api/CategoryApi";
import logo from "../../assets/images/logo-sneaker.jpg";
import { createProduct } from "../../api/ProductApi";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { upload } from "../services/upload-files.service";
import context from "react-bootstrap/esm/AccordionContext";

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const shirtSizes = ["S", "M", "L", "XL", "XXL"];

const ProductForm = () => {
  const [count, setCount] = useState(1);
  const [brand, setBrand] = useState([]);
  const [sale, setSale] = useState([]);
  const [category, setCategory] = useState([]);
  const [image, setImage] = useState([]);

  const history = useHistory();
  const goBack=()=>{
history.goBack();
  };
  useEffect(() => {
    getBrands(1, 20).then((resp) => setBrand(resp.data.content)).catch(console.log);
    getSale(1, 8).then((resp) => setSale(resp.data.content)).catch(console.log);
    getCategory(1, 20).then((resp) => setCategory(resp.data.content)).catch(console.log);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onFileChange = (event) => {
  const selectedFiles = Array.from(event.target.files);
  const isValid = selectedFiles.every((file) =>
    file.name.endsWith(".jpg") || file.name.endsWith(".png")
  );

  if (!isValid) {
    toast.warning("Chỉ chấp nhận file .jpg hoặc .png");
    return;
  }

  // Cộng dồn ảnh mới với ảnh cũ
  setImage((prev) => [...prev, ...selectedFiles]);
};

  const handleRemoveNewImage = (index) => {
  const updatedImages = [...image];
  updatedImages.splice(index, 1); // Xóa ảnh tại index
  setImage(updatedImages);
};

  const submitHandler = (data) => {
    if (image.length < 2) {
      toast.warning("Cần tải lên 2 bức ảnh");
      return;
    }
    const sizes = Array.from({ length: count }, (_, i) => data[`size${i + 1}`]);
    const hasDuplicate = new Set(sizes).size !== sizes.length;
    if (hasDuplicate) {
      toast.warning("Nhập trùng size. Vui lòng nhập lại!");
      return;
    }

    const attributes = Array.from({ length: count }, (_, i) => ({
      size: data[`size${i + 1}`],
      price: data[`price${i + 1}`],
      stock: data[`quantity${i + 1}`],
    }));

    const product = {
      name: data.name,
      code: data.code,
      description: data.description,
      brandId: data.brand,
      saleId: data.sale,
      categoryId: data.category,
      imageUrl: image.map((item) => item.name),
      attribute: attributes,
    };

    createProduct(product)
      .then(() => {
        image.forEach((item) => upload(item).catch(console.log));
        toast.success("Thêm mới sản phẩm thành công");
        history.push("/product");
      })
      .catch((error) => toast.error(error.response.data.Errors));
  };

  const changeCountHandler = (value) => {
    setCount(value);
  };

  return (
    <div className="pb-3 container-fluid card">
      
      <div className="col-10 offset-1 text-center">
        <h1 className="text-danger">Sản phẩm</h1>
      </div>
      <div className="row card">
         <button style={{ width: 60 }} onClick={() => goBack()}>
        <i
          className="fa fa-arrow-left"
          style={{ fontSize: 18 }}
          aria-hidden="true"
        ></i>
      </button>
        <form
          className="needs-validation pro-form"
          onSubmit={handleSubmit(submitHandler)}
        >
          <div className="col-10">
            <div className="row g-3">
              <div className="col-sm-6">
                <label className="form-label">Tên sản phẩm</label>
                <input
                  type="text"
                  className="form-control"
                  {...register("name", {
                    required: true,
                    pattern: /^\s*\S+.*/,
                  })}
                />
                {errors.name && (
                  <div className="alert alert-danger" role="alert">
                    Tên sản phẩm không hợp lệ!
                  </div>
                )}
              </div>
              <div className="col-sm-6">
                <label className="form-label">Code</label>
                <input
                  type="text"
                  className="form-control"
                  {...register("code", {
                    required: true,
                    pattern: /^\s*\S+.*/,
                  })}
                />
                {errors.code && (
                  <div className="alert alert-danger" role="alert">
                    Code không hợp lệ!
                  </div>
                )}
              </div>
              <div className="col-12 mt-5">
                <label className="form-label">Mô tả sản phẩm</label>
                <textarea
                  className="form-control"
                  id="exampleFormControlTextarea1"
                  rows={3}
                  {...register("description", {
                    required: true,
                    pattern: /^\s*\S+.*/,
                  })}
                />
                {errors.description && (
                  <div className="alert alert-danger" role="alert">
                    Mô tả không hợp lệ!
                  </div>
                )}
              </div>
              <div className="col-sm-6 mt-5">
                <label className="form-label">Thương hiệu</label>
                <select
                  className="form-control"
                  {...register("brand", { required: true })}
                >
                  {brand &&
                    brand.map((item, index) => (
                      <option value={item.id} key={index}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-sm-6 mt-5">
                <label className="form-label">Chương trình giảm giá</label>
                <select
                  className="form-control"
                  {...register("sale", { required: true })}
                >
                  {sale &&
                    sale.map((item, index) => (
                      <option
                        value={item.id}
                        key={index}
                        selected={item.id === 1}
                      >
                        {item.name} - {item.discount} %
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-12 mt-5">
                <label className="form-label mb-3">Loại sản phẩm</label> <br />
                {category &&
                  category.map((item, index) => (
                    <div
                      class="col-2 form-check form-check-inline mr-5"
                      key={index}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value={item.id}
                        {...register("category", { required: true })}
                      />
                      <label class="form-check-label">{item.name}</label>
                    </div>
                  ))}
                {errors.category && (
                  <div className="alert alert-danger" role="alert">
                    Chọn loại sản phẩm!
                  </div>
                )}
              </div>
             <div className="col-12 mt-5">
        <label className="form-label mb-3">Hình ảnh sản phẩm</label>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <label htmlFor="photo-upload" className="d-flex justify-content-center align-items-center border rounded" style={{ height: 150, cursor: "pointer", backgroundColor: "#f8f9fa" }}>
              <i className="fas fa-upload fa-2x text-secondary"></i>
            </label>
            <input
              id="photo-upload"
              type="file"
              multiple
              accept=".jpg,.png"
              hidden
              onChange={(e) => onFileChange(e)}
            />
          </div>

    <div className="col-12 col-md-8 d-flex flex-wrap">
          {image &&
            image.map((item, index) => (
              <div key={index} className="position-relative m-2 shadow rounded" style={{ width: 100, height: 100 }}>
                <img
                  src={URL.createObjectURL(item)}
                  alt={`Ảnh ${index}`}
                  className="rounded border"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <span
                  className={`badge position-absolute ${index === 0 ? "bg-primary" : "bg-secondary"}`}
                  style={{
                    top: 5,
                    left: 5,
                    fontSize: "0.75rem",
                    borderRadius: "8px",
                    zIndex: 1,
                  }}
                >
                  {index === 0 ? "Main" : "Other"}
                </span>

                {/* Nút xóa ảnh mới */}
                <button
                  type="button"
                  className="btn btn-sm btn-light border position-absolute shadow-sm"
                  style={{
                    top: -15,
                    right: -10,
                    zIndex: 2,
                    width: 24,
                    height: 24,
                    padding: 0,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => handleRemoveNewImage(index)}
                >
                  <i className="fas fa-times text-danger" style={{ fontSize: 12 }}></i>
                </button>
              </div>
            ))}
        </div>

  </div>
</div>

            </div>
          </div>
          <div className="col-10 row">
            <div className="card mr-5 col-10">
              <h4 className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-dark">Chi tiết sản phẩm</span> <br />
              </h4>
              <span className="text-dark">Số lượng</span> <br />
              <select
                class="form-control mb-2"
                onChange={(e) => changeCountHandler(e.target.value)}
              >
                {numbers.map((item, index) => (
                  <option value={item} key={index}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </div>
              <form style={{ display: context }}  onSubmit={handleSubmit(submitHandler)}>
      {[...Array(Number(count))].map((_, index) => (
        <div className="card mr-3 mt-3" key={index}>
          <div className="form-row">
            <div className="form-group col-md-6">
              <label>Size áo</label>
              <select
                className="form-control"
                {...register(`size${index + 1}`, { required: true })}
              >
                <option value="">-- Chọn size --</option>
                {shirtSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors[`size${index + 1}`] && <p className="text-danger mt-2">Vui lòng chọn size áo</p>}
            </div>
            <div className="form-group col-md-6">
              <label>Giá</label>
              <input
                type="number"
                className="form-control"
                {...register(`price${index + 1}`, { required: true, min: 1 })}
              />
              {errors[`price${index + 1}`] && <p className="text-danger mt-2">Giá phải lớn hơn 0</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group col-10">
              <label>Số lượng</label>
              <input
                type="number"
                className="form-control"
                {...register(`quantity${index + 1}`, { required: true, min: 1 })}
              />
              {errors[`quantity${index + 1}`] && <p className="text-danger mt-2">Số lượng phải lớn hơn 0</p>}
            </div>
          </div>
        </div>
      ))}
    </form>
              
          </div>
          <button
            className="btn btn-primary btn-lg mt-5 mb-5"
            type="submit"
            style={{ marginLeft: 70, borderRadius: 50 }}
          >
            Thêm mới
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
