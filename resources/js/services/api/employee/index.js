import { del, get, post, put } from "../../utils";

export const getAllEmployee = async () => {
    return await get("get-all-employee");
};

export const createEmployee = async (body) => {
    return await post("create-employee", body);
};

export const updateEmployee = async (body) => {
    return await put("update-employee", body);
};

export const deleteEmployee = async (id) => {
    return await del(`delete-employee/${id}`);
};

export const scanCardId = async (deviceId) => {
    return await get(`scan-card-id?device=${deviceId}`);
}
