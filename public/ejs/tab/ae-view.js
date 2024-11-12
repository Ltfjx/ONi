document.querySelectorAll(".ae__view-back").forEach(element => {
    element.addEventListener("click", event => {
        document.getElementById("ae__view").hidden = true
        document.getElementById("ae__list").hidden = false
        document.getElementById("ae__topbar").hidden = false
    })
})

globalAe.forEach(ae => {
    let target = Array.from(document.querySelectorAll(".ae__view")).find(element => element.querySelector("data").getAttribute("uuid") === ae.uuid)
    if (target) {
        aeEdit__renderCpusList(target, ae)
        aeEdit__renderItemList(target.querySelector(".ae__view-item-list"), ae)
    }
})

ws.addEventListener("message", async (event) => {
    const json = JSON.parse(event.data)
    if (json.type == "data/ae") {
        json.data.forEach(ae => {
            let target = Array.from(document.querySelectorAll(".ae__view")).find(element => element.querySelector("data").getAttribute("uuid") === ae.uuid)
            if (target) {
                aeEdit__renderCpusList(target, ae)
                aeEdit__renderItemList(target.querySelector(".ae__view-item-list"), ae)
            }
        })
    }
})

function aeEdit__renderCpusList(target, ae) {
    let _ = ""

    // if(ae)

    // element.querySelector(".ae__view-cpus").innerHTML = _
}

function aeEdit__renderItemList(target, ae) {
    let _ = ""

    if (ae.itemList) {
        ae.itemList.forEach(item => {
            _ += `
            <div style="position: relative;">
              <img src="./resources/itempanel/png/${item.id}_${item.damage}.png" style="height: 3rem;"></img>
              <div style="position: absolute;bottom: 0;right: 6px;text-align: right;">${item.amount}</div>
            </div>
            `
        })
    } else {
        _ += `
        <div style="opacity: 0.5;">
          ...
        </div>
        `
    }

    target.innerHTML = _
}