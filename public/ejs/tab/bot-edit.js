document.querySelectorAll(".bot__edit-back").forEach(element => {
    element.addEventListener("click", event => {
        document.getElementById("bot__edit").hidden = true
        document.getElementById("bot__list").hidden = false
    })
    globalBot.forEach(bot => {
        let target = Array.from(document.querySelectorAll(".bot__edit")).find(element => element.querySelector("data").getAttribute("uuid") === bot.uuid)
        if (target) {
            botEdit__renderComponentList(target, bot)
        }
    })
})

ws.addEventListener("message", async (event) => {
    const json = JSON.parse(event.data)
    if (json.type == "data/bot") {
        json.data.forEach(bot => {
            let target = Array.from(document.querySelectorAll(".bot__edit")).find(element => element.querySelector("data").getAttribute("uuid") === bot.uuid)
            if (target) {
                botEdit__renderComponentList(target, bot)
            }
        })
    }
})

document.querySelectorAll(".bot__edit-button-components-refresh").forEach(element => {
    element.addEventListener("click", async (event) => {
        const uuid = event.target.parentElement.parentElement.parentElement.querySelector("data").getAttribute("uuid")
        event.target.parentElement.querySelector("mdui-list").style.opacity = "0.5"
        event.target.setAttribute("loading", true)
        setTimeout(() => {
            event.target.parentElement.querySelector("mdui-list").style.opacity = "1"
            event.target.removeAttribute("loading")
            console.log("刷新超时")
        }, 10000)
        ws.send(JSON.stringify({
            "type": "oc/task",
            "target": uuid,
            "data": [
                {
                    "task": "component",
                    "interval": -1,
                    "taskUuid": randomUUID(),
                    "config": {}
                }
            ]
        }))
    })
})

function botEdit__renderComponentList(element, bot) {
    let _ = ""
    if (bot.components.length == 0) {
        _ = `
            <mdui-list-item style="opacity: 0.5;">
              <div style="display: flex;align-items: center;">
                <mdui-icon name="info" style="margin-right: 1rem;"></mdui-icon>
                <div>
                  <div>组件列表为空</div>
                  <div style="opacity: 0.25;font-size: smaller;">请检查 OC 状态</div>
                </div>
              </div>
            </mdui-list-item>
        `
    } else {
        bot.components.forEach(component => {
            let icon = "question_mark"
            switch (component.class) {
                case "volume":
                    icon = "save"
                    break
                case "communication":
                    icon = "wifi"
                    break
                case "memory":
                    icon = "sd_card"
                    break
                case "processor":
                    icon = "memory"
                    break
                case "input":
                    icon = "keyboard"
                    break
                case "system":
                    icon = "dns"
                    break
                case "display":
                    icon = "tv"
                    break
                case "bus":
                    icon = "cable"
                    break
            }
            _ += `
            <mdui-list-item>
              <div style="display: flex;align-items: center;">
                <mdui-icon name="${icon}" style="margin-right: 1rem;"></mdui-icon>
                <div>
                  <div>${component.description} (${component.class})</div>
                  <div style="opacity: 0.25;font-size: smaller;">${component.uuid}</div>
                </div>
              </div>
            </mdui-list-item>
            `
        })

    }
    element.querySelector(".bot__edit-components").innerHTML = _
    element.querySelector(".bot__edit-components").style.opacity = "1"
    element.querySelector(".bot__edit-button-components-refresh").removeAttribute("loading")
}