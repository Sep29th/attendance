import { del, get, post } from "../../utils";

export const getListDevice = async () => {
    return await get("list-device");
};

export const getListDeviceWithState = async (state) => {
    return await get(`list-device/${state}`);
};

export const sendStateEvent = async () => {
    return await post("send-state-event");
};

export const deleteDevice = async (id) => {
    return await del(`delete-device/${id}`);
};

export const updateDevice = async (id, state) => {
    return await post("update-device", { id: id, state: state });
};

export const createDevice = async (id, name) => {
    return await post("create-device", { id: id, name: name });
};
