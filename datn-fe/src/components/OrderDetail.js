import React, { useState, useEffect } from "react";
import { getOrderById, getOrderDetailByOrderId } from "../api/OrderApi";
import { useLocation } from "react-router-dom";
import { Button, Modal, Form } from "react-bootstrap";
import { createRating, canUserRateProduct } from "../api/RatingApi";
import { toast } from "react-toastify";
import { FaStar, FaRegStar } from "react-icons/fa";
import { getProductById } from "../api/ProductApi";
import { getAttributeById } from "../api/AttributeApi";

// Khởi tạo mapping từ localStorage hoặc dùng mapping mặc định
const getAttributeProductMapping = () => {
  // Mapping mặc định là quan trọng nhất
  const defaultMapping = {
    4: 3,   // AttributeID 4 -> ProductID 3 ("Doodle Rain of Thoughts" Tee)
    21: 5,  // AttributeID 21 -> ProductID 5 ("Pet All The Dogs" Tee)
    22: 3,  // AttributeID 22 -> ProductID 3 ("Doodle Rain of Thoughts" Tee)
    31: 10, // AttributeID 31 -> ProductID 10 (Doodle Dino Squad T-Shirt)
  };
  
  // Clear localStorage nếu cần - uncomment dòng này để reset mapping
  // localStorage.removeItem('attributeProductMapping');
  
  // Lấy mapping từ localStorage nếu có
  const savedMapping = localStorage.getItem('attributeProductMapping');
  if (savedMapping) {
    try {
      const parsedMapping = JSON.parse(savedMapping);
      // Kết hợp mapping từ localStorage với defaultMapping, ưu tiên defaultMapping
      const combinedMapping = { ...parsedMapping, ...defaultMapping };
      console.log('Mapping được sử dụng:', combinedMapping);
      return combinedMapping;
    } catch (e) {
      console.error('Lỗi khi đọc mapping từ localStorage:', e);
    }
  }
  
  console.log('Sử dụng mapping mặc định:', defaultMapping);
  return defaultMapping;
};

// Hàm thêm mapping mới và lưu vào localStorage
const addToMapping = (attributeId, productId) => {
  if (!attributeId || !productId) return;
  
  const currentMapping = getAttributeProductMapping();
  currentMapping[attributeId] = productId;
  
  try {
    localStorage.setItem('attributeProductMapping', JSON.stringify(currentMapping));
    console.log(`Đã cập nhật mapping:`, currentMapping);
  } catch (e) {
    console.error('Lỗi khi lưu mapping vào localStorage:', e);
  }
  
  return currentMapping;
};

