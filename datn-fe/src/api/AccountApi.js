import Instance from '../axios/Instance'

export const getAccountDetailByAccountId = (id) =>{
    const url = `/api/site/account/detail?id=${id}`;
    return Instance.get(url);
}

export const getMe = (token) =>{
    const url = `/api/site/me?token=${token}`;
    return Instance.get(url);
}

export const updatepProfile = (data) =>{
    const url = `/api/site/account/detail/update`;
    return Instance.post(url, data);
}

export const getByUsername = (username) =>{
    const url = `/api/site/account/find-by-username?username=${username}`;
    return Instance.get(url);
}
