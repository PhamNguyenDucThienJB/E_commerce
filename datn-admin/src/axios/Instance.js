import axios from 'axios'

const Instance = axios.create({
    baseURL: "http://localhost:8080",
    headers:{
        "Content-Type" : "application/json"
    }
});

Instance.interceptors.request.use(
    config => {
        const accessToken = localStorage.getItem('token');
        if (accessToken) {
            config.headers.authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error)
    }
);

export default Instance