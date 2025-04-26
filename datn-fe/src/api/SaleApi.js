import Instance from '../axios/Instance'

export const getSaleDetail = (id) =>{
    const url = `/api/admin/sale/detail/${id}`;
    return Instance.get(url);
}