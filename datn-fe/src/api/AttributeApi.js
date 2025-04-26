import Instance from '../axios/Instance'

export const cacheAttribute = (data) =>{
    const url = `api/site/cache-attribute`;
    return Instance.post(url, data);
}

export const backAttribute = (data) =>{
    const url = `api/site/back-attribute`;
    return Instance.post(url, data);
}
export const getAttribute = (id, size) =>{
    const url = `/api/site/attribute/get-by-product?id=${id}&size=${size}`;
    return Instance.get(url);
}

export const getAttributeById = (id) =>{
    const url = `/api/site/attribute/get-by-id?id=${id}`;
    return Instance.get(url);
}