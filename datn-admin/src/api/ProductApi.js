import Instance from '../axios/Instance'
import axios from "axios";
export const getAllProducts = (page, size, active) =>{
    const url = `/api/site/product/get-all?page=${page}&size=${size}&active=${active}`;
    return Instance.get(url);
}

export const getAllProductsByBrand = (brand, page, size, active) =>{
    const url = `/api/site/product/by-brand?brand=${brand}&page=${page}&size=${size}&active=${active}`;
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

export const countProduct = () =>{
    const url = `/api/admin/product/count`;
    return Instance.get(url);
}

export const createProduct = (data) =>{
    const url = `/api/admin/product/create`;
    return Instance.post(url, data);
}
export const modifyProduct = (data) =>{
    const url = `/api/admin/product/modify`;
    return Instance.post(url, data);
}
export const deleteImage = (id) =>{
    const url = `/api/admin/productEdit/delete/${id}`;
    return Instance.delete(url);
}
export const getImagesByProductId =(productId)=>{
    const url = `/api/admin/productImage/${productId}`;
    return Instance.get(url);
}
export const deleteProduct = (id) => {
  return Instance.delete(`/api/admin/product/delete/${id}`);
};