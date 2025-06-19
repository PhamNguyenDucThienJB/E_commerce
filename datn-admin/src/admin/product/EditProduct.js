import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import "../image/CardProfile.css";
import { getBrands } from "../../api/BrandApi";
import { getSale } from "../../api/SaleApi";
import { getCategory } from "../../api/CategoryApi";
import { getProductById, modifyProduct } from "../../api/ProductApi";
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


  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    onLoad();
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
  const submitHandler = (data) => {
    const nums = [
      data.size1,
      data.size2,
      data.size3,
      data.size4,
      data.size5,
      data.size6,
      data.size7,
      data.size8,
      data.size9,
      data.size10,
    ];
    const newNums = nums.slice(0, count);
    const hasDuplicate = newNums.some(x => newNums.indexOf(x) !== newNums.lastIndexOf(x));
    if(hasDuplicate){
      toast.warning("Nhập trùng size. Vui lòng nhập lại!");
    }else{
      const flag = {
        id: id,
        name: data.name,
        code: data.code,
        description: data.description,
        brandId: data.brandId,
        saleId: data.saleId,
        categoryId: data.category,
        attribute: [
          {
            size: data.size1,
            price: data.price1,
            stock: data.quantity1,
          },
          {
            size: data.size2,
            price: data.price2,
            stock: data.quantity2,
          },
          {
            size: data.size3,
            price: data.price3,
            stock: data.quantity3,
          },
          {
            size: data.size4,
            price: data.price4,
            stock: data.quantity4,
          },
          {
            size: data.size5,
            price: data.price5,
            stock: data.quantity5,
          },
          {
            size: data.size6,
            price: data.price6,
            stock: data.quantity6,
          },
          {
            size: data.size7,
            price: data.price7,
            stock: data.quantity7,
          },
          {
            size: data.size8,
            price: data.price8,
            stock: data.quantity8,
          },
          {
            size: data.size9,
            price: data.price9,
            stock: data.quantity9,
          },
          {
            size: data.size10,
            price: data.price10,
            stock: data.quantity10,
          }
        ].slice(0, count),
      };
      modifyProduct(flag)
        .then(() => {
          toast.success("Cập nhật thành công!");
          history.push("/product");
        })
        .catch((error) => console.log(error.response.data));
    }
    
  };
  return (
    <div className="pb-3 container-fluid card">
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
