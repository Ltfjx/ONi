import * as fs from 'fs';
import log4js from 'log4js';
const logger = log4js.getLogger("global");
var global = {
    // 用户列表
    userList: [],
    // BOT 列表
    botList: [],
    // AE 列表
    aeList: [],
    // 通用数据
    commonData: [],
    // 事件
    eventList: [
    // {
    //     uuid: "00000000-0000-000000000000",
    //     name: "test0",
    //     description: "test0000",
    //     priority: 0,
    //     status: 0,
    //     timestamp: 0
    // },
    // {
    //     uuid: "00000000-0000-000000000001",
    //     name: "test1",
    //     description: "test0001",
    //     priority: 1,
    //     status: 0,
    //     timestamp: 0
    // },
    // {
    //     uuid: "00000000-0000-000000000002",
    //     name: "test2",
    //     description: "test0002",
    //     priority: 2,
    //     status: 0,
    //     timestamp: 0
    // }
    ],
    // MC 服务器状态
    mcServerStatus: {
        ip: "",
        online: false,
        motd: "",
        players: {
            max: 0,
            online: 0,
            list: []
        }
    },
    // 初始化函数
    init(config) {
        this.userList = JSON.parse(fs.readFileSync('./data/user/user.json', 'utf8'));
        this.botList = JSON.parse(fs.readFileSync('./data/bot/bot.json', 'utf8'));
        this.aeList = JSON.parse(fs.readFileSync('./data/ae/ae.json', 'utf8'));
        this.commonData = JSON.parse(fs.readFileSync('./data/variable/common_data.json', 'utf8'));
        logger.trace("userList", this.userList);
        logger.trace("botList", this.botList);
        logger.trace("aeList", this.aeList);
        logger.trace("commonData", this.commonData);
        this.mcServerStatus.ip = config.mc_server_ip;
        logger.trace("mcServerStatus", this.mcServerStatus);
    },
    getEventLayout() {
        let content = [];
        this.eventList.forEach(event => {
            content.push({
                type: "card",
                id: "event",
                config: {
                    uuid: event.uuid,
                    title: event.name,
                    description: event.description,
                    priority: event.priority,
                    status: event.status,
                    timestamp: event.timestamp
                }
            });
        });
        let _;
        if (content.length == 0) {
            _ = [{
                    type: "grid-full",
                    content: [{
                            type: "card",
                            id: "no-event",
                            config: {}
                        }]
                }];
        }
        else {
            _ = [{
                    type: "grid-m",
                    content: content
                }];
        }
        return _;
    },
    getBotListLayout() {
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
    getBotEditLayout() {
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
    getAeListLayout() {
        let content = [];
        this.aeList.forEach(ae => {
            content.push({
                type: "card",
                id: "ae-overview",
                config: {
                    uuid: ae.uuid,
                    name: ae.name,
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
                    id: "create-ae",
                    config: {}
                }]
        });
        return _;
    },
    getAeEditLayout() {
        let content = [];
        this.aeList.forEach(ae => {
            content.push({
                type: "tab",
                id: "ae-edit",
                config: {
                    uuid: ae.uuid,
                    name: ae.name,
                }
            });
        });
        let _ = [{
                type: "raw",
                content: content
            }];
        return _;
    },
    getAeViewLayout() {
        let content = [];
        this.aeList.forEach(ae => {
            content.push({
                type: "tab",
                id: "ae-view",
                config: {
                    uuid: ae.uuid,
                    name: ae.name,
                }
            });
        });
        let _ = [{
                type: "raw",
                content: content
            }];
        return _;
    }
};
export default global;
