import axios from "axios";

export const BASE_URL = "https://mapapi.gebeta.app/api";
export const TEST_URL = "https://apitest.gebeta.app/api";


export const apiClient = axios.create({
    baseURL: BASE_URL,
});