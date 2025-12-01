import axios from 'axios';

const axios_photon_services = axios.create({
  baseURL: 'https://photon.komoot.io/'
})

export default axios_photon_services