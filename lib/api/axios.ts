import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';


const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 10000,
    headers:{
        "Content-Type": 'application/json',
    },
});

//Request interceptor
axiosInstance.interceptors.request.use(
    (config) =>{
        if(typeof window !== 'undefined'){
            const token = localStorage.getItem('token');
            if(token){
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
);

//Response interceptor
axiosInstance.interceptors.response.use(
    (response)=>{
        return response;
    },
    async(error)=>{
        const originalRequest = error.config

        if(error.response?.status== 401 && !originalRequest._retry){
            originalRequest._retry = true;

            if(typeof window !== 'undefined'){
                localStorage.removeItem('token');
            }
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;