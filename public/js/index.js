
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

// 建立ws连接

let ws = new WebSocket("ws://" + location.host + "/ws/web")

ws.onopen = () => {
    console.log("ws连接成功")
    ws.send(JSON.stringify({ type: "auth_request", data: { "token": token } }))
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
            console.warn("未知数据类型：" + data)
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
    ws.send(JSON.stringify({ type: "get_request", uuid: crypto.randomUUID(), data: { target: target } }))
    return new Promise((resolve, reject) => {
        const handler = (event) => {
            const raw = JSON.parse(event.data)
            if (raw.type == "get_response" && raw.uuid == uuid) {
                ws.removeEventListener("message", handler)
                if (raw.data.status == "success") {
                    resolve(raw.data.value)
                } else {
                    reject(raw.data.message)
                }
            }
        }
        ws.addEventListener("message", handler)
    })
}

function init() {
    get("test")
}
