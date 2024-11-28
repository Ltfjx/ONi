!(function () {

})()

// BOT TASK START

var dialog__botTaskShowHidden = false
var dialog__botTaskSelectedTask = null
var dialog__botTaskOutput = ""

function dialog__botTaskUpdate(data) {
    let btnNext = document.getElementById("bot__task-dialog-step1-next-button")
    btnNext.disabled = true
    btnNext.innerHTML = "下一步"

    var taskListElement = document.getElementById("bot__task-dialog-step1-list")
    var taskString = ""
    if (!data) { data = globalBotTask }
    data.forEach(task => {
        var modeString = ""
        task.mode.filter(mode => {
            if (mode.hidden == true && !dialog__botTaskShowHidden) { return false } else { return true }
        }).forEach(mode => {
            modeString += `
            <mdui-list-item style="opacity: ${mode.hidden ? 0.4 : 1};" value="${mode.id}" class="bot__task-task-mode-item">
                <div>${mode.id}</div>
                <div style="opacity: 0.5;">${mode.description}</div>
                <mdui-icon slot="end-icon" name="radio_button_unchecked"></mdui-icon>
            </mdui-list-item>
            `
        })
        taskString += `
        <mdui-collapse-item value="${task.id}">
            <mdui-list-item slot="header" icon="${task.icon}">
                <div>${task.id}</div>
                <div style="opacity: 0.5;">${task.description}</div>
                <mdui-icon slot="end-icon" name="keyboard_arrow_down"></mdui-icon>
            </mdui-list-item>
            <div style="margin-left: 3rem">
                ${modeString}
            </div>
        </mdui-collapse-item>
        `
    })
    taskListElement.innerHTML = taskString

    document.getElementById("bot__task-dialog-step1-list").addEventListener("change", event => {
        Array.from(document.getElementById("bot__task-dialog-step1-list").children).forEach(element => {
            if (element.value == event.target.value) {
                element.querySelector("mdui-icon").setAttribute("name", "keyboard_arrow_up")
            } else {
                element.querySelector("mdui-icon").setAttribute("name", "keyboard_arrow_down")
            }
        })
    })

    Array.from(document.querySelectorAll(".bot__task-task-mode-item")).forEach(element1 => {
        element1.addEventListener("click", event => {
            Array.from(document.querySelectorAll(".bot__task-task-mode-item")).forEach(element2 => {
                element2.querySelector("mdui-icon").setAttribute("name", "radio_button_unchecked")
            })
            event.currentTarget.querySelector("mdui-icon").setAttribute("name", "radio_button_checked")
            dialog__botTaskSelectedTask = `${event.currentTarget.parentNode.parentNode.value}.${event.currentTarget.getAttribute("value")}`

            btnNext.disabled = false
            btnNext.innerHTML = `下一步 (${dialog__botTaskSelectedTask})`
        })
    })
}




document.getElementById("bot__task-dialog-step1-show-hidden-switch").addEventListener("change", event => {
    dialog__botTaskShowHidden = event.target.checked
    dialog__botTaskUpdate()
})

