
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
    const json = JSON.parse(event.data)
    if (json.type == "auth/response") {
        if (json.data.user != undefined) {
            user = json.data.user
            console.log("用户认证成功：" + JSON.stringify(user))
        } else {
            document.getElementById("dialog-login").open = true
        }
    }

    ws.onclose = () => {
        mdui.snackbar({
            message: "WebSocket 连接已断开，请刷新页面。",
            autoCloseDelay: 0,
            closeable: true
        })
        // 向网页添加半透明遮罩层
        document.getElementById("bg-texture").children[0].setAttribute("hidden", true)
        document.getElementById("bg-texture").children[1].removeAttribute("hidden")
        document.getElementById("bg-texture").style.opacity = "0.15"
        console.log("ws连接断开")
    }

    ws.onerror = (event) => {
        console.log("ws连接出错：" + event)
    }
}

// 渲染布局
async function renderLayout(layout, element, animation = true) {
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

    if (animation) { generateLayoutAnimation(element) }
}

// 布局动画生成
function generateLayoutAnimation(element) {
    Array.from(element.children).forEach((block, indexBlock) => {
        if (block.classList.contains("grid-full")) {
            block.classList.add("animate__animated", "animate__fadeIn", "animate__faster")
        } else {
            Array.from(block.children).forEach((card, indexCard) => {
                card.style.animationDelay = `${(indexCard) * 0.03}s`
                card.classList.add("animate__animated", "animate__fadeInUp", "animate__faster")
            })
        }
    })
}

function numberDisplayConvert(number) {
    const unitList = ["", "K", "M", "G", "T", "P"]

    var digit = Math.floor(Math.log10(number))
    var grade = (digit - digit % 3) / 3

    if (number < 10000) {
        return number
    }

    if (digit % 3 == 0) {
        return (number / Math.pow(10, digit)).toFixed(1) + unitList[grade]
    }

    return (number / Math.pow(10, grade * 3)).toFixed(0) + unitList[grade]
}