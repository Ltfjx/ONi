
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

    document.getElementById("buttonSettings").addEventListener("click", () => {
        dialog.open = true
        tfToken.value = token
    })
    document.getElementById("button-settings-discard").addEventListener("click", () => {
        dialog.open = false
    })
    document.getElementById("button-settings-apply").addEventListener("click", () => {
        dialog.open = false
        localStorage.setItem("token", tfToken.value)
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

var user = {}

let ws = new WebSocket("ws://" + location.host + "/ws/web")

ws.onopen = () => {
    console.log("ws连接成功")
    ws.send(JSON.stringify({ type: "auth_request", uuid: randomUUID(), data: { "token": token } }))
}

ws.onmessage = (event) => {
    const raw = JSON.parse(event.data)
    if (raw.type == "auth_response") {
        if (raw.data.success == true) {
            user = raw.data.user
            init()
        } else {
            document.getElementById("dialog-login").open = true
        }
    } else if (raw.type == "event_log") {
        debug__addLog(raw.data)
    }
    else {
        console.warn("未知数据类型：" + JSON.stringify(raw))

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

            if (raw.type === "get_response" && raw.uuid === uuid) {
                ws.removeEventListener("message", handler)

                if (raw.success) {
                    resolve(raw.data)
                } else {
                    reject(raw)
                }
            }
        }

        ws.addEventListener("message", handler)
    })
}


async function init() {
    console.log("初始化")
    !(async function () {
        // 构建 Overview 页面
        const layout = await get("layout/overview")
        const componentList = await fetch("ejs/components.json").then(r => r.json())
        const e = document.getElementById("overview-content")
        console.log(layout)
        var result = ""
        var scriptList = new Set()
        for (let block of layout) {
            let inner = ""
            for (let item of block.content) {
                const template = await fetch(`ejs/${item.type}/${item.id}.ejs`).then(r => r.text())
                if (componentList.item[item.type].filter(c => c.id == item.id)[0].have_script) {
                    scriptList.add(`ejs/${item.type}/${item.id}.js`)
                }
                inner += ejs.render(template, item.config)
            }

            const blockTemplate = await fetch(`ejs/${block.type}.ejs`).then(r => r.text())
            result += ejs.render(blockTemplate, { inner: inner })
        }


        scriptList.forEach(async (url) => {
            console.log(url)
            const script = await fetch(url).then(r => r.text())
            eval(script)
        })


        e.innerHTML = result
    })()

    !(async function () {
        const raw = await get("logs/main")
        debug__addLog(raw.lines + "---------------- 以上为历史日志 ----------------")
    })()
}