document.getElementById("bot__task-dialog-step1-next-button").addEventListener("click", event => {

    step1Element = document.getElementById("bot__task-dialog-step1")
    step2Element = document.getElementById("bot__task-dialog-step2")

    let mode = globalBotTask.find(task => task.id == dialog__botTaskSelectedTask.split(".")[0])
        .mode.find(mode => mode.id == dialog__botTaskSelectedTask.split(".")[1])

    const icon = globalBotTask.find(task => task.id == dialog__botTaskSelectedTask.split(".")[0]).icon

    document.getElementById("bot__task-dialog-step2-icon").setAttribute("name", icon)
    document.getElementById("bot__task-dialog-step2-id").innerHTML = dialog__botTaskSelectedTask
    document.getElementById("bot__task-dialog-step2-description").innerHTML = mode.description

    let configString = ""

    if (mode.config.length == 0) {
        configString = `
        <div style="margin-top: 1rem;opacity: 0.5;text-align: center;">
            此模式无配置项
        </div>`
    } else {
        mode.config.forEach(config => {
            const title = config.id
            const type = `${config.type}${!config.required ? "?" : ""}`
            const description = config.description
            if (config.type == "string") {
                configString += `
                <div style="display: flex;margin-top: 1rem;align-items: center;" config-id="${config.id}" config-type="${config.type}" config-required="${config.required}">
                    <div>
                        <div>${title}<span style="margin-left: 0.5rem;opacity: 0.5;font-size: small;">${type}</span></div>
                        <div style="opacity: 0.5;font-size: small;">${description}</div>
                    </div>
                    <mdui-text-field style="margin-left: auto;width: 10rem;" variant="outlined" clearable></mdui-text-field>
                </div>
                `
            } else if (config.type == "number") {
                configString += `
                <div style="display: flex;margin-top: 1rem;align-items: center;" config-id="${config.id}" config-type="${config.type}" config-required="${config.required}">
                    <div>
                        <div>${title}<span style="margin-left: 0.5rem;opacity: 0.5;font-size: small;">${type}</span></div>
                        <div style="opacity: 0.5;font-size: small;">${description}</div>
                    </div>
                    <mdui-text-field style="margin-left: auto;width: 10rem;" type="number" variant="outlined" clearable></mdui-text-field>
                </div>
                `
            } else if (config.type == "boolean") {
                configString += `
                <div style="display: flex;margin-top: 1rem;align-items: center;" config-id="${config.id}" config-type="${config.type}" config-required="${config.required}">
                    <div>
                        <div>${title}<span style="margin-left: 0.5rem;opacity: 0.5;font-size: small;">${type}</span></div>
                        <div style="opacity: 0.5;font-size: small;">${description}</div>
                    </div>
                    <mdui-switch checked style="margin-left: auto;"></mdui-switch>
                </div>
                `
            } else if (config.type == "redstoneUuid") {
                configString += `
                <div style="display: flex;margin-top: 1rem;align-items: center;" config-id="${config.id}" config-type="${config.type}" config-required="${config.required}">
                    <div>
                        <div>${title}<span style="margin-left: 0.5rem;opacity: 0.5;font-size: small;">${type}</span></div>
                        <div style="opacity: 0.5;font-size: small;">${description}</div>
                    </div>
                    <mdui-select end-icon="keyboard_arrow_down" style="margin-left: auto;width: 10rem;" variant="outlined" value="item-1">
                        <mdui-menu-item value="item-1">Item 1</mdui-menu-item>
                        <mdui-menu-item value="item-2">Item 2</mdui-menu-item>
                    </mdui-select>
                </div>
                `
            } else if (config.type == "aeUuid") {
                configString += `
                <div style="display: flex;margin-top: 1rem;align-items: center;" config-id="${config.id}" config-type="${config.type}" config-required="${config.required}">
                    <div>
                        <div>${title}<span style="margin-left: 0.5rem;opacity: 0.5;font-size: small;">${type}</span></div>
                        <div style="opacity: 0.5;font-size: small;">${description}</div>
                    </div>
                    <mdui-select end-icon="keyboard_arrow_down" style="margin-left: auto;width: 10rem;" variant="outlined" value="item-1">
                        <mdui-menu-item value="item-1">Item 1</mdui-menu-item>
                        <mdui-menu-item value="item-2">Item 2</mdui-menu-item>
                    </mdui-select>
                </div>
                `
            }
        })
    }

    document.getElementById("bot__task-dialog-step2-config-list").innerHTML = configString

    step1Element.open = false
    setTimeout(() => {
        step2Element.open = true
    }, 100)
})

document.getElementById("bot__task-dialog-step2-back-button").addEventListener("click", event => {
    document.getElementById("bot__task-dialog-step2").open = false
    setTimeout(() => {
        document.getElementById("bot__task-dialog-step1").open = true
    }, 100)
})

