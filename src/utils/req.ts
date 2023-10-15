import { extend } from 'umi-request';

const request = extend({
  headers: {
    'token': window.localStorage.getItem('token') || ''
  },
});



export default request;