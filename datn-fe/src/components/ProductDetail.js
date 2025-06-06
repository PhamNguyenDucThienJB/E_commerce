import { React, useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";
import { getProductById, relateProduct } from "../api/ProductApi";
import { useParams } from "react-router-dom";
import { modifyCartItem } from "../api/CartApi";
import { toast } from "react-toastify";
import { getAttribute, getAttributeById } from "../api/AttributeApi";
import { isEnoughCartItem } from "../api/CartApi";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Table from "react-bootstrap/Table";
import { getCartItemByAccountId } from "../api/CartApi";

const ProductDetail = (props) => {
  const { id } = useParams();
  const history = useHistory();
  const [item, setItem] = useState();
  const [attributes, setAttributes] = useState([]);
  const [price, setPrice] = useState();
  const [stock, setStock] = useState();
  const [flag, setFlag] = useState();
  const [count, setCount] = useState(1);
  const [status, setStatus] = useState(true);
  const [relate, setRelate] = useState([]);
  const [show, setShow] = useState(false);
  const [temp, setTemp] = useState();
  const [cart, setCart] = useState();
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [displayImage, setDisplayImage] = useState(null);
  // swatches: list of {imgName, color}
  const [swatches, setSwatches] = useState([]);
  // Static color options for products
  const colors = [
    { name: 'white', hex: '#ffffff' },
    { name: 'black', hex: '#000000' },
    { name: 'red', hex: '#e74c3c' },
    { name: 'blue', hex: '#3a5a9f' },
  ];
  // For related products carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const productsPerSlide = 4;
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const handleClose = () => setShow(false);
  const handleSizeGuideClose = () => setShowSizeGuide(false);
  const handleSizeGuideShow = () => setShowSizeGuide(true);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Reset carousel when related products change
  useEffect(() => {
    setCurrentSlide(0);
  }, [relate]);

  const handleShow = (value) => {
    getProductById(value)
      .then((res) => {
        setTemp(res.data);
        console.log(res.data);
      })
      .catch((error) => console.log(error));
    setShow(true);
  };

  // Navigation for related products carousel
  const nextSlide = () => {
    if (relate && currentSlide < Math.ceil(relate.length / productsPerSlide) - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setCurrentSlide(0);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else if (relate) {
      setCurrentSlide(Math.ceil(relate.length / productsPerSlide) - 1);
    }
  };

  useEffect(() => {
    onLoad();
    window.scrollTo(0, 0);
  }, [id]);

  const onLoad = () => {
    getProductById(id)
      .then((res) => {
        setItem(res.data);
        setAttributes(res.data.attributes);
        
        // Filter out cloth_04 image for Doodle Backpack product
        if (res.data.code === "GV7412" && res.data.main && res.data.main.includes("cloth_04")) {
          // If main image is cloth_04 for this product, set a different image as main
          if (res.data.images && res.data.images.length > 0) {
            const validImages = res.data.images.filter(img => !img.includes("cloth_04") && img !== "black.jpg" && img !== "black.png");
            setDisplayImage(validImages.length > 0 ? validImages[0] : res.data.main);
          } else {
            setDisplayImage(res.data.main);
          }
        } else {
          setDisplayImage(res.data.main);
        }

        relateProduct(res.data.id, res.data.brandId)
          .then((resp) => {
            setRelate(resp.data.content);
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));

    getAttribute(id, "S")
      .then((res) => {
        onModify(res.data.price, res.data.stock, res.data.id);
      })
      .catch((error) => console.log(error));
    setStatus(stock > count);

    if(props.user){
      getCartItemByAccountId(props.user.id).then((resp) => {
        setCart(resp.data.map((item) => ({ ...item, checked: false })));
      });
    }

    props.changeHeaderHandler(2);
  };

  // extract a representative pixel color from each image
  useEffect(() => {
    if (item && item.images) {
      const results = [];
      item.images
        .filter(imgName => 
          // Filter out cloth_04 image and any black images specifically for Doodle Backpack
          !(item.code === "GV7412" && (imgName.includes("cloth_04") || imgName === "black.jpg" || imgName === "black.png"))
        )
        .forEach((imgName) => {
          const img = new Image();
          // require may return a module with default
          const src = require(`../static/images/${imgName}`);
          img.src = src.default || src;
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            // sample center pixel
            const x = Math.floor(img.naturalWidth / 2);
            const y = Math.floor(img.naturalHeight / 2);
            const [r, g, b] = ctx.getImageData(x, y, 1, 1).data;
            const hex = '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
            results.push({ imgName, color: hex });
            if (results.length === item.images.filter(img => 
              !(item.code === "GV7412" && (img.includes("cloth_04") || img === "black.jpg" || img === "black.png"))
            ).length) {
              setSwatches(results);
            }
          };
        });
    }
  }, [item]);

  const onModify = (price, stock, flag) => {
    setCount(1);
    setStatus(stock > count);
    setPrice(price);
    setStock(stock);
    setFlag(flag);
  };

  const onAddCartHandler = async (attributeId, lastPrice) => {
    if (!status) {
      toast.warning("Sản phẩm đã hết hàng.");
    } else {
      if (flag) {
        if (props.user) {
          const flagId = cart.map((item) => item.id);
          const obj = cart.filter((i) => i.id == attributeId)[0];
          console.log(obj);
          const data = {
            accountId: props.user.id,
            attributeId: attributeId,
            quantity: flagId.includes(attributeId) ? (count + obj.quantity) : count,
            lastPrice: lastPrice,
          };
          console.log(data);
          modifyCartItem(data)
            .then(() => {
              toast.success("Thêm vào giỏ hàng thành công.");
              if (props.updateCart) props.updateCart();
            })
            .catch((error) => {
              setCount(1);
              toast.error(error.response.data.Errors);
            });
        } else {
          getAttributeById(attributeId)
            .then((resp) => {
              const data = {
                id: attributeId,
                image: item.main,
                name: item.name,
                size: resp.data.size,
                price: resp.data.price,
                stock: resp.data.stock,
                discount: item.discount,
                quantity: count,
                lastPrice: lastPrice,
                color: displayImage
              };
              props.addHandler(data);
              toast.success("Thêm vào giỏ hàng thành công.");
            })
            .catch((error) => console.log(error));
        }
      } else {
        toast.warning("Mời chọn size.");
      }
    }
  };

  const updateCount = (value) => {
    const numValue = parseInt(value);
    if (numValue >= 1) {
      isEnoughCartItem(flag, numValue)
        .then(() => {
          setCount(numValue);
          setStatus(stock >= numValue);
        })
        .catch((error) => {
          toast.warning(error.response.data.Errors);
          setCount(1);
        });
    } else {
      toast.warning("Số lượng không hợp lệ");
    }
  };

  const addCount = (value) => {
    if (value >= 1) {
      isEnoughCartItem(flag, value)
        .then(() => {
          setCount(value);
          setStatus(stock >= value);
        })
        .catch((error) => {
          toast.warning(error.response.data.Errors);
        });
    }
  };

  // Handler for "Buy Now" that adds to cart, flags the item, and redirects
  const handleBuyNow = () => {
    // Overwrite buy list to only this product
    if (props.setBuyNowHandler) {
      props.setBuyNowHandler(flag.toString());
    }
    if (!status) {
      toast.warning("Sản phẩm đã hết hàng.");
      return;
    }
    if (!flag) {
      toast.warning("Mời chọn size.");
      return;
    }
    const lastPriceValue = (price * (100 - item.discount)) / 100;
    if (props.user) {
      // Authenticated user: update server-side cart
      const data = {
        accountId: props.user.id,
        attributeId: flag,
        quantity: count,
        lastPrice: lastPriceValue,
      };
      modifyCartItem(data)
        .then(() => {
          toast.success("Thêm vào giỏ hàng thành công.");
          if (props.updateCart) props.updateCart();
          history.push("/checkout");
        })
        .catch((error) => {
          setCount(1);
          toast.error(error.response.data.Errors);
        });
    } else {
      // Guest user: update local cart
      getAttributeById(flag)
        .then((resp) => {
          const data = {
            id: flag,
            image: item.main,
            name: item.name,
            size: resp.data.size,
            price: resp.data.price,
            stock: resp.data.stock,
            discount: item.discount,
            quantity: count,
            lastPrice: lastPriceValue,
            color: displayImage,
          };
          props.addHandler(data);
          history.push("/checkout");
        })
        .catch((error) => console.log(error));
    }
  };

  // Filter unique sizes to avoid duplicate size buttons
  const uniqueAttributes = attributes.filter((attr, index, self) => self.findIndex(a => a.size === attr.size) === index);

  // filter swatches to unique colors
  const uniqueSwatches = swatches.filter((s, idx, arr) => arr.findIndex(o => o.color === s.color) === idx);

  // Get current visible products for the carousel
  const getCurrentProducts = () => {
    if (!relate || relate.length === 0) return [];

    // Determine how many products to show based on window width
    let itemsToShow = productsPerSlide;
    if (windowWidth < 768) {
      itemsToShow = 2; // Show 2 items on mobile
    } else if (windowWidth < 992) {
      itemsToShow = 3; // Show 3 items on tablets
    }

    const startIndex = currentSlide * itemsToShow;
    const total = relate.length;
    const subset = [];
    for (let i = 0; i < itemsToShow; i++) {
      // Cycle through relate array to always fill the slide
      subset.push(relate[(startIndex + i) % total]);
    }
    return subset;
  };

  // Determine if navigation buttons should be shown
  const shouldShowNavigation = () => {
    if (!relate) return false;
    
    let itemsToShow = productsPerSlide;
    if (windowWidth < 768) {
      itemsToShow = 2;
    } else if (windowWidth < 992) {
      itemsToShow = 3;
    }
    
    return relate.length > itemsToShow;
  };

  return (
    <div>
      {item && (
        <div className="col-12 mt-3">
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb bg-transparent p-0">
              <li className="breadcrumb-item"><NavLink to="/" className="text-decoration-none text-secondary">Trang chủ</NavLink></li>
              <li className="breadcrumb-item"><NavLink to="/products" className="text-decoration-none text-secondary">Sản phẩm</NavLink></li>
              <li className="breadcrumb-item active" aria-current="page">{item.name}</li>
            </ol>
          </nav>

          <div>
            <div className="mb-5 border-0">
              <div className="row g-0">
                <div className="col-md-5">
                  <img
                    src={require(`../static/images/${displayImage || item.main}`)}
                    className="img-fluid"
                    style={{ width: "100%", height: "auto", objectFit: "contain" }}
                    alt=""
                  />
                </div>
                <div className="col-md-7">
                  <div className="ps-md-5">
                    <h2 className="fw-bold mb-3">
                      {item.name}
                    </h2>
                    <p className="text-secondary mb-3">Mã SP: {item.code}</p>
                    <h4 className="fw-bold text-danger mb-2">
                      {price &&
                        (
                          (price * (100 - item.discount)) /
                          100
                        ).toLocaleString() + " đ"}
                    </h4>
                    <p className="text-secondary mb-4">
                      Giá gốc: {" "}
                      <del>{price && price.toLocaleString() + " đ"}</del>
                    </p>
                    <div className="mb-4 border-top border-bottom py-4">
                      <label className="fw-bold mb-2 d-block">Kích thước <span className="text-primary ms-2 fw-normal" style={{cursor: 'pointer', fontSize: '14px'}} onClick={handleSizeGuideShow}>HƯỚNG DẪN CHỌN SIZE</span></label>
                      <div className="d-flex flex-wrap">
                        {uniqueAttributes.map((i, index) => (
                          <button
                            key={index}
                            className={`btn ${
                              flag == i.id
                                ? "btn-dark text-white"
                                : i.stock === 0
                                ? "btn-outline-secondary opacity-50"
                                : "btn-outline-dark border-dark"
                            }`}
                            style={{ 
                              minWidth: "45px", 
                              borderRadius: "0", 
                              margin: "0 8px 8px 0",
                              padding: "6px 12px",
                              fontWeight: flag == i.id ? "bold" : "normal"
                            }}
                            onClick={() => onModify(i.price, i.stock, i.id)}
                            disabled={i.stock === 0}
                          >
                            {i.size}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4 py-2">
                      <label className="fw-bold mb-2 d-block">Màu sắc</label>
                      <div className="d-flex mb-4">
                        {uniqueSwatches.map(({ imgName, color }, idx) => (
                          <div
                            key={idx}
                            className={displayImage === imgName ? 'active' : ''}
                            style={{
                              width: '36px',
                              height: '36px',
                              backgroundColor: color,
                              borderRadius: '50%',
                              border: displayImage === imgName ? '2px solid #000' : '1px solid #ddd',
                              cursor: 'pointer',
                              marginRight: '8px'
                            }}
                            onClick={() => setDisplayImage(imgName)}
                          ></div>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4 py-2">
                      <label className="fw-bold mb-2 d-block">Số lượng</label>
                      <div className="d-flex align-items-center" style={{ maxWidth: '150px' }}>
                        <button
                          onClick={() => addCount(count - 1)}
                          disabled={count <= 1}
                          style={{
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0',
                            borderRadius: '0',
                            border: '1px solid #000'
                          }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          name="quantity"
                          className="text-center mx-1"
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '0',
                            padding: '0',
                            border: '1px solid #000'
                          }}
                          value={count}
                          onChange={(e) => updateCount(e.target.value)}
                          min={1}
                        />
                        <button
                          onClick={() => addCount(count + 1)}
                          disabled={count >= stock}
                          style={{
                            width: '38px',
                            height: '38px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0',
                            borderRadius: '0',
                            border: '1px solid #000'
                          }}
                        >
                          +
                        </button>
                      </div>
                      {stock > 0 && (
                        <p className="text-success mt-2 mb-0">Còn {stock} sản phẩm</p>
                      )}
                      {stock <= 0 && (
                        <p className="text-danger mt-2 mb-0">Hết hàng</p>
                      )}
                    </div>
                    <div className="d-flex gap-2 mt-4">
                      <button
                        onClick={() =>
                          onAddCartHandler(
                            flag,
                            (price * (100 - item.discount)) / 100
                          )
                        }
                        className="btn btn-primary text-white text-uppercase"
                        style={{ 
                          borderRadius: "0", 
                          padding: "12px 20px",
                          flex: "1",
                          fontWeight: "500"
                        }}
                        disabled={!flag || stock <= 0}
                      >
                        Thêm vào giỏ
                      </button>
                      <button
                        onClick={handleBuyNow}
                        className="btn btn-dark text-white text-uppercase"
                        style={{ 
                          borderRadius: "0", 
                          padding: "12px 20px",
                          flex: "1",
                          fontWeight: "500"
                        }}
                        disabled={!flag || stock <= 0}
                      >
                        Mua ngay
                      </button>
                    </div>
                    
                    <div className="mt-5">
                      <h5 className="fw-bold mb-3">Thông tin sản phẩm</h5>
                      <div className="product-info">
                        <p><strong>Chất liệu:</strong> vải cao cấp</p>
                        <p><strong>Kiểu dáng:</strong> {item.description}</p>
                        <p><strong>Sản phẩm thuộc dòng:</strong> New Collection</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
                
            <div className="mb-5">
              <h5 className="fw-bold mb-3">Hình ảnh sản phẩm</h5>
              <div className="row g-2">
                {item.images && item.images
                  .filter(img => !(item.code === "GV7412" && (img.includes("cloth_04") || img === "black.jpg" || img === "black.png")))
                  .map((img, index) => (
                  <div className="col-md-2 col-4" key={index}>
                    <img
                      src={require(`../static/images/${img}`)}
                      alt="..."
                      className="img-thumbnail border-1"
                      style={{ width: "100%", height: "auto", objectFit: "cover", cursor: "pointer" }}
                      onClick={() => setDisplayImage(img)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <h2 className="text-center text-uppercase mb-5 section-title">Sản phẩm tương tự</h2>
              <div className="position-relative">
                <div className="row g-4">
                  {getCurrentProducts().map((item, index) => (
                    <div className="col-lg-3 col-md-3 col-sm-6 col-6" key={index}>
                      <div className="product-item">
                        <div className="product-image" style={{ aspectRatio: '3/4' }}>
                          <NavLink to={`/product-detail/${item.id}`}>
                            <img
                              src={require(`../static/images/${item.image}`)}
                              alt={item.name}
                              className="hover-zoom"
                            />
                          </NavLink>
                        </div>
                        <div className="product-info text-center">
                          <h5 className="product-title">
                            <NavLink
                              to={`/product-detail/${item.id}`}
                              className="text-dark text-decoration-none"
                            >
                              {item.name}
                            </NavLink>
                          </h5>
                          <div className="product-price">
                            <span className="text-danger">
                              {((item.price * (100 - item.discount)) / 100).toLocaleString()}₫
                            </span>
                            {item.discount > 0 && (
                              <span>
                                <del>{item.price.toLocaleString()}₫</del>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {shouldShowNavigation() && (
                  <>
                    <button 
                      onClick={prevSlide}
                      className="carousel-nav-btn prev" 
                      aria-label="Previous products"
                    >
                      <i className="fa fa-angle-left"></i>
                    </button>
                    <button 
                      onClick={nextSlide}
                      className="carousel-nav-btn next"
                      aria-label="Next products"
                    >
                      <i className="fa fa-angle-right"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Modal show={showSizeGuide} onHide={handleSizeGuideClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Hướng dẫn chọn size</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover responsive>
            <thead className="bg-light">
              <tr>
                <th>SIZE</th>
                <th>S</th>
                <th>M</th>
                <th>L</th>
                <th>XL</th>
                <th>2XL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>VAI (cm)</td>
                <td>35</td>
                <td>36</td>
                <td>37</td>
                <td>38</td>
                <td>39</td>
              </tr>
              <tr>
                <td>NGỰC (cm)</td>
                <td>82</td>
                <td>86</td>
                <td>90</td>
                <td>94</td>
                <td>98</td>
              </tr>
              <tr>
                <td>EO (cm)</td>
                <td>66</td>
                <td>70</td>
                <td>75</td>
                <td>80</td>
                <td>84</td>
              </tr>
              <tr>
                <td>MÔNG (cm)</td>
                <td>86</td>
                <td>90</td>
                <td>94</td>
                <td>98</td>
                <td>102</td>
              </tr>
              <tr>
                <td>CÂN NẶNG (kg)</td>
                <td>45 - 50</td>
                <td>51 - 55</td>
                <td>56 - 60</td>
                <td>61 - 64</td>
                <td>65 - 68</td>
              </tr>
              <tr>
                <td>CHIỀU CAO (cm)</td>
                <td>150 - 160</td>
                <td>155 - 160</td>
                <td>155 - 160</td>
                <td>160 - 165</td>
                <td>160 - 165</td>
              </tr>
            </tbody>
          </Table>
          <p className="mt-4">
            <strong>Bạn vẫn còn có những mắc thắc và băn khoăn cần được giải đáp?</strong><br/>
            Hãy liên hệ ngay với bộ phận Bán hàng online của chúng tôi
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleSizeGuideClose}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
      
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>So sánh sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>{item && item.name}</th>
                <th>{temp && temp.name}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Code</td>
                <td>{item && item.code}</td>
                <td>{temp && temp.code}</td>
              </tr>
              <tr>
                <td>Thương hiệu</td>
                <td>{item && item.brand}</td>
                <td>{temp && temp.brand}</td>
              </tr>
              <tr>
                <td>Giá</td>
                <td>{item && item.price.toLocaleString()} đ</td>
                <td>{temp && temp.price.toLocaleString()} đ</td>
              </tr>
              <tr>
                <td>Giảm giá</td>
                <td>{item && item.discount} %</td>
                <td>{temp && temp.discount} %</td>
              </tr>
              <tr>
                <td>Lượt thích</td>
                <td>{item && item.view}</td>
                <td>{temp && temp.view}</td>
              </tr>
              <tr>
                <td>Size</td>
                <td>
                  {item &&
                    item.attributes.reduce(
                      (result, item) => result + " " + item.size + "",
                      ""
                    )}
                </td>
                <td>
                  {temp &&
                    temp.attributes.reduce(
                      (result, item) => result + " " + item.size + "",
                      ""
                    )}
                </td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductDetail;
