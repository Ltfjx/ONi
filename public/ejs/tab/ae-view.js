document.querySelectorAll(".ae__view-back").forEach(element => {
    element.addEventListener("click", event => {
        document.getElementById("ae__view").hidden = true
        document.getElementById("ae__list").hidden = false
    })
})
