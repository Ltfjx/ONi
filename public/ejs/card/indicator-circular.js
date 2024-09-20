// 初始化卡片
document.querySelectorAll(".card-indicator-circular__card").forEach(element => {
    uuid = element.querySelector("data").getAttribute("target")
    let item = globalCommonData.find(item => item.uuid == uuid)
    if (item) {
        element.querySelector(".card-indicator-circular__title").innerHTML = item.name
    }
})

ws.addEventListener("message", async (event) => {
    const json = JSON.parse(event.data)
    if (json.type == "data/common") {
        document.querySelectorAll(".card-indicator-circular__card").forEach(element => {
            uuid = element.querySelector("data").getAttribute("target")
            bottom = element.querySelector("data").getAttribute("bottom")
            const { max, value, unit, avgIO } = json.data
            if (uuid == json.data.uuid) {
                element.querySelector(".card-indicator-circular__value").innerHTML = `${value}/${max} ${unit}`
                if (bottom == "avgIO") {
                    element.querySelector(".card-indicator-circular__bottom").innerHTML = `avg: ${avgIO} ${unit}/t`
                }
            }
        })
    }
})