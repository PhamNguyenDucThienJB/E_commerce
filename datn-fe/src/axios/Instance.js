import axios from 'axios'

const Instance = axios.create({
    baseURL: "http://localhost:8080",
    headers:{
        "Content-Type" : "application/json"
    }
});

// Add a request interceptor
Instance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        console.log('Request config:', config);
        return config;
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
Instance.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        // If unauthorized, don't automatically logout
        if (error.response && error.response.status === 401) {
            console.log('Unauthorized request - but not logging out');
            // Don't clear token here to prevent automatic logout
        }
        console.error('Response error:', error);
        return Promise.reject(error);
    }
);

export default Instance