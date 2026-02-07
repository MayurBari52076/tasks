import axios from "axios";

const api = axios.create({
  baseURL: "https://tasks-amia.onrender.com/api"
});

export default api;
