var aeView__filter = []
var aeView__itemsPerPage = 40
var aeView__cpusPerPage = 8

document.querySelectorAll(".ae__view-back").forEach(element => {
    element.addEventListener("click", event => {
        document.getElementById("ae__view").hidden = true
        document.getElementById("ae__list").hidden = false
        document.getElementById("ae__topbar").hidden = false
    })
})

globalAe.forEach(ae => {
    aeView__filter.push({
        uuid: ae.uuid,
        filter: {
            type: "all", // all | item | fluid | vis
            craftable: "all", // all | yes 只显示可合成 | no 只显示库存
            sort: "amount", // amount | amountr | id | idr
            word: "", // 搜索词
            page: 1 // 页码
        },
        cpusShowMore: false
    })

    aeView__renderCpusList(ae.uuid, ae)
    aeView__renderItemList(ae.uuid, ae)
})


document.querySelectorAll(".ae__view").forEach(aeview => {

    const uuid = aeview.querySelector("data").getAttribute("uuid")
    let filter = aeView__filter.find(ae => ae.uuid == uuid).filter

    aeview.querySelectorAll(".ae__view-storage-filter-button").forEach(button => {
        button.addEventListener("click", event => {
            filter.type = event.target.getAttribute("filter")
            aeview.querySelectorAll(".ae__view-storage-filter-button").forEach(button => {
                button.removeAttribute("selected")
            })
            event.target.setAttribute("selected", undefined)
            aeView__renderItemList(uuid)
        })
    })

    aeview.querySelector(".ae__view-storage-filter-craftable-button").addEventListener("click", event => {

        if (filter.craftable == "all") {
            filter.craftable = "yes"
        } else if (filter.craftable == "yes") {
            filter.craftable = "no"
        } else if (filter.craftable == "no") {
            filter.craftable = "all"
        }

        if (filter.craftable == "all") {
            event.target.innerHTML = "库存 / 可合成"
        } else if (filter.craftable == "yes") {
            event.target.innerHTML = "仅可合成"
        } else if (filter.craftable == "no") {
            event.target.innerHTML = "仅库存"
        }

        filter.page = 1
        aeView__renderItemList(uuid)
    })

    aeview.querySelector(".ae__view-storage-filter-sort-button").addEventListener("click", event => {

        if (filter.sort == "amount") {
            filter.sort = "amountr"
        } else if (filter.sort == "amountr") {
            filter.sort = "id"
        } else if (filter.sort == "id") {
            filter.sort = "idr"
        } else if (filter.sort == "idr") {
            filter.sort = "amount"
        }

        if (filter.sort == "amount") {
            event.target.innerHTML = "数量排序 ↓"
        } else if (filter.sort == "amountr") {
            event.target.innerHTML = "数量排序 ↑"
        } else if (filter.sort == "id") {
            event.target.innerHTML = "ID 排序 ↓"
        } else if (filter.sort == "idr") {
            event.target.innerHTML = "ID 排序 ↑"
        }

        filter.page = 1
        aeView__renderItemList(uuid)
    })

    aeview.querySelector(".ae__view-storage-filter-search-input").addEventListener("input", mdui.throttle(event => {
        filter.word = event.target.value
        filter.page = 1
        aeView__renderItemList(uuid)
    }, 100))

    aeview.querySelector(".ae__view-item-list-more-button").addEventListener("click", event => {
        filter.page += 1
        aeView__renderItemList(uuid)
    })

    aeview.querySelector(".ae__view-cpu-list-more-button").addEventListener("click", event => {
        aeView__filter.find(ae => ae.uuid == uuid).cpusShowMore = true
        aeview.querySelector(".ae__view-cpu-list-more-button").style["display"] = "none"
        aeview.querySelector(".ae__view-cpu-list-less-button").style["display"] = "block"
        aeView__renderCpusList(uuid)
    })

    aeview.querySelector(".ae__view-cpu-list-less-button").addEventListener("click", event => {
        aeView__filter.find(ae => ae.uuid == uuid).cpusShowMore = false
        aeview.querySelector(".ae__view-cpu-list-more-button").style["display"] = "block"
        aeview.querySelector(".ae__view-cpu-list-less-button").style["display"] = "none"
        aeView__renderCpusList(uuid)
    })
})

