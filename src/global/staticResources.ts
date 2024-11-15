import fs from 'fs'
import { Config } from '../interface'
import { loggerGlobal as logger } from '../logger'

interface ItemPanelItem {
    name: string
    id: number
    damage: number // aka. meta
    hasNBT: boolean
    display: string
}

interface ItemPanelLiquid {
    name: string
    id: number
    display: string
}

var staticResources = {

    itemPanelItem: [] as ItemPanelItem[],
    itemPanelFluid: [] as ItemPanelLiquid[],

    init(config: Config) {
        const itmePanelItemRaw = fs.readFileSync('./data/itempanel/item.csv', 'utf8')
        let itemPanel = itmePanelItemRaw.split('\r\n').map(line => line.split(','))
        itemPanel.shift() // remove header row
        itemPanel.forEach(row => {
            this.itemPanelItem.push({
                name: row[0],
                id: parseInt(row[1]),
                damage: parseInt(row[2]),
                hasNBT: row[3] === 'true',
                display: row[4]
            })
        })
        logger.trace("staticResourcesItemPanelItem", this.itemPanelItem)

        const itemPanelFluidRaw = fs.readFileSync('./data/itempanel/liquid.json', 'utf8')
        this.itemPanelFluid = JSON.parse(itemPanelFluidRaw)
        logger.trace("staticResourcesItemPanelFluid", this.itemPanelFluid)
        
    }
}

export default staticResources