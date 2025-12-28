import axios from "axios";
import { API_PATH, BASE_URL } from "./constant";

export const authenticate = async (data) =>{
    const url = BASE_URL + API_PATH.AUTH_LOGIN_GOOGLE;
    console.log("data ",data);

    const response = await axios(url,{
        data:data,
        method:'POST'
    });
    
    
    console.log("response ",response);
    return response?.data;
}