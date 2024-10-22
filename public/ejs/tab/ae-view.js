document.querySelectorAll(".ae__view-back").forEach(element => {
    element.addEventListener("click", event => {
        document.getElementById("ae__view").hidden = true
        document.getElementById("ae__list").hidden = false
        document.getElementById("ae__topbar").hidden = false
    })
})

ws.addEventListener("message", async (event) => {
    const json = JSON.parse(event.data)
    if (json.type == "data/ae") {
        json.data.forEach(ae => {
            let target = Array.from(document.querySelectorAll(".ae__view")).find(element => element.querySelector("data").getAttribute("uuid") === ae.uuid)
            if (target) {
                aeEdit__renderCpusList(target, ae)
            }
        })
    }
})

function aeEdit__renderCpusList(target, ae) {
    let _ = ""

    // if(ae)

    element.querySelector(".ae__view-cpus").innerHTML = _
}