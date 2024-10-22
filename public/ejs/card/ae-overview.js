Array.from(document.getElementById("ae__list").firstChild.children).forEach(element => {
    element.querySelector(".ae__button-view").addEventListener("click", event => {
        let uuid = element.querySelector("data").getAttribute("uuid")
        document.querySelectorAll(".ae__view").forEach(elementView => {
            if (elementView.querySelector("data").getAttribute("uuid") == uuid) {
                elementView.hidden = false
            } else {
                elementView.hidden = true
            }
        })
        document.getElementById("ae__view").hidden = false
        document.getElementById("ae__list").hidden = true
        document.getElementById("ae__topbar").hidden = true
    })
    element.querySelector(".ae__button-edit").addEventListener("click", event => {
        let uuid = element.querySelector("data").getAttribute("uuid")
        document.querySelectorAll(".ae__edit").forEach(elementEdit => {
            if (elementEdit.querySelector("data").getAttribute("uuid") == uuid) {
                elementEdit.hidden = false
            } else {
                elementEdit.hidden = true
            }
        })
        document.getElementById("ae__edit").hidden = false
        document.getElementById("ae__list").hidden = true
        document.getElementById("ae__topbar").hidden = true
    })
})
