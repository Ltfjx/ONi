import fs from "fs";
import { loggerGlobal as logger } from "../logger";
var ae = {
    // AE 列表
    list: [],
    getListLayout() {
        let content = [];
        this.list.forEach(ae => {
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
    getEditLayout() {
        let content = [];
        this.list.forEach(ae => {
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
    getViewLayout() {
        let content = [];
        this.list.forEach(ae => {
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
    },
    init(config) {
        this.list = JSON.parse(fs.readFileSync('./data/ae/ae.json', 'utf8'));
        logger.trace("aeList", this.list);
    }
};
export default ae;
