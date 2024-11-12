import fs from 'fs';
import { loggerGlobal as logger } from '../logger';
var staticResources = {
    itemPanel: [],
    init(config) {
        const itmePanelRaw = fs.readFileSync('./data/itempanel/itempanel.csv', 'utf8');
        let itemPanel = itmePanelRaw.split('\r\n').map(line => line.split(','));
        itemPanel.shift(); // remove header row
        itemPanel.forEach(row => {
            this.itemPanel.push({
                name: row[0],
                id: parseInt(row[1]),
                damage: parseInt(row[2]),
                hasNBT: row[3] === 'true',
                display: row[4]
            });
        });
        logger.trace("staticResourcesItemPanel", this.itemPanel);
    }
};
export default staticResources;
