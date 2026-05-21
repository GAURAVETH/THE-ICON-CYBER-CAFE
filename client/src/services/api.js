// import axios from "axios";

// const API = axios.create({
//     baseURL: "https://the-icon-cyber-cafe.onrender.com/api",
// });

// API.interceptors.request.use((req) => {

//     const token = localStorage.getItem("token");

//     if (token) {
//         req.headers.Authorization = `Bearer ${token}`;
//     }

//     return req;
// });

// export default API;


import axios from "axios";

const API = axios.create({
    baseURL: "https://the-icon-cyber-cafe.onrender.com/api",
});

export default API;