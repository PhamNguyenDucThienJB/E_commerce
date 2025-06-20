import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "../image/CardProfile.css";
import { getBrands } from "../../api/BrandApi";
import { getSale } from "../../api/SaleApi";
import { getCategory } from "../../api/CategoryApi";
import { getProductById, modifyProduct,deleteImage,getImagesByProductId  } from "../../api/ProductApi";
import { toast } from "react-toastify";
import { useHistory, useParams } from "react-router-dom";


const EditProduct = () => {
  const [brand, setBrand] = useState([]);
  const [sale, setSale] = useState([]);
  const [cate, setCate] = useState([]);
  const [item, setItem] = useState();
  const [attributes, setAttributes] = useState([]);
  const [flag, setFlag] = useState([]);
  const { id } = useParams();
  const history = useHistory();
  const [count, setCount] = useState(0);
  const [numbers, setNumbers] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const shirtSizes = ["S", "M", "L", "XL", "XXL", "XXXL"];
  const [image, setImage] = useState([]);
  const [productImages, setProductImages] = useState([]);

  const goBack =()=>{
    history.goBack();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  
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
  useEffect(() => {
    onLoad();
    getImagesByProductId(id)
    .then((res) => {
      setProductImages(res.data);
    })
    .catch((err) => console.error("Lỗi khi lấy ảnh:", err));
  }, []);

  const changeCountHandler = (value) => {
    setCount(value);
  };

  const onLoad = () => {
    getBrands(1, 20)
      .then((resp) => setBrand(resp.data.content))
      .catch((error) => console.log(error));

    getSale(1, 8)
      .then((resp) => setSale(resp.data.content))
      .catch((error) => console.log(error));

    getProductById(id)
      .then((res) => {
        setItem(res.data);
        setFlag(res.data.category);
        setAttributes(res.data.attributes);
        setCount(res.data.attributes.length);
        getCategory(1, 20)
          .then((resp) => setCate(resp.data.content))
          .catch((error) => console.log(error));

        reset(res.data);
      })
      .catch((error) => console.log(error));
  };

      const handleDeleteImage = async (imageId) => {
        if (window.confirm('Bạn có chắc muốn xóa ảnh này?')) {
          try {
            await deleteImage(imageId);
            toast.success('Xóa ảnh thành công');

            // Load lại sản phẩm để cập nhật danh sách ảnh mới
            const res = await getProductById(item.id);
            setItem(res.data); // Nhớ set lại item nếu bạn đang lưu item trong state

          } catch (error) {
            toast.error('Xóa ảnh thất bại');
          }
        }
      };

 const getImageUrl = (imageFileName) => {
  if (!imageFileName) return "/assets/placeholder-image.jpg";
  return `http://localhost:8080/uploads/${imageFileName}`;
};

    
    // Lấy danh sách hình ảnh hợp lệ từ dữ liệu sản phẩm
    const getValidImages = (product) => {
      if (!product || !product.images) return [];
      return product.images.filter(img => img && typeof img === 'string');
    };

  const submitHandler = (data) => {
  // Lấy danh sách size
  const sizes = Array.from({ length: count }, (_, i) => data[`size${i + 1}`]);

  // Kiểm tra size trùng
  const hasDuplicate = sizes.some((x, idx) => sizes.indexOf(x) !== idx);
  if (hasDuplicate) {
    toast.warning("Nhập trùng size. Vui lòng nhập lại!");
    return;
  }

  // Tạo danh sách attribute
  const attributes = Array.from({ length: count }, (_, i) => ({
    size: data[`size${i + 1}`],
    price: data[`price${i + 1}`],
    stock: data[`quantity${i + 1}`],
  }));

  const flag = {
    id: id,
    name: data.name,
    code: data.code,
    description: data.description,
    brandId: data.brandId,
    saleId: data.saleId,
    categoryId: data.category,
    attribute: attributes,
    imageUrl: image.map(file => file.name) 
    // Nếu có thêm imageUrl thì thêm vào đây
    // imageUrl: danh sách ảnh mới nếu có
  };
  console.log("Payload gửi lên BE:", flag);
  console.log("Danh sách ảnh mới:", image.map(file => file.name));
  modifyProduct(flag)
    .then(() => {
      toast.success("Cập nhật thành công!");
      history.push("/product");
    })
    .catch((error) => console.log(error.response.data));
};

  return (
    
    <div className="pb-3 container-fluid card">
       <button style={{ width: 60 }} onClick={() => goBack()}>
        <i
          className="fa fa-arrow-left"
          style={{ fontSize: 18 }}
          aria-hidden="true"
        ></i>
      </button>
      <div className="col-10 offset-1 text-center">
        <h1 className="text-danger">Sản phẩm</h1>
      </div>
      <div className="row card">
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
                <label className="form-label">Giới Tính</label>
                <select
                  className="form-control"
                  {...register("brandId", { required: true })}
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
                  {...register("saleId", { required: true })}
                >
                  {sale &&
                    sale.map((item, index) => (
                      <option value={item.id} key={index}>
                        {item.name} - {item.discount} %
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-12 mt-5 mb-5">
                <label className="form-label mb-3">Loại sản phẩm</label> <br />
                {cate &&
                  cate.map((i, index) => (
                    <div
                      className="col-2 form-check form-check-inline mr-5"
                      key={index}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        defaultValue={i.id}
                        defaultChecked={flag.includes(i.id)}
                        {...register("category", { required: true })}
                      />
                      <label className="form-check-label">{i.name}</label>
                    </div>
                  ))}
              </div>
        
                
          <label className="form-label mb-3">Hình ảnh sản phẩm cũ</label>
              <div className="row g-3">
                  <br /><br />
                <div className="col-12 d-flex flex-wrap">
                  {productImages.length > 0 ? (
                    productImages.map((img, idx) => (
                      <div key={img.id} className="position-relative m-2 shadow rounded" style={{ width: 120, height: 120 }}>
                     
                        <img
                          src={getImageUrl(img.imageLink)}
                          alt={`Hình ${idx + 1}`}
                          className="img-thumbnail border-0 rounded"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "12px",
                          }}
                        />
                        {/* Label */}
                        <span className={`badge position-absolute ${idx === 0 ? "bg-danger" : "bg-secondary"}`} style={{ top: 5, left: 5, fontSize: "0.75rem", borderRadius: "8px" }}>
                          {idx === 0 ? "Main" : "Other"}
                        </span>
                        {/* Nút xóa */}
                        <button
                          type="button"
                          className="btn btn-sm btn-light border position-absolute shadow-sm"
                          style={{ top: -15, right: -10, zIndex: 2, width: 24, height: 24, padding: 0, borderRadius: "50%" }}
                          onClick={() => handleDeleteImage(img.id)}
                        >
                          <i className="fas fa-times text-danger" style={{ fontSize: 12 }}></i>
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">Chưa có hình ảnh sản phẩm</p>
                  )}
                </div>

                {/* Ngắt dòng giữa ảnh cũ và ảnh mới */}
                <br /><br />

                {/* Ảnh sản phẩm mới */}
                <label className="form-label mb-3">Hình ảnh sản phẩm mới</label>
                <div className="col-12 d-flex flex-wrap">
                  {image.length > 0 && (
                    image.map((file, idx) => (
                      <div key={`new-${idx}`} className="position-relative m-2 shadow rounded" style={{ width: 120, height: 120 }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Ảnh mới ${idx + 1}`}
                          className="img-thumbnail border-0 rounded"
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }}
                        />
                      <span className={`badge position-absolute ${idx === 0 ? "bg-danger" : "bg-secondary"}`} style={{ top: 5, left: 5, fontSize: "0.75rem", borderRadius: "8px" }}>
                        {idx === 0 ? "Main" : "Other"}
                      </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-light border position-absolute shadow-sm"
                          style={{ top: -15, right: -10, zIndex: 2, width: 24, height: 24, padding: 0, borderRadius: "50%" }}
                          onClick={() => {
                            const updated = [...image];
                            updated.splice(idx, 1);
                            setImage(updated);
                          }}
                        >
                          <i className="fas fa-times text-danger" style={{ fontSize: 12 }}></i>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <br />

                {/* Nút upload ảnh */}
                <label
                  htmlFor="photo-upload"
                  className="d-flex justify-content-center align-items-center border rounded mt-3"
                   style={{
                  height: 150,
                  width: 150,
                  cursor: "pointer",
                  backgroundColor: "#f8f9fa",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}

               
                >
                  <i className="fas fa-upload fa-2x text-secondary"></i>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  multiple
                  accept=".jpg,.png"
                  hidden
                  onChange={onFileChange}
                />
              </div>

            </div>
          </div>
          <div className="col-10 row">
            <div className="card mr-5 col-10">
              <h4 className="d-flex justify-content-between align-items-center mb-1">
                <span className="text-dark">Chi tiết sản phẩm</span> <br />
              </h4>
              <span className="text-dark">Số lượng</span>{" "}
              <select
                class="form-control mb-2"
                onChange={(e) => changeCountHandler(e.target.value)}
                value={count}
              >
                {numbers.map((item, index) => (
                  <option value={item} key={index} disabled={item < attributes.length} hidden={item < attributes.length}>
                    {index + 1}
                  </option>
                ))}
              </select>
              <br />
            </div>
                    {[...Array(Number(count))].map((_, index) => (
              <div className="card mr-3 mt-3" key={index}>
                <div className="form-row">
                  {/* Size áo */}
                  <div className="form-group col-md-6">
                    <label>Size</label>
                    <select
                      className="form-control"
                      defaultValue={item.attributes[index]?.size || ""}
                      {...register(`size${index + 1}`, { required: true })}
                    >
                      <option value="">-- Chọn size áo --</option>
                      {shirtSizes.map((size, i) => (
                        <option key={i} value={size}>{size}</option>
                      ))}
                    </select>
                    {errors[`size${index + 1}`] && (
                      <p className="text-danger mt-2">Vui lòng chọn size áo</p>
                    )}
                  </div>

                  {/* Giá */}
                  <div className="form-group col-md-6">
                    <label>Giá</label>
                    <input
                      type="number"
                      className="form-control"
                      defaultValue={item.attributes[index]?.price || ""}
                      {...register(`price${index + 1}`, { required: true, min: 1 })}
                    />
                    {errors[`price${index + 1}`] && (
                      <p className="text-danger mt-2">Giá phải lớn hơn 0</p>
                    )}
                  </div>
                </div>

                {/* Số lượng */}
                <div className="form-row">
                  <div className="form-group col-10">
                    <label>Số lượng</label>
                    <input
                      type="number"
                      className="form-control"
                      defaultValue={item.attributes[index]?.stock || ""}
                      {...register(`quantity${index + 1}`, { required: true, min: 1 })}
                    />
                    {errors[`quantity${index + 1}`] && (
                      <p className="text-danger mt-2">Số lượng phải lớn hơn 0</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

           
          </div>
          <button
            className="btn btn-primary btn-lg mt-5 mb-5"
            type="submit"
            style={{ marginLeft: 70, borderRadius: 50 }}
          >
            Cập nhật
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
