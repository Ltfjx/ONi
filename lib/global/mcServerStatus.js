import { loggerGlobal as logger } from "../logger.js";
import { wsWebBroadcast } from "../websocket.js";
var mcServerStatus = {
    // MC 服务器状态
    status: {
        ip: "",
        online: false,
        motd: "",
        players: {
            max: 0,
            online: 0,
            list: []
        }
    },
    set(status) {
        this.status = status;
        wsWebBroadcast("data/mcServerStatus", this.status);
    },
    init(config) {
        if (!config.mc_server_ip) {
            logger.warn("mcServerStatus", "mc_server_ip is not set in config.");
        }
        else {
            this.status.ip = config.mc_server_ip;
            logger.debug("mcServerStatus", "mc_server_ip is set to " + config.mc_server_ip);
            logger.trace("mcServerStatus", mcServerStatus);
        }
    }
};
export default mcServerStatus;
