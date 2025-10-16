// src/api/objectifs.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // adapte au besoin

export const getObjectifs = async () => {
  const response = await axios.get(`${API_URL}/objectifs/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
};

export const createObjectif = async (data: any) => {
  const response = await axios.post(`${API_URL}/objectifs/`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
};
