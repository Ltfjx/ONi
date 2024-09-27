document.querySelectorAll(".bot__edit-back").forEach(element => {
    element.addEventListener("click", event => {
        document.getElementById("bot__edit").hidden = true
        document.getElementById("bot__list").hidden = false
    })
})