document.querySelectorAll(".ae__edit-back").forEach(element => {
    element.addEventListener("click", event => {
        document.getElementById("ae__edit").hidden = true
        document.getElementById("ae__list").hidden = false
        document.getElementById("ae__topbar").hidden = false
    })
})