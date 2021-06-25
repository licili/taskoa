import axios from 'axios';
import qs from 'qs';
// axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.baseURL = 'http://45.32.255.200:8000';
axios.defaults.timeout = 5000;
// axios.defaults.withCredentials = true;
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.transformRequest = data => qs.stringify(data);

// token机制
axios.interceptors.request.use(config => {
  let token = localStorage.getItem('token');
  token && (config.headers.Authorization = token);
  return config;
}, error => {
  Promise.reject(error)
})
axios.defaults.validateStatus = status => {
  return /^(2|3)\d{2}$/.test(status);
}
axios.interceptors.response.use(reponse => {
  return reponse.data;
}, error => {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        break;
      case 403:
        break;
      case 404:
        break;
      default:
        break;
    }
  } else {
    if (!window.navigator.onLine) {
      return;
    }
    return Promise.reject(error)
  }
})

export default axios;