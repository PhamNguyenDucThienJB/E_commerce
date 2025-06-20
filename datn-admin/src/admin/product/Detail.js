import { React, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { getProductById } from "../../api/ProductApi";
import { useParams } from "react-router-dom";
import { getAttribute } from "../../api/AttributeApi";

const Detail = () => {
    const { id } = useParams();
    const [item, setItem] = useState();
    const [attributes, setAttributes] = useState();
    const [price, setPrice] = useState();
    const [stock, setStock] = useState();
    const [flag, setFlag] = useState();
    const history = useHistory();

   
    useEffect(() => {
      onLoad();
    }, [id]);
  
    const onLoad = () => {
      getProductById(id)
        .then((res) => {
          console.log("Product data:", res.data);
          setItem(res.data);
          setAttributes(res.data.attributes);
        })
        .catch((error) => console.log(error));

      getAttribute(id, 39)
        .then((res) => {
          onModify(res.data.price, res.data.stock, res.data.id);
        })
        .catch((error) => console.log(error));
    };
  
    const onModify = (price, stock, flag) => {
      setPrice(price);
      setStock(stock);
      setFlag(flag);
    };

    const goBack = () => {
        history.goBack();
      };

    // Hàm để xử lý mô tả sản phẩm với ảnh
    const renderDescription = (description) => {
      if (!description) return { __html: "" };
      
      // Xử lý mô tả có thẻ [image:filename]
      const imgRegex = /\[image:(.*?)\]/g;
      let processedDesc = description.replace(imgRegex, (match, fileName) => {
        if (!fileName) return match; // Nếu không có tên file, giữ nguyên text
        return `<img src="http://localhost:8080/uploads/${fileName}" alt="Product description" class="img-fluid mb-3" style="max-width: 100%" />`;
      });
      
      // Xử lý xuống dòng thành <br>
      processedDesc = processedDesc.replace(/\n/g, '<br>');
      
      return { __html: processedDesc };
    };

    // Kiểm tra nếu đường dẫn hình ảnh hợp lệ
    const getImageUrl = (imageName) => {
      if (!imageName) return "/assets/placeholder-image.jpg"; // Đường dẫn đến ảnh mặc định
      return `http://localhost:8080/uploads/${imageName}`;
    };
    
    // Lấy danh sách hình ảnh hợp lệ từ dữ liệu sản phẩm
    const getValidImages = (product) => {
      if (!product || !product.images) return [];
      return product.images.filter(img => img && typeof img === 'string');
    };
    
    return (
      <div>
        
        {item && (
          <div className="col-12 mt-5">
            <div>
              <div className="card mb-3 border-0">
              <button style={{ width: 60 }} onClick={() => goBack()}>
          <i
            className="fa fa-arrow-left"
            style={{ fontSize: 18 }}
            aria-hidden="true"
          ></i>
        </button>
                <div className="row g-0">
                
                  <div className="col-md-4">
                    <img
                      src={getImageUrl(item.main)}
                      className="img-fluid rounded-start"
                      style={{ width: "600px", height: "400px", objectFit: "contain" }}
                      alt={item.name || "Hình ảnh sản phẩm"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/placeholder-image.jpg"; // Ảnh thay thế khi lỗi
                      }}
                    />
                  </div>
                  <div className="col-md-8">
                    <div className="card-body">
                      <h1 className="card-title text-danger fw-bolder">
                        {item.name}
                      </h1>
                      <hr />
                      <p className="card-text fw-bold fs-5">Mã SP: {item.code}</p>
                      <hr />
                      <h4 className="card-text fw-bolder text-danger fs-5">
                        Giá bán:{" "}
                        {price &&
                          (
                            (price * (100 - item.discount)) /
                            100
                          ).toLocaleString() + " đ"}
                      </h4>
                      <h6 className="card-text fw-bolder fs-5">
                        Giá gốc:{" "}
                        <del>{price && price.toLocaleString() + " đ"}</del>
                      </h6>
                      <h6 className="card-text fw-bolder fs-5" hidden>
                        Sản phẩm còn: {stock && stock + " đôi"}
                      </h6>
                      <hr />
                      <div className="div">
                        <label className="mr-5">Chọn size</label>
                        {attributes && attributes.map((i, index) => (
                          <div
                            className="form-check form-check-inline"
                            key={index}
                          >
                            <input
                              className="form-check-input"
                              type="radio"
                              name="inlineRadioOptions"
                              id={`size-${i.id}`}
                              defaultValue="option3"
                              onChange={() => onModify(i.price, i.stock, i.id)}
                              disabled={i.stock === 0}
                              checked={flag == i.id}
                            />
                            <label className="form-check-label">{i.size}</label>
                          </div>
                        ))}
                      </div>                    
                      <hr />                     
                    </div>
                  </div>
                  {getValidImages(item).length > 0 && (
                    <div className="container row offset-3 mt-5">
                      {getValidImages(item).map((imgName, idx) => (
                        <img
                          key={idx}
                          src={getImageUrl(imgName)}
                          alt={`${item.name} - Hình ${idx + 1}`}
                          className="img-thumbnail mr-3"
                          style={{ width: "200px", height: "200px", objectFit: "contain" }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/assets/placeholder-image.jpg"; // Ảnh thay thế khi lỗi
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-8 offset-2">
                <div className="container-fluid padding">
                  <div className="row welcome text-center text-dark mb-2 mt-5">
                    <div className="col-12">
                      <p className="display-4" style={{ fontSize: "34px" }}>
                        Mô tả sản phẩm
                      </p>
                    </div>
                  </div>
                </div>
                <div className="container-fluid padding">
                  {/* Hiển thị mô tả sản phẩm với hỗ trợ HTML */}
                  <div className="description-container">
                    {/* Hiển thị nội dung mô tả có thể chứa HTML */}
                    <div className="font-italic" dangerouslySetInnerHTML={renderDescription(item.description)} />
                    
                    {/* Phần hiển thị ảnh trong mô tả */}
                    {getValidImages(item).length > 0 && (
                      <div className="description-images mt-4">
                        <h5 className="mb-3">Hình ảnh sản phẩm</h5>
                        <div className="row">
                          {getValidImages(item).map((imgName, idx) => (
                            <div className="col-md-3 col-6 mb-3" key={idx}>
                              <img
                                src={getImageUrl(imgName)}
                                alt={`Mô tả ${item.name} - ${idx + 1}`}
                                className="img-fluid rounded"
                                style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/assets/placeholder-image.jpg"; // Ảnh thay thế khi lỗi
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>          
          </div>
        )}
      </div>
    );
}

export default Detail