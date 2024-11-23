import Global from "../global/index.js"
import { Config, McServerStatus } from "../interface.js"
import { loggerTask as logger } from "../logger.js"

var mcServerStatus = {
    init(config: Config) {
        // 定时更新 MC 服务器状态

        if (config.mc_server_ip) {
            setInterval(mcServerStatusUpdate, config.mc_server_status_update_interval * 1000)
            mcServerStatusUpdate()
        } else {
            logger.warn("mcServerStatus", "mc_server_ip is not set, mcServerStatusUpdate will not be executed.")
        }


        async function mcServerStatusUpdate() {
            try {
                const mc = await import('minecraftstatuspinger').then(mc => mc.default)
                const result = await mc.lookup({ host: Global.mcServerStatus.status.ip })
                const data = result.status

                var status: McServerStatus = {
                    ip: Global.mcServerStatus.status.ip,
                    online: data == null ? false : true,
                    motd: data == null ? "" : data.description,
                    players: data == null ? {
                        max: 0, online: 0, list: []
                    } : {
                        max: data.players.max, online: data.players.online, list: data.players.sample || []
                    }
                }

                Global.mcServerStatus.set(status)
                logger.trace("mcServerStatus", Global.mcServerStatus)

            } catch (error) {

                var status: McServerStatus = {
                    ip: Global.mcServerStatus.status.ip,
                    online: false,
                    motd: "",
                    players: {
                        max: 0, online: 0, list: []
                    }
                }

                Global.mcServerStatus.set(status)
                logger.error("mcServerStatus", error)

            }
        }
    }
}

export default mcServerStatus