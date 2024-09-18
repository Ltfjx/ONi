
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
    ws.send(JSON.stringify({ type: "auth/request", uuid: randomUUID(), data: { "token": token } }))
}

ws.onmessage = (event) => {
    const raw = JSON.parse(event.data)
    if (raw.type == "auth/response") {
        if (raw.data.success == true) {
            user = raw.data.user
            console.log("用户认证成功：" + JSON.stringify(user))
        } else {
            document.getElementById("dialog-login").open = true
        }
    }

    ws.onclose = () => {
        console.log("ws连接断开")
    }

    ws.onerror = (event) => {
        console.log("ws连接出错：" + event)
    }
}


async function renderLayout(layout, element) {
    const componentList = await fetch("ejs/components.json").then(r => r.json())
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

    element.innerHTML = result

    scriptList.forEach(async (url) => {
        console.log(url)
        const script = await fetch(url).then(r => r.text())
        eval(script)
    })
}