import fs from "fs";
import { loggerGlobal as logger } from "../logger";
var bot = {
    // BOT 列表
    botList: [],
    getListLayout() {
        let content = [];
        this.botList.forEach(bot => {
            content.push({
                type: "card",
                id: "bot-overview",
                config: {
                    uuid: bot.uuid,
                    name: bot.name,
                }
            });
        });
        let _ = [{
                type: "grid-m",
                content: content
            }];
        _.push({
            type: "raw",
            content: [{
                    type: "card",
                    id: "create-bot",
                    config: {}
                }]
        });
        return _;
    },
    getEditLayout() {
        let content = [];
        this.botList.forEach(bot => {
            content.push({
                type: "tab",
                id: "bot-edit",
                config: {
                    uuid: bot.uuid,
                    name: bot.name,
                }
            });
        });
        let _ = [{
                type: "raw",
                content: content
            }];
        return _;
    },
    init(config) {
        this.botList = JSON.parse(fs.readFileSync('./data/bot/bot.json', 'utf8'));
        logger.trace("botList", this.botList);
    }
};
export default bot;
