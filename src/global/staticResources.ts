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

var staticResources = {
    itemPanel: [] as ItemPanelItem[],

    init(config: Config) {
        const itmePanelRaw = fs.readFileSync('./data/itempanel/itempanel.csv', 'utf8')
        let itemPanel = itmePanelRaw.split('\r\n').map(line => line.split(','))
        itemPanel.shift() // remove header row
        itemPanel.forEach(row => {
            this.itemPanel.push({
                name: row[0],
                id: parseInt(row[1]),
                damage: parseInt(row[2]),
                hasNBT: row[3] === 'true',
                display: row[4]
            })
        })
        logger.trace("staticResourcesItemPanel", this.itemPanel)
    }
}

export default staticResources