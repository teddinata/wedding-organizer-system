import axios from 'axios'
import { useCookies } from '@vueuse/integrations/useCookies'
import router from '@/router'

const axiosIns = axios.create({
  // baseURL: `https://dev.goodsoneid.com/api/v2`,
  baseURL: `http://goodsone-be.dev.com/api/v2`,
})
const cookies = useCookies(['role', 'userData', 'accessToken', 'userAbilities'])

// ℹ️ Add request interceptor to send the authorization header on each subsequent request after login
axiosIns.interceptors.request.use(config => {
  // Retrieve token from localStorage
  const token = cookies.get('accessToken')

  // If token is found
  if (token) {
    // Get request headers and if headers is undefined assign blank object
    config.headers = config.headers

    // Set authorization header
    // ℹ️ JSON.parse will convert token to string
    config.headers.Authorization = token ? `Bearer ${token}` : ''
  }

  // Return modified config
  return config
})

// ℹ️ Add response interceptor to handle 401 response
axiosIns.interceptors.response.use(response => {
  return response
}, error => {
  // Handle error
  if (error.response.status === 401) {
    // ℹ️ Logout user and redirect to login page
    // Remove "userData" from localStorage
    cookies.remove('userData')

    // Remove "accessToken" from localStorage
    cookies.remove('accessToken')
    cookies.remove('userAbilities')

    // If 401 response returned from api
    router.push('/auth/login')
  }
  else {
    return Promise.reject(error)
  }
})

export default axiosIns
