import { loggerGlobal as logger } from "../logger";
import { wsWebBroadcast } from "../websocket";
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
        this.status.ip = config.mc_server_ip;
        logger.trace("mcServerStatus", mcServerStatus);
    }
};
export default mcServerStatus;
