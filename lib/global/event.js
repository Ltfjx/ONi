import { wsWebBroadcast } from "../websocket.js";
var event = {
    // 事件
    list: [],
    getLayout() {
        let content = [];
        this.list.forEach(event => {
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
    set(event) {
        this.list.forEach((item, index) => {
            if (item.uuid == event.uuid) {
                this.list[index] = event;
                wsWebBroadcast("layout/events", this.getLayout());
                return;
            }
        });
    },
    add(event) {
        this.list.push(event);
        wsWebBroadcast("layout/events", this.getLayout());
    },
    init(config) {
        // TODO: 考虑是否需要做事件存储功能
    }
};
export default event;
