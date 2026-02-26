import axios from "axios";

const api = axios.create({
    baseURL : "http://localhost:5148/api", 
    headers : {
        "Content-Type" : "application/json"
    }
})
api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");
    if(token){
        config.headers.Authorize = `Bearer ${token}`;
    }
    return config;
});

export default api;