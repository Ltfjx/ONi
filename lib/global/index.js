import user from "./user.js";
import bot from "./bot.js";
import ae from "./ae.js";
import data from "./data.js";
import redstone from "./redstone.js";
import event from "./event.js";
import mcServerStatus from "./mcServerStatus.js";
import staticResources from "./staticResources.js";
var Global = {
    user: user,
    bot: bot,
    ae: ae,
    data: data,
    redstone: redstone,
    event: event,
    mcServerStatus: mcServerStatus,
    staticResources: staticResources,
    init(config) {
        user.init(config);
        bot.init(config);
        ae.init(config);
        data.init(config);
        redstone.init(config);
        event.init(config);
        mcServerStatus.init(config);
        staticResources.init(config);
    }
};
export default Global;
