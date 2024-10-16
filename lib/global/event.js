import { wsWebBroadcast } from "../websocket";
var event = {
    // 事件
    eventList: [],
    getLayout() {
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
    set(event) {
        this.eventList.forEach((item, index) => {
            if (item.uuid == event.uuid) {
                this.eventList[index] = event;
                wsWebBroadcast("layout/events", this.getLayout());
                return;
            }
        });
    },
    add(event) {
        this.eventList.push(event);
        wsWebBroadcast("layout/events", this.getLayout());
    },
    init(config) {
        // TODO: 考虑是否需要做事件存储功能
    }
};
export default event;
