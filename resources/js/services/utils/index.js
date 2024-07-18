import { getLocalStorage } from "../localStorage";

const API_DOMAIN = import.meta.env.VITE_APP_URL + "/api/";

export const get = async (path) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + getLocalStorage("token"),
        },
    });
    return await response.json();
};

export const post = async (path, body) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + getLocalStorage("token"),
        },
        body: JSON.stringify(body),
    });
    return await response.json();
};

export const del = async (path) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + getLocalStorage("token"),
        },
    });
    return await response.json();
};

export const put = async (path, options) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + getLocalStorage("token"),
        },
        body: JSON.stringify(options),
    });
    return await response.json();
};
export const uploadFile = async (path, formData = new FormData()) => {
    const response = await fetch(API_DOMAIN + path, {
        method: "POST",
        headers: {
            Accept: "application/json",
            Authorization: "Bearer " + getLocalStorage("token"),
        },
        body: formData,
    });
    return await response.json();
};
