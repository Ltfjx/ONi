// 导轨
!(function () {

    let debugMode = document.getElementById("navi-drawer").querySelector("data").getAttribute("debugMode")

    let railItems = ["overview", "events", "control", "ae", "bot", "stats"]
    let railItemsDisplay = ["总览", "事件", "控制", "AE", "BOT", "统计"]
    let railItemsIcon = ["home--outlined", "crisis_alert", "tune--outlined", "grid_on--outlined", "adb--outlined", "insert_chart--outlined"]

    if(debugMode == "true"){
        railItems.push("debug")
        railItemsDisplay.push("调试")
        railItemsIcon.push("terminal--outlined")
    }

    const rail = document.getElementById("navi-rail")
    railItems.forEach((item, i) => {
        const node = document.createElement("mdui-navigation-rail-item")
        node.id = `rail-${item}`
        node.icon = `${railItemsIcon[i]}`
        node.innerHTML = railItemsDisplay[i]
        rail.appendChild(node)
    })

    function hideAll() {
        railItems.forEach(item => {
            document.getElementById(`${item}__content`).setAttribute("hidden", "true")
        })
    }

    railItems.forEach(item => {
        const e = document.getElementById(`rail-${item}`)
        e.addEventListener("click", () => {
            hideAll()
            document.getElementById(`${item}__content`).removeAttribute("hidden")
            toggleLeftNavi(false)
            document.getElementById("navi-label").innerText = railItemsDisplay[railItems.indexOf(item)]

            // if (item == "debug") {
            //     // 滚动到底部
            //     document.getElementById("main-content-area").scrollTo({ top: document.getElementById("main-content-area").scrollHeight })
            // } else {
                document.getElementById("main-content-area").scrollTo({ top: 0 })
            // }
        })
    })
    document.getElementById(`rail-${railItems[0]}`).click()
})()

// 导轨双方案切换
if (window.innerWidth / window.innerHeight > 0.7) {
    console.log("横屏")

    const drawer = document.getElementById('navi-drawer')
    const rail = document.getElementById('navi-rail')

    drawer.removeChild(rail)
    drawer.parentNode.insertBefore(rail, drawer)

    document.getElementById("navi-toggler").style["display"] = "none"
    rail.placement = "left"
}