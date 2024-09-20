// 这里是 Suika.js，模仿 OC 的行为，用于调试 Oni。

import WebSocket from 'ws'
const ws = new WebSocket("ws://localhost:5600/ws/oc")

ws.addEventListener('message', ((event) => {
    console.log(event.data)
}))

ws.onopen = () => {
    ws.send(JSON.stringify({
        "type": "debug",
        "data": "This is a test message from Suika.js"
    }))
    ws.send(JSON.stringify({
        type: "auth/request",
        data: { token: "CWN78VN0MB00WFYIL8AN" }
    }))
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            ws.send(JSON.stringify({
                type: "data/common",
                data: {
                    uuid: "b6cdf1a8-39fd-49f2-b36c-5c464631097d",
                    value: i * 100,
                    max: 114514,
                    avgIO: 1000 * i
                }
            }))
        }, i * 500)
    }
}
