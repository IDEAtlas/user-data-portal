import axios from 'axios';


const axios_auth_services = axios.create({
  baseURL: 'https://portal.ideatlas.eu/geoserver'
});

export default axios_auth_services

