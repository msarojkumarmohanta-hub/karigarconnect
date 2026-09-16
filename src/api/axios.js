import axios from 'axios'
export const API_URL = window.KARIGARCONNECT_API || import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } })
api.interceptors.request.use((config) => { const token = localStorage.getItem('karigar_access_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config })
api.interceptors.response.use((response) => response, (error) => { if (error.response?.status === 401) { localStorage.removeItem('karigar_access_token'); localStorage.removeItem('karigar_user') }; return Promise.reject(error) })
export const unwrap = (response) => response.data?.data ?? response.data
export const messageOf = (error) => error.response?.data?.message || error.message || 'Something went wrong'
export default api
