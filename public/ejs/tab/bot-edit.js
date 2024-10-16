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

function botEdit__renderComponentList(element, bot) {
    let _ = ""
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
    element.querySelector(".bot__edit-components").innerHTML = _
}