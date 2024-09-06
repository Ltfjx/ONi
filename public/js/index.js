


// 深色模式
!(function () {
    const darkMode = localStorage.getItem('darkMode')
    if (darkMode === 'true' || (darkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.getElementById("buttonDarkMode").icon = "light_mode"
        mdui.setTheme("dark")
    }
})()

document.getElementById("buttonDarkMode").addEventListener("click", () => {

    if (mdui.getTheme() == "light") {
        document.getElementById("buttonDarkMode").icon = "light_mode"
        localStorage.setItem('darkMode', 'true')
        mdui.setTheme("dark")
    } else {
        document.getElementById("buttonDarkMode").icon = "dark_mode"
        localStorage.setItem('darkMode', 'false')
        mdui.setTheme("light")
    }
})

// Slogan
!(function () {
    function isMobileDevice() {
        const ua = navigator.userAgent.toLowerCase()
        const kw = ['iphone', 'ipod', 'android', 'windows phone', 'blackberry', 'mobile']
        return kw.some(keyword => ua.includes(keyword))
    }
    if (!isMobileDevice()) {
        const slogan = ["豆！豆！痛いよ！", "人間！妖怪！誰でも歓迎！"]
        let elem = document.getElementById("slogan")
        elem.innerText = `"${slogan[Math.floor(Math.random() * slogan.length)]}"`
    }

})()

// 配色自定义系统
!(function () {
    let colorPicker = document.getElementById("colorPicker")
    let color = localStorage.getItem("customColor")
    if (color != undefined) {
        mdui.setColorScheme(color)
    }
    colorPicker.addEventListener('input', function () {
        mdui.setColorScheme(colorPicker.value)
        localStorage.setItem("customColor", colorPicker.value)
    })
    document.getElementById("buttonColor").addEventListener("click", () => {
        colorPicker.click()
    })
})()


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
        document.getElementById(`rail-${item}`).addEventListener("click", () => {
            hideAll()
            document.getElementById(`${item}-content`).removeAttribute("hidden")
            toggleLeftNavi(false)
            document.getElementById("navi-label").innerText = railItemsDisplay[railItems.indexOf(item)]
        })
    })
    document.getElementById(`rail-${railItems[0]}`).click()
})()

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


