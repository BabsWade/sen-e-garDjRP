import axios from 'axios';

// Créer une instance d'Axios avec une configuration de base
const API = axios.create({
  baseURL: 'http://localhost:8000/api',  // Remplace par l'URL de ton backend
  withCredentials: true, // Si tu utilises des cookies, laisse cette option
});

// Ajoute un intercepteur pour insérer le token JWT dans les en-têtes des requêtes
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');  // Récupère le token depuis le localStorage

    // Si le token existe, l'ajouter dans l'en-tête Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;  // Renvoie la configuration modifiée
  },
  (error) => {
    return Promise.reject(error);  // Si une erreur se produit, la transmettre
  }
);

export default API;
