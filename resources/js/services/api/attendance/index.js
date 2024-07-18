import { get } from "../../utils";

export const getListAttendance = async (param = "") => {
    return await get(`list-attendance?${param}`);
};

export const getListCalculateMerit = async (param) => {
    return await get(`list-calculate-merit?${param}`);
};
