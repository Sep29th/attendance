import { combineReducers } from "redux";
import { handleEcho } from "./Echo";

export const allReducer = combineReducers({
    echo: handleEcho
});
