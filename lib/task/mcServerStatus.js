var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Global from "../global";
import { loggerTask as logger } from "../logger";
var mcServerStatus = {
    init(config) {
        // 定时更新 MC 服务器状态
        setInterval(mcServerStatusUpdate, config.mc_server_status_update_interval * 1000);
        mcServerStatusUpdate();
        function mcServerStatusUpdate() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const mc = yield import('minecraftstatuspinger').then(mc => mc.default);
                    const result = yield mc.lookup({ host: config.mc_server_ip });
                    const data = result.status;
                    var status = {
                        ip: config.mc_server_ip,
                        online: data == null ? false : true,
                        motd: data == null ? "" : data.description,
                        players: data == null ? {
                            max: 0, online: 0, list: []
                        } : {
                            max: data.players.max, online: data.players.online, list: data.players.sample || []
                        }
                    };
                    Global.setMcServerStatus(status);
                    logger.trace("mcServerStatus", Global.mcServerStatus);
                }
                catch (error) {
                    var status = {
                        ip: config.mc_server_ip,
                        online: false,
                        motd: "",
                        players: {
                            max: 0, online: 0, list: []
                        }
                    };
                    Global.setMcServerStatus(status);
                    logger.error("mcServerStatus", error);
                }
            });
        }
    }
};
export default mcServerStatus;
