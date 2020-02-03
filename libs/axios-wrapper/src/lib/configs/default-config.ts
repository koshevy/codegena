import { AxiosRequestConfig } from 'axios';

export const defaultAxiosConfig: AxiosRequestConfig = {
    headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
    },
    responseType: 'json',
    timeout: 60000,
    withCredentials: true
};
