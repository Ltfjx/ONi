import user from "./user"
import bot from "./bot"
import ae from "./ae"
import data from "./data"
import redstone from "./redstone"
import event from "./event"
import mcServerStatus from "./mcServerStatus"

import { Config } from "../interface"

var Global = {
    user: user,
    bot: bot,
    ae: ae,
    data: data,
    redstone: redstone,
    event: event,
    mcServerStatus: mcServerStatus,

    init(config: Config) {
        user.init(config)
        bot.init(config)
        ae.init(config)
        data.init(config)
        redstone.init(config)
        event.init(config)
        mcServerStatus.init(config)
    }
}

export default Global
