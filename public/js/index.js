
// 设置项初始化
var token = ""
var settings = {
    localhostMode: "false"
}

!(function () {
    token = localStorage.getItem("token") || token
    settings.localhostMode = localStorage.getItem("localhostMode") || "false"
})()

// 设置
!(function () {
    let tfToken = document.getElementById("text-field-settings-token")
    let dialog = document.getElementById("settings-dialog")
    let cbLocalhostMode = document.getElementById("checkbox-settings-localhost-mode")

    document.getElementById("buttonSettings").addEventListener("click", () => {
        dialog.open = true
        tfToken.value = token
        cbLocalhostMode.checked = settings.localhostMode == "true"
    })
    document.getElementById("button-settings-discard").addEventListener("click", () => {
        dialog.open = false
    })
    document.getElementById("button-settings-apply").addEventListener("click", () => {
        dialog.open = false
        localStorage.setItem("token", tfToken.value)
        localStorage.setItem("localhostMode", cbLocalhostMode.checked)
        location.reload()
    })
})()

function randomUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

// 建立ws连接

let ws = new WebSocket("ws://" + location.host + "/ws/web")

ws.onopen = () => {
    console.log("ws连接成功")
    ws.send(JSON.stringify({ type: "auth_request", uuid: randomUUID(), data: { "token": token } }))
}

ws.onmessage = (event) => {
    const raw = JSON.parse(event.data)
    switch (raw.type) {
        case "auth_response": {
            if (raw.data.success == true) {
                init()
            }
            break
        }
        default: {
            console.warn("未知数据类型：" + JSON.stringify(raw))
            break
        }
    }
    ws.onclose = () => {
        console.log("ws连接断开")
    }
    ws.onerror = (event) => {
        console.log("ws连接出错：" + event)
    }
}

function get(target) {
    const uuid = randomUUID()
    ws.send(JSON.stringify({ type: "get_request", uuid: uuid, data: { target: target } }))
    return new Promise((resolve, reject) => {
        const handler = (event) => {
            const raw = JSON.parse(event.data)
            if (raw.type == "get_response" && raw.uuid == uuid && raw.success) {
                resolve(raw.data)
            } else {
                reject(raw)
            }
            ws.removeEventListener("message", handler)
        }
        ws.addEventListener("message", handler)
    })
}

async function init() {
    !(async function () {
        // 构建 Overview 页面
        const layout = await get("layout/overview")
        const e = document.getElementById("overview-content")
        console.log(layout)
        var result = ""
        for (let block of layout) {
            let inner = ""
            for (let item of block.content) {
                const template = await fetch(`ejs/${item.type}/${item.id}.ejs`).then(r => r.text())
                inner += ejs.render(template, item.config)
            }

            const blockTemplate = await fetch(`ejs/${block.type}.ejs`).then(r => r.text())
            result += ejs.render(blockTemplate, { inner: inner })
        }

        console.log(result)
        e.innerHTML = result
    })()
}
