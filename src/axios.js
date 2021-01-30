import axios from "axios";
import history from "./history";

let instance = axios.create({
  baseURL: "http://localhost:8080",
});

function createAxiosResponseInterceptor(axiosInstance) {
  const interceptor = axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Reject promise if usual error
      if (error.response && error.response.status === 403) {
        history.push("/login");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("email");
        localStorage.removeItem("userName");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
        localStorage.removeItem("profilePic");
      }
      axiosInstance.interceptors.response.eject(interceptor);
      return Promise.reject(error);
    }
  );
}

createAxiosResponseInterceptor(instance);
export default instance;