ws.addEventListener("message", async (event) => {
    const json = JSON.parse(event.data)
    if (json.type == "data/ae") {
        json.data.forEach(ae => {
            aeView__renderCpusList(ae.uuid, ae)
            aeView__renderItemList(ae.uuid, ae)
        })
    }
})

function aeView__renderCpusList(target, ae) {
    let _ = ""

    let targetElement = Array.from(
        document.querySelectorAll(".ae__view"))
        .find(element => element.querySelector("data").getAttribute("uuid") === target)
        .querySelector(".ae__view-cpu-list")

    let targetElementNothing = Array.from(
        document.querySelectorAll(".ae__view"))
        .find(element => element.querySelector("data").getAttribute("uuid") === target)
        .querySelector(".ae__view-cpu-list-nothing")

    let targetElementShowMore = Array.from(
        document.querySelectorAll(".ae__view"))
        .find(element => element.querySelector("data").getAttribute("uuid") === target)
        .querySelector(".ae__view-cpu-list-more-button")

    let targetElementShowLess = Array.from(
        document.querySelectorAll(".ae__view"))
        .find(element => element.querySelector("data").getAttribute("uuid") === target)
        .querySelector(".ae__view-cpu-list-less-button")

    if (!ae) {
        ae = globalAe.find(a => a.uuid === target)
    }

    var aeCpus = ae.cpus.sort((a, b) => {
        if (a.busy && b.busy) {
            return 0
        } else if (a.busy) {
            return -1
        }
    })

    if (aeCpus.length <= aeView__cpusPerPage) {
        targetElementShowMore.style["display"] = "none"
        targetElementShowLess.style["display"] = "none"
    }

    if (!aeView__filter.find(ae => ae.uuid === target).cpusShowMore) {
        aeCpus = aeCpus.slice(0, aeView__cpusPerPage)
    }

    if (aeCpus.length === 0) {
        targetElementNothing.style["display"] = "block"
        targetElement.style["display"] = "none"
    } else {
        targetElementNothing.style["display"] = "none"
        targetElement.style["display"] = "grid"

        aeCpus.forEach((cpu, i) => {
            const icon = cpu.busy ? "settings_suggest" : "download_done"
            const iconBig = cpu.busy ? "hourglass_bottom" : "schedule"
            const nameStr = cpu.name ? `- "${cpu.name}"` : ""
            const statusStr = cpu.busy ? "合成中 · 1 分钟" : `空闲 · ${cpu.storage / 1024}K`
            const finalOutput = cpu.busy ? `<div style="margin-top: .5rem;margin-bottom: .5rem;"><b>${cpu.finalOutput.display}</b> - 0 / 1</div>` : ""
            const progressBar = cpu.busy ? `
            <div style="display: flex;align-items: center;margin-bottom: 0.25rem;">
                <div style="opacity: 0.5;">69%&nbsp;&nbsp;</div>
                <mdui-linear-progress value="0" max="1"></mdui-linear-progress>
            </div>` : ""

            _ += `
            <mdui-card style="padding: 1rem;padding-left: 1.25rem;padding-right: 1.25rem">
              <div style="display: flex;align-items: center;">
                <mdui-icon name="${iconBig}" style="position: absolute;top: 1rem;right: 1rem;opacity: 0.1;font-size: 3rem;"></mdui-icon>
                <mdui-icon name="${icon}"></mdui-icon>
                &nbsp;&nbsp;
                <div>
                  <div>CPU ${i} <span style="opacity: 0.7">${nameStr}</span></div>
                  <div style="font-weight: normal;font-size: .8rem;opacity: 0.5">${statusStr}</div>
                </div>
              </div>
              ${finalOutput}
              ${progressBar}
            </mdui-card>
            `
        })

    }


    targetElement.innerHTML = _

}

