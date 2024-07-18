import { get, post } from "../../utils"

export const login = async (data) => {
    return await post("login", data);
}

export const dashboard = async () => {
    return await get("dashboard");
}

export const verify = async () => {
    return await get("verify");
}
