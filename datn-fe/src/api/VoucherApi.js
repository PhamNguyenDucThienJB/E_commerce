import Instance from '../axios/Instance'

export const getVoucherByCode = (code) =>{
    const url = `/api/site/voucher/get-by-code?code=${code}`;
    return Instance.get(url);
}
