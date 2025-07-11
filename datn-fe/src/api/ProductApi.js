import Instance from '../axios/Instance'

export const getAllProducts = (page, size, active) =>{
    const url = `/api/site/product/get-all?page=${page}&size=${size}&active=${active}`;
    return Instance.get(url);
}
export const filterProducts = (data) =>{
    const url = `/api/site/product/filter`;
    return Instance.post(url, data);
}

export const searchByKeyword = (page, size, keyword) =>{
    const url = `/api/site/products/search?page=${page}&size=${size}&keyword=${keyword}`;
    return Instance.get(url);
}
export const getTotalPage = () =>{
    const url = `/api/site/product/total-page`;
    return Instance.get(url);
}

export const getProductById = (id) =>{
    const url = `/api/site/product/detail/${id}`;
    return Instance.get(url);
}

export const relateProduct = (id, brand) =>{
    const url = `/api/site/product/relate?relate=${brand}&id=${id}`;
    return Instance.get(url);
}

// Fetch most-viewed products
export const getMostViewedProducts = (page, size) =>{
    const url = `/api/site/product/most-viewed?page=${page}&size=${size}`;
    return Instance.get(url);
};

// Fetch best-selling products
export const getBestSellingProducts = (page, size) =>{
    const url = `/api/site/product/best-sellers?page=${page}&size=${size}`;
    return Instance.get(url);
};
export const filterAdvancedProducts = (data) => {
  return Instance.post("/api/site/product/filter-advanced", data);
};
// Fetch newest products
export const getNewestProducts = (page, size) => {
    const url = `/api/product/newest?page=${page}&size=${size}`;
    return Instance.get(url);
};

