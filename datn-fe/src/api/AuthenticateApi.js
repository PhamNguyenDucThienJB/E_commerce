import Instance from '../axios/Instance'

export const registerAccount = (data) =>{
    const url = `/api/site/account/register`;
    return Instance.post(url, data);
}

export const createAccount = (data) =>{
    const url = `/api/site/account/create`;
    return Instance.post(url, data);
}

export const signIn = (data) =>{
    const url = '/api/site/login';
    return Instance.post(url, data);
}

export const forgotPassword = (data) =>{
    const url = '/api/site/forgot-password';
    return Instance.post(url, data);
}
 