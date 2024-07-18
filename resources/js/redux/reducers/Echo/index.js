export const handleEcho = (state = {}, actions) => {
    switch (actions.type) {
        case "ECHO_SET":
            return actions.instance;
        default:
            return state;
    }
};
