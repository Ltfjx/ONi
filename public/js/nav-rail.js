// 导轨
!(function () {
    let railItems = ["overview", "events", "stats", "ae", "bot", "debug"]
    let railItemsDisplay = ["总览", "事件", "统计", "AE", "BOT", "调试"]
    function hideAll() {
        railItems.forEach(item => {
            document.getElementById(`${item}-content`).setAttribute("hidden", "true")
        })
    }
    railItems.forEach(item => {
        const e = document.getElementById(`rail-${item}`)
        e.addEventListener("click", () => {
            hideAll()
            document.getElementById(`${item}-content`).removeAttribute("hidden")
            toggleLeftNavi(false)
            document.getElementById("navi-label").innerText = railItemsDisplay[railItems.indexOf(item)]

            if (item == "debug") {
                // 滚动到底部
                document.getElementById("main-content-area").scrollTo({ top: document.getElementById("main-content-area").scrollHeight })
            } else {
                document.getElementById("main-content-area").scrollTo({ top: 0 })
            }
        })
        e.innerHTML = railItemsDisplay[railItems.indexOf(item)]
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