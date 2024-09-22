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


    let i = 0;
    let speed = 100; // 初始发送速度（毫秒）
    const maxCount = 100; // 最多运行次数

    function sendData() {
        // 发送数据
        ws.send(JSON.stringify({
            type: "data/common",
            data: {
                uuid: "b6cdf1a8-39fd-49f2-b36c-5c464631097d",
                value: i * 100,
                max: 114514,
                avgIO: 1000 * i
            }
        }));

        i++;

        // 增加发送间隔，速度逐渐变慢
        if (i < maxCount) {
            speed += 10; // 每次增加50ms
            setTimeout(sendData, speed);
        }
    }

    // 开始发送数据
    sendData();

    ws.send(JSON.stringify({
        type: "data/event", data: {
            uuid: "00000000-0000-000000000000",
            name: "test0",
            description: "test0000",
            priority: 0,
            status: 0,
            timestamp: 0
        }
    }))
    setInterval(() => {
        ws.send(JSON.stringify({
            type: "data/event", data: {
                uuid: crypto.randomUUID(),
                name: "test0",
                description: "test0000",
                priority: 0,
                status: 0,
                timestamp: 0
            }
        }))
    }, 10000)


}