document.getElementById("bot__task-dialog-step2-next-button").addEventListener("click", event => {
    let ok = true

    let config = {}
    Array.from(document.getElementById("bot__task-dialog-step2-config-list").children).forEach(element => {
        const id = element.getAttribute("config-id")
        const type = element.getAttribute("config-type")
        const required = element.getAttribute("config-required")

        let value = null

        if (type == "string") {
            value = element.querySelector("mdui-text-field").value
        } else if (type == "number") {
            value = element.querySelector("mdui-text-field").value
        } else if (type == "boolean") {
            value = element.querySelector("mdui-switch").checked
        } else if (type == "redstoneUuid") {
            value = element.querySelector("mdui-select").value
        } else if (type == "aeUuid") {
            value = element.querySelector("mdui-select").value
        }

        if (!value && required == "true") {
            if (element.classList.contains("animate__animated") == false) {
                element.classList.add("animate__animated", "animate__headShake")
                setTimeout(() => {
                    element.classList.remove("animate__animated", "animate__headShake")
                }, 1000)
            }
            ok = false
            return
        } else if (value) {
            config[id] = value
        }
    })

    let globalConfig = {}
    Array.from(document.getElementById("bot__task-dialog-step2-global-config-list").children).forEach(element => {
        const id = element.getAttribute("global-config-id")
        const type = element.getAttribute("global-config-type")
        const required = element.getAttribute("global-config-required")

        let value = null

        if (type == "string") {
            value = element.querySelector("mdui-text-field").value
        } else if (type == "number") {
            value = element.querySelector("mdui-text-field").value
        } else if (type == "boolean") {
            value = element.querySelector("mdui-switch").checked
        }

        if (!value && required == "true") {
            if (element.classList.contains("animate__animated") == false) {
                element.classList.add("animate__animated", "animate__headShake")
                setTimeout(() => {
                    element.classList.remove("animate__animated", "animate__headShake")
                }, 1000)
            }
            ok = false
            return
        } else if (value) {
            globalConfig[id] = value
        }

    })



    console.log(config, globalConfig)

    if (ok) {
        dialog__botTaskOutput = {
            task: dialog__botTaskSelectedTask.split(".")[0],
            ...globalConfig,
            config: { mode: dialog__botTaskSelectedTask.split(".")[1], ...config }
        }
        document.getElementById("bot__task-dialog-step3-preview").innerHTML = JSON.stringify(dialog__botTaskOutput, null, 4)
        document.getElementById("bot__task-dialog-step2").open = false
        setTimeout(() => {
            document.getElementById("bot__task-dialog-step3").open = true
        }, 100)
    }
})

document.getElementById("bot__task-dialog-step3-back-button").addEventListener("click", event => {
    document.getElementById("bot__task-dialog-step3").open = false
    setTimeout(() => {
        document.getElementById("bot__task-dialog-step2").open = true
    }, 100)
})

// BOT TASK END


// AE ITEM INFO START

function dialog__aeShowItemInfo(aeuuid, id, type) {
    let item = globalAe.find(ae => ae.uuid == aeuuid).itemList.find(item => item.id == id)
    let link = ""

    if (type == "item") {
        link = `item/${item.id}_${item.damage}.png`
    } else if (type == "fluid") {
        link = `fluid/${item.id}.png`
    } else if (type == "vis") {
        link = `vis/${item.id}.png`
    }

    document.getElementById("ae__item-info-dialog-display").innerHTML = item.display
    document.getElementById("ae__item-info-dialog-amount").innerHTML = numberDisplayConvert(item.amount)
    document.getElementById("ae__item-info-dialog-icon").setAttribute("src", `./resources/itempanel/${link}`)
    document.getElementById("ae__item-info-dialog-request-button").disabled = !item.craftable

    document.getElementById("ae__item-info-dialog").open = true
}

document.getElementById("ae__item-info-dialog-close-button").addEventListener("click", event => {
    document.getElementById("ae__item-info-dialog").open = false
})

document.getElementById("ae__item-info-dialog-request-button").addEventListener("click", event => {
    document.getElementById("ae__item-info-dialog").open = false
})

// AE ITEM INFO END