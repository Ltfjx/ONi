!(function () {

})()

var dialog__botTaskShowHidden = false

function dialog__botTaskUpdate(data) {
    var taskListElement = document.getElementById("bot__task-dialog-list")
    var taskString = ""
    if (!data) { data = globalBotTask }
    data.forEach(task => {
        var modeString = ""
        task.mode.filter(mode => {
            if (mode.hidden == true && !dialog__botTaskShowHidden) { return false } else { return true }
        }).forEach(mode => {
            modeString += `
            <mdui-list-item style="opacity: ${mode.hidden ? 0.4 : 1};">
                <div>${mode.id}</div>
                <div style="opacity: 0.5;">${mode.description}</div>
            </mdui-list-item>
            `
        })
        taskString += `
        <mdui-collapse-item>
            <mdui-list-item slot="header" icon="${task.icon}">
                <div>${task.id}</div>
                <div style="opacity: 0.5;">${task.description}</div>
            </mdui-list-item>
            <div style="margin-left: 3rem">
                ${modeString}
            </div>
        </mdui-collapse-item>
        `
    })
    taskListElement.innerHTML = taskString
}


document.getElementById("bot__task-dialog-show-hidden-switch").addEventListener("change", event => {
    dialog__botTaskShowHidden = event.target.checked
    dialog__botTaskUpdate()
})  