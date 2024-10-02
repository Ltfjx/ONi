var cardIndicatorCircular__list = []

// 卡片更新监听事件
ws.addEventListener("message", async (event) => {
    const json = JSON.parse(event.data)
    if (json.type == "data/common") {
        document.querySelectorAll(".card-indicator-circular__card").forEach(element => {

            let uuid = element.querySelector("data").getAttribute("uuid")
            bottom = element.querySelector("data").getAttribute("bottom")

            const target = json.data.find(item => item.uuid == uuid)

            if (target) {
                const { max, value, unit, avgIO } = target

                // 更新文本
                element.querySelector(".card-indicator-circular__value").innerHTML = `${value}/${max} ${unit}`
                if (bottom == "avgIO") {
                    element.querySelector(".card-indicator-circular__bottom").innerHTML = `avg: ${avgIO} ${unit}/t`
                }

                // 更新环形进度条
                cardIndicatorCircular__list[uuid].animate(value / max)

            }
        })
    }
})

// 初始化卡片
document.querySelectorAll(".card-indicator-circular__card").forEach(element => {

    let uuid = element.querySelector("data").getAttribute("uuid")
    bottom = element.querySelector("data").getAttribute("bottom")

    let target = globalCommonData.find(item => item.uuid == uuid)
    if (target) {
        element.querySelector(".card-indicator-circular__title").innerHTML = target.name
        const indicator = element.querySelector(".card-indicator-circular__indicator")

        // 构建环形进度条
        cardIndicatorCircular__list[uuid] = new ProgressBar.Circle(indicator, {
            color: '#aaa',
            strokeWidth: 4,
            trailWidth: 2,
            easing: 'easeInOut',
            duration: 1400,
            text: {
                style: {
                    color: '#999',
                    fontSize: '2rem',
                    textAlign: 'center',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }
            },
            from: { color: '#f55' },
            to: { color: '#5f5' },

            step: function (state, circle) {
                circle.path.setAttribute('stroke', state.color)

                var value = Math.round(circle.value() * 100)
                circle.setText(value + "%")

            }
        })

        const { max, value, unit, avgIO } = target

        if (value) {
            // 更新文本
            element.querySelector(".card-indicator-circular__value").innerHTML = `${value}/${max} ${unit}`
            if (bottom == "avgIO") {
                element.querySelector(".card-indicator-circular__bottom").innerHTML = `avg: ${avgIO} ${unit}/t`
            }

            // 更新环形进度条
            cardIndicatorCircular__list[uuid].animate(value / max)
        } else {
            cardIndicatorCircular__list[uuid].setText("N/A")
        }



    }
})