// target: 目标 ae uuid
// ae: 目标 ae 数据，留空则从全局 ae 列表中获取
function aeView__renderItemList(target, ae) {
    let _ = ""

    let targetElement = Array.from(
        document.querySelectorAll(".ae__view"))
        .find(element => element.querySelector("data").getAttribute("uuid") === target)
        .querySelector(".ae__view-item-list")

    let targetElementNothing = Array.from(
        document.querySelectorAll(".ae__view"))
        .find(element => element.querySelector("data").getAttribute("uuid") === target)
        .querySelector(".ae__view-item-list-nothing")

    let targetElementShowMore = Array.from(
        document.querySelectorAll(".ae__view"))
        .find(element => element.querySelector("data").getAttribute("uuid") === target)
        .querySelector(".ae__view-item-list-more-button")


    if (!ae) {
        ae = globalAe.find(a => a.uuid === target)
    }

    const filter = aeView__filter.find(ae => ae.uuid === target).filter

    const itemListFiltered = ae.itemList.filter(item => {
        if (filter.type === "all") {
            return true
        } else if (filter.type === "item") {
            if (item.isFluid) {
                return false
            } else {
                return true
            }
        } else if (filter.type === "fluid") {
            if (item.isFluid) {
                return true
            } else {
                return false
            }
        } else if (filter.type === "vis") {
            // TODO: VIS 过滤实现
            return false
        }
    }).filter(item => {
        if (filter.craftable === "all") {
            return true
        } else if (filter.craftable === "yes") {
            if (item.craftable) {
                return true
            } else {
                return false
            }
        } else if (filter.craftable === "no") {
            if (item.craftable) {
                return false
            } else {
                return true
            }
        }
    }).filter(item => {
        if (filter.word === "") {
            return true
        } else if (filter.word[0] == "@") {
            const modName = filter.word.slice(1)
            if (item.name.split(":")[0].toLocaleLowerCase().includes(modName.toLocaleLowerCase())) {
                return true
            } else {
                return false
            }

        }
        else if (pinyinPro.match(item.display, filter.word)
            || item.name.toLocaleLowerCase().includes(filter.word.toLocaleLowerCase())
            || item.id == filter.word
        ) {
            return true
        } else {
            return false
        }
    }).sort((a, b) => {
        if (filter.sort === "amount") {
            return b.amount - a.amount
        } else if (filter.sort === "amountr") {
            return a.amount - b.amount
        } else if (filter.sort === "id") {
            return b.id - a.id
        } else if (filter.sort === "idr") {
            return a.id - b.id
        }
    })

    const itemListFilteredSliced = itemListFiltered.slice(0, filter.page * aeView__itemsPerPage)

    if (itemListFiltered.length > filter.page * aeView__itemsPerPage) {
        targetElementShowMore.style["display"] = "block"
    } else {
        targetElementShowMore.style["display"] = "none"
    }

    if (itemListFilteredSliced.length === 0) {
        targetElementNothing.style["display"] = "block"
        targetElement.style["display"] = "none"
    } else {
        targetElementNothing.style["display"] = "none"
        targetElement.style["display"] = "grid"

        itemListFilteredSliced.forEach(item => {

            let link = ""
            let amount = item.amount

            if (item.isFluid) {
                link = `fluid/${item.id}.png`
            } else {
                link = `item/${item.id}_${item.damage}.png`
            }

            if (item.craftable) {
                amount += "(C)"
            }

            _ += `
            <div style="position: relative;">
              <img src="./resources/itempanel/${link}" style="height: 3rem;"></img>
              <div style="position: absolute;bottom: 0;right: 6px;text-align: right;">${amount}</div>
            </div>
            `
        })
    }

    targetElement.innerHTML = _
}