const OrderDetail = (props) => {
  const [orderDetail, setOrderDetail] = useState([]);
  const [order, setOrder] = useState({});
  const [amount, setAmount] = useState();
  const [sale, setSale] = useState();
  const [total, setTotal] = useState();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [productNames, setProductNames] = useState({});  // Store product names by attribute ID
  const [attributeMapping, setAttributeMapping] = useState(getAttributeProductMapping());
  const location = useLocation();

  // Lấy orderId từ URL và xử lý an toàn để tránh lỗi khi có query params
  const getOrderIdFromUrl = () => {
    const fullPath = window.location.href;
    const lastSlashPos = fullPath.lastIndexOf("/");
    if (lastSlashPos === -1) return null;

    let encodedId = fullPath.substring(lastSlashPos + 1);
    // Nếu có query params (dấu ?), cắt bỏ phần sau dấu ?
    const questionMarkPos = encodedId.indexOf("?");
    if (questionMarkPos !== -1) {
      encodedId = encodedId.substring(0, questionMarkPos);
    }

    try {
      return atob(encodedId);
    } catch (e) {
      console.error("Error decoding orderId:", e);
      return null;
    }
  };

  const orderId = getOrderIdFromUrl();

  useEffect(() => {
    if (orderId) {
      onLoad();

      // Kiểm tra nếu có tham số rate=true từ trang Order
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get("rate") === "true") {
        // Hiển thị modal đánh giá sau khi tải dữ liệu đơn hàng
        setTimeout(() => {
          if (orderDetail.length > 0) {
            handleShowRatingModal(orderDetail[0]);
          }
        }, 1000);
      }
    } else {
      toast.error("Không tìm thấy thông tin đơn hàng");
    }
  }, [location]);

  // Hàm tiện ích để lấy tên sản phẩm từ attributeId
  const getProductNameFromAttributeId = (attributeId) => {
    if (!attributeId) return 'N/A';
    return productNames[attributeId] || 'N/A';
  };

  // Hàm tiện ích để kiểm tra xem đơn hàng đã giao hay chưa
  const isDelivered = (orderStatus) => {
    // Kiểm tra xem đơn hàng đã giao hay chưa
    if (!orderStatus) return false;
    return orderStatus.name === "Đã giao";
  };

  const onLoad = async () => {
    try {
      const orderResp = await getOrderById(orderId);
      setOrder(orderResp.data);
      setSale(orderResp.data.voucher ? orderResp.data.voucher.discount : 0);
      setTotal(orderResp.data.total);

      const orderDetailResp = await getOrderDetailByOrderId(orderId);
      console.log("Chi tiết đơn hàng được tải:", orderDetailResp.data);

      // Log chi tiết về cấu trúc dữ liệu để debug
      if (orderDetailResp.data && orderDetailResp.data.length > 0) {
        console.log("Cấu trúc chi tiết đơn hàng đầu tiên:", JSON.stringify(orderDetailResp.data[0], null, 2));
        console.log("Attribute:", orderDetailResp.data[0]?.attribute);
        console.log("Tên sản phẩm từ attribute.name:", orderDetailResp.data[0]?.attribute?.name);
      }

      // Tải trước thông tin sản phẩm
      const names = {};
      const productInfos = {}; // Lưu trữ thông tin sản phẩm theo attribute ID
      let updatedMapping = {...attributeMapping}; // Tạo bản sao của mapping hiện tại

      // Với mỗi item trong đơn hàng, lấy thêm thông tin sản phẩm
      if (orderDetailResp.data && orderDetailResp.data.length > 0) {
        for (const item of orderDetailResp.data) {
          if (item.attribute && item.attribute.id) {
            const attributeId = item.attribute.id;
            
            // Lấy thông tin của sản phẩm dựa trên attribute
            try {
              // Lấy product_id từ nhiều nguồn
              let productId = null;
              
              // 1. Trước tiên, kiểm tra trong mapping đã biết
              if (updatedMapping[attributeId]) {
                productId = updatedMapping[attributeId];
                console.log(`Lấy product_id=${productId} từ mapping cho attributeId=${attributeId}`);
              } 
              // 2. Nếu không có trong mapping, gọi API để lấy thông tin attribute
              else {
                try {
                  const attributeResp = await getAttributeById(attributeId);
                  console.log(`Dữ liệu attribute từ API:`, attributeResp.data);
                  
                  // Kiểm tra nếu API trả về product object
                  if (attributeResp.data && attributeResp.data.product && attributeResp.data.product.id) {
                    productId = attributeResp.data.product.id;
                    // Cập nhật mapping và lưu vào localStorage
                    updatedMapping = addToMapping(attributeId, productId);
                    console.log(`Đã thêm mapping mới: attributeId ${attributeId} -> productId ${productId}`);
                  }
                } catch (error) {
                  console.error(`Lỗi khi lấy thông tin attribute ${attributeId}:`, error);
                }
              }
              
              // Lưu thông tin product_id vào productInfos
              if (productId) {
                productInfos[attributeId] = { productId };
                // Gọi API để lấy thêm thông tin sản phẩm
                try {
                  const productResp = await getProductById(productId);
                  if (productResp.data) {
                    productInfos[attributeId] = {
                      ...productInfos[attributeId],
                      name: productResp.data.name,
                      productDetails: productResp.data
                    };
                    names[attributeId] = productResp.data.name;
                    console.log(`Đã tải thông tin sản phẩm ${productResp.data.name} (ID=${productId}) cho attribute ${attributeId}`);
                  }
                } catch (error) {
                  console.error(`Lỗi khi tải thông tin sản phẩm ID=${productId}:`, error);
                }
              }

              // Fallback: Lấy tên trực tiếp từ attribute.name
              if (!names[attributeId] && item.attribute.name) {
                console.log(`Tên sản phẩm từ attribute.name [ID=${attributeId}]:`, item.attribute.name);
                names[attributeId] = item.attribute.name;
              }
            } catch (error) {
              console.error(`Lỗi khi lấy thông tin sản phẩm cho attribute ID ${attributeId}:`, error);
              // Tạo tên backup dựa trên ID
              names[attributeId] = `Sản phẩm #${attributeId}`;
            }
          }
        }
      }

      // Cập nhật state với mapping mới
      setAttributeMapping(updatedMapping);
      
      // Cập nhật state với tên sản phẩm và thông tin đã tải
      setProductNames(names);
      
      // Thêm thông tin sản phẩm vào mỗi item của orderDetail
      const enrichedOrderDetail = orderDetailResp.data.map(item => {
        if (item.attribute && item.attribute.id && productInfos[item.attribute.id]) {
          return {
            ...item,
            productInfo: productInfos[item.attribute.id]
          };
        }
        return item;
      });

      // Cập nhật orderDetail và tính toán số tiền
      setOrderDetail(enrichedOrderDetail);
      const result = orderDetailResp.data.reduce(
        (price, item) => price + item.sellPrice * item.quantity,
        0
      );
      setAmount(result);

    } catch (error) {
      console.error("Lỗi khi tải thông tin đơn hàng:", error);
      toast.error("Lỗi khi tải thông tin đơn hàng");
    }
  };

  const getProductDetails = async (item) => {
    if (!item) {
      console.error("Không có thông tin sản phẩm được truyền vào");
      return null;
    }

    console.log("Chi tiết sản phẩm được truyền vào:", item);

    try {
      // Trích xuất attribute từ item
      if (!item.attribute || !item.attribute.id) {
        console.error("Không tìm thấy attribute.id trong item");
        return null;
      }

      const attributeId = item.attribute.id;
      console.log("Attribute ID:", attributeId);

      // Kiểm tra nếu đã có thông tin sản phẩm từ quá trình tải dữ liệu
      if (item.productInfo && item.productInfo.productId) {
        console.log(`Sử dụng thông tin sản phẩm đã tải cho attributeId ${attributeId} -> productId ${item.productInfo.productId}`);
        return {
          id: item.productInfo.productId,
          productId: item.productInfo.productId,
          name: item.productInfo.name || item.attribute.name || "Sản phẩm",
          size: item.attribute.size || "N/A",
          attributeId: attributeId
        };
      }

      // Lấy product ID từ mapping hoặc API
      let productId = null;
      let updatedMapping = {...attributeMapping};
      
      // Ưu tiên lấy từ mapping
      if (updatedMapping[attributeId]) {
        productId = updatedMapping[attributeId];
        console.log(`Lấy product_id=${productId} từ mapping cho attributeId=${attributeId}`);
      } 
      // Nếu không có trong mapping, gọi API để lấy thông tin attribute
      else {
        console.warn("Không thể xác định product ID từ mapping cho attribute ID:", attributeId);
        try {
          const attributeResp = await getAttributeById(attributeId);
          console.log(`Dữ liệu attribute từ API:`, attributeResp.data);
          
          // Kiểm tra nếu API trả về product object
          if (attributeResp.data && attributeResp.data.product && attributeResp.data.product.id) {
            productId = attributeResp.data.product.id;
            // Cập nhật mapping và lưu vào localStorage
            updatedMapping = addToMapping(attributeId, productId);
            setAttributeMapping(updatedMapping);
            console.log(`Đã thêm mapping mới: attributeId ${attributeId} -> productId ${productId}`);
          }
        } catch (error) {
          console.error(`Lỗi khi lấy thông tin attribute ${attributeId}:`, error);
        }
      }

      if (!productId) {
        console.error(`Không thể xác định product ID cho attribute ID ${attributeId}`);
        return null;
      }

      // Nếu có product ID, lấy thêm thông tin sản phẩm từ API
      try {
        const productResp = await getProductById(productId);
        if (productResp.data) {
          console.log(`Đã tải thông tin sản phẩm từ API: ${productResp.data.name} (ID=${productId})`);
          return {
            id: productId,
            productId: productId,
            name: productResp.data.name || item.attribute.name || "Sản phẩm",
            size: item.attribute.size || "N/A",
            attributeId: attributeId
          };
        }
      } catch (error) {
        console.error(`Lỗi khi tải thông tin sản phẩm ID=${productId}:`, error);
      }

      // Fallback nếu không lấy được thông tin từ API
      return {
        id: productId,
        productId: productId,
        name: item.attribute.name || productNames[attributeId] || "Sản phẩm",
        size: item.attribute.size || "N/A",
        attributeId: attributeId
      };
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      return null;
    }
  };

  const handleShowRatingModal = async (item) => {
    console.log("User:", props.user);
    console.log("Product item:", item);
    console.log("Order status:", order.orderStatus?.name);
    console.log("OrderId:", orderId);

    // Kiểm tra user từ props hoặc localStorage
    const currentUser = props.user || JSON.parse(localStorage.getItem("user"));

    if (!currentUser) {
      toast.warning("Vui lòng đăng nhập để đánh giá sản phẩm");
      return;
    }

    // Hiển thị loading để người dùng biết đang xử lý
    toast.info("Đang tải thông tin sản phẩm...", {autoClose: 2000});

    try {
      // Log thông tin chi tiết từ item để debug
      if (item && item.attribute) {
        console.log("attribute.id:", item.attribute.id);

        if (item.attribute.product) {
          console.log("attribute.product.id:", item.attribute.product.id);
        }
      }
    } catch (error) {
      console.error("Lỗi khi log thông tin sản phẩm:", error);
    }

    // Lấy thông tin sản phẩm từ API thay vì dựa vào dữ liệu hiện tại
    const productDetails = await getProductDetails(item);

    if (!productDetails) {
      toast.error("Không thể tìm thấy thông tin sản phẩm để đánh giá");
      return;
    }

    console.log("Thông tin sản phẩm từ API:", productDetails);

    // Sử dụng thông tin sản phẩm từ API
    setSelectedProduct({
      id: productDetails.productId, // Sử dụng product ID
      productId: productDetails.productId,
      name: productDetails.name,
      size: productDetails.size,
      attribute: {
        id: productDetails.attributeId,
        name: productDetails.name,
        product: {
          id: productDetails.productId, // Sử dụng product ID
          name: productDetails.name
        },
        size: productDetails.size
      }
    });
    setRating(5);
    setComment("");
    setShowRatingModal(true);
  };

  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
    setSelectedProduct(null);
  };

  const handleRatingChange = (value) => {
    setRating(value);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error("Không có sản phẩm được chọn để đánh giá");
      return;
    }

    // Đảm bảo có user hiện tại
    const currentUser = props.user || JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      toast.warning("Vui lòng đăng nhập để đánh giá sản phẩm");
      return;
    }

    try {
      // Hiển thị loading spinner
      toast.info("Đang gửi đánh giá...", {autoClose: 2000});

      let productId = selectedProduct.productId || selectedProduct.id;

      console.log("Selected product:", selectedProduct);
      console.log("Using productId:", productId);
      console.log("Order ID:", orderId);

      if (!productId) {
        toast.error("Không thể xác định ID sản phẩm cho đánh giá");
        return;
      }

      // Tạo đối tượng đánh giá phù hợp với yêu cầu của backend
      const ratingData = {
        // Đảm bảo productId là một số
        productId: Number(productId),
        // Đảm bảo orderId là số
        orderId: Number(orderId),
        rating: rating,
        content: comment || "" // Đảm bảo comment không null
      };

      // Log chi tiết dữ liệu gửi đi để debug
      console.log("Đang gửi đánh giá:", JSON.stringify(ratingData, null, 2));
      console.log("Kiểu dữ liệu - productId:", typeof ratingData.productId, "- orderId:", typeof ratingData.orderId);

      // Gửi đánh giá
      const response = await createRating(ratingData);
      console.log("Đánh giá thành công:", response);
      toast.success("Đánh giá sản phẩm thành công!");
      handleCloseRatingModal();
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      console.error("Chi tiết response:", error.response?.data);

      // Hiển thị thông báo lỗi cụ thể nếu có
      if (error.response && error.response.data) {
        // Lấy thông báo lỗi từ backend, có thể là message hoặc Errors
        const backendError = error.response.data.message || error.response.data.Errors;
        const errorMessage = Array.isArray(backendError) ? backendError.join(", ") : backendError;
        toast.error(`Lỗi: ${errorMessage}`);
      } else {
        toast.error("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.");
      }
    }
  };

  const renderStars = (currentRating, onChange) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (onChange) {
        // Interactive stars for input
        stars.push(
          <span
            key={i}
            onClick={() => onChange(i)}
            style={{ cursor: "pointer", marginRight: "5px" }}
          >
            {i <= currentRating ?
              <FaStar className="text-warning" size={24} /> :
              <FaRegStar className="text-warning" size={24} />
            }
          </span>
        );
      } else {
        // Display-only stars
        stars.push(
          <span key={i} style={{ marginRight: "5px" }}>
            {i <= currentRating ?
              <FaStar className="text-warning" /> :
              <FaRegStar className="text-warning" />
            }
          </span>
        );
      }
    }
    return stars;
  };

  return (
    <div className="container-fluid row padding mb-5">
      <div className="col-10 offset-1 text ">
        <p className="display-4 text-primary" style={{ fontSize: "34px", fontWeight: "bolder" }}>
          Đơn hàng #{order?.id || ""}
        </p>
      </div>
      <div className="col-8 welcome mb-5 mt-5">
        <div className="col-10 offset-1 mb-5">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th scope="col">Mã sản phẩm</th>
                <th scope="col">Tên sản phẩm</th>
                <th scope="col">Size</th>
                <th scope="col">Giá</th>
                <th scope="col">Số lượng</th>
                <th scope="col">Tổng</th>
                {order?.orderStatus && isDelivered(order.orderStatus) && (
                  <th scope="col">Đánh giá</th>
                )}
              </tr>
            </thead>
            <tbody>
              {orderDetail && orderDetail.map((item, index) => {
                // Xác định product ID
                let productId = null;
                const attributeId = item?.attribute?.id;
                
                if (attributeId) {
                  if (item.productInfo && item.productInfo.productId) {
                    productId = item.productInfo.productId;
                  } else if (attributeMapping[attributeId]) {
                    productId = attributeMapping[attributeId];
                  }
                }
                
                return (
                  <tr key={index}>
                    <th scope="row">{productId || 'N/A'}</th>
                    <td>{item?.attribute?.name || productNames[item?.attribute?.id] || item?.attribute?.product?.name || 'N/A'}</td>
                    <td>{item?.attribute?.size || 'N/A'}</td>
                    <td>{item?.sellPrice?.toLocaleString?.() || 0}₫</td>
                    <td>{item?.quantity || 0}</td>
                    <td>
                      {((item?.sellPrice || 0) * (item?.quantity || 0)).toLocaleString()}₫
                    </td>
                    {order?.orderStatus && isDelivered(order.orderStatus) && (
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleShowRatingModal(item)}
                        >
                          <i className="fa fa-star text-warning" aria-hidden="true"></i> Đánh giá
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="row mb-5">
            <div className="col offset-8 text ">
              <p>Tạm tính: {amount && amount.toLocaleString()} đ</p>
              <p>
                Giảm giá: -{" "}
                {sale ? ((amount * sale) / 100).toLocaleString() : 0} đ
              </p>
              <p className="text-danger">
                Tổng cộng: {total && total.toLocaleString()} đ
              </p>
            </div>
          </div>
          <div className="row mb-5">
            <div className="col text ">
              <p
                className="display-4 text-primary"
                style={{ fontSize: "24px" }}
              >
                Trạng thái thanh toán
              </p>
              <p className="text-danger" style={{ fontWeight: "bolder" }}>
                {order && order.isPending ? "Đã thanh toán" : "Chưa thanh toán"}
              </p>
            </div>
            <div className="col text ">
              <p
                className="display-4 text-primary"
                style={{ fontSize: "24px" }}
              >
                Trạng thái đơn hàng
              </p>
              <p className="text-danger" style={{ fontWeight: "bolder" }}>
                {order?.orderStatus?.name || "N/A"}
              </p>
            </div>

          </div>
          <div className="row">
             <div className="col text ">
              <p
                className="display-4 text-primary"
                style={{ fontSize: "24px" }}
              >
                Phương thức giao hàng
              </p>
              <p className="text-danger" style={{ fontWeight: "bolder" }}>
                {order && order.payment}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="col-4 mb-5 mt-5">
        <div className="col-10 offset-1 text ">
          <p className="display-4 text-danger" style={{ fontSize: "24px" }}>
            Thông tin mua hàng
          </p>
          <p>Ngày tạo: {order?.createDate || "N/A"}</p>
          <p>Người nhận: {order?.fullname || "N/A"}</p>
          <p>Email: {order?.email || "N/A"}</p>
        </div>
        <div className="col-10 offset-1 text ">
          <p className="display-4 text-danger" style={{ fontSize: "24px" }}>
            Địa chỉ nhận hàng
          </p>
          <p>SDT: {order?.phone || "N/A"}</p>
          <p>DC: {order?.address || "N/A"}</p>
        </div>
      </div>

      {/* Modal đánh giá sản phẩm */}
      <Modal show={showRatingModal} onHide={handleCloseRatingModal}>
        <Modal.Header closeButton>
          <Modal.Title>Đánh giá sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <Form onSubmit={handleSubmitRating}>
              <div className="mb-3">
                <strong>Sản phẩm:</strong> {selectedProduct.name || "Sản phẩm"}
                <div>(Mã SP: {selectedProduct.productId || selectedProduct.id || "N/A"})</div>
                <div>Size: {selectedProduct.size || "N/A"}</div>
              </div>
              <div className="mb-3">
                <strong>Đánh giá của bạn:</strong>
                <div className="mt-2">
                  {renderStars(rating, handleRatingChange)}
                </div>
              </div>
              <Form.Group className="mb-3">
                <Form.Label style={{ color: "#000" }}>Nhận xét (tùy chọn)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  style={{
                    border: "2px solid #000",
                    color: "#000",
                    backgroundColor: "#fff"
                  }}
                  className="custom-textarea"
                />
              </Form.Group>
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={handleCloseRatingModal}>
                  Hủy bỏ
                </Button>
                <Button variant="primary" type="submit">
                  Gửi đánh giá
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default OrderDetail;
