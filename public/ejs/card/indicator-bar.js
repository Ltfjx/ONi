// 卡片更新监听事件
ws.addEventListener("message", async (event) => {
    const json = JSON.parse(event.data)
    if (json.type == "data/common") {
        document.querySelectorAll(".card-indicator-bar__card").forEach(element => {

            uuid = element.querySelector("data").getAttribute("target")

            const target = json.data.find(item => item.uuid == uuid)

            if (target) {
                const { max, value, unit, avgIO } = target

                // 更新文本
                element.querySelector(".card-indicator-bar__value").innerHTML = `${value}/${max} ${unit}`
                element.querySelector(".card-indicator-bar__percent").innerHTML = `${((value / max) * 100).toFixed(2)} %`


                // 更新进度条
                element.querySelector(".card-indicator-bar__indicator").value = (value / max) * 100

            }
        })
    }
})

// 初始化卡片
document.querySelectorAll(".card-indicator-bar__card").forEach(element => {

    uuid = element.querySelector("data").getAttribute("target")

    let target = globalCommonData.find(item => item.uuid == uuid)
    if (target) {
        element.querySelector(".card-indicator-bar__title").innerHTML = target.name

        const { max, value, unit, avgIO } = target

        if (value) {
            // 更新文本
            element.querySelector(".card-indicator-bar__value").innerHTML = `${value}/${max} ${unit}`
            element.querySelector(".card-indicator-bar__percent").innerHTML = `${((value / max) * 100).toFixed(2)} %`

            // 更新进度条
            element.querySelector(".card-indicator-bar__indicator").value = (value / max) * 100

        } else {

            element.querySelector(".card-indicator-bar__indicator").value = 0

        }



    }
})