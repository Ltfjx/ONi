// 卡片更新监听事件
ws.addEventListener("message", async (event) => {
    const json = JSON.parse(event.data)
    if (json.type == "data/mcServerStatus") {
        document.querySelectorAll(".card-server-status__card").forEach(element => {

            const { ip, online, motd, players } = json.data

            // 更新文本
            element.querySelector(".card-server-status__status").innerHTML = online ? "运行正常" : "服务器离线"
            element.querySelector(".card-server-status__motd").innerHTML = motd
            element.querySelector(".card-server-status__online-players").innerHTML = `(${players.online}/${players.max})`
            element.querySelector(".card-server-status__players-list").innerHTML = players.list ? players.list.join(", ") : "无"

        })
    }
})

// 初始化卡片
document.querySelectorAll(".card-server-status__card").forEach(element => {

    const { ip, online, motd, players } = globalMcServerStatus

    // 更新文本
    element.querySelector(".card-server-status__ip").innerHTML = ip
    element.querySelector(".card-server-status__status").innerHTML = online ? "运行正常" : "服务器离线"
    element.querySelector(".card-server-status__motd").innerHTML = motd
    element.querySelector(".card-server-status__online-players").innerHTML = `(${players.online}/${players.max})`
    element.querySelector(".card-server-status__players-list").innerHTML = players.list ? players.list.join(", ") : "无"

})