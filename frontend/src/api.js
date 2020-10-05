import axios from 'axios';
import settings from './settings'
import cookie from "react-cookies";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";

export default axios.create({
  baseURL: settings().BASE_URL,
});