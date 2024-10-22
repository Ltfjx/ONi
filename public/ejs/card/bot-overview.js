Array.from(document.getElementById("bot__list").firstChild.children).forEach(element => {
    element.querySelector(".bot__button-edit").addEventListener("click", event => {
        let uuid = element.querySelector("data").getAttribute("uuid")
        document.querySelectorAll(".bot__edit").forEach(elementEdit => {
            if (elementEdit.querySelector("data").getAttribute("uuid") == uuid) {
                elementEdit.hidden = false
            } else {
                elementEdit.hidden = true
            }
        })
        document.getElementById("bot__edit").hidden = false
        document.getElementById("bot__list").hidden = true
    })
})