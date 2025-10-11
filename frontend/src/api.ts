// src/api.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api', // adapte selon ton backend
  withCredentials: true,
});

export default API;
