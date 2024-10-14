export interface User {
    uuid: string
    name: string
    token: string
}

export interface Bot {
    uuid: string
    name: string
    token: string
}

export interface Ae {
    uuid: string
    name: string
}

export interface Config {
    log_level: string
    port: number
    mc_server_ip: string
}

export interface CommonData {
    uuid: string
    name: string
    description?: string
    unit?: string
    min?: number
    max?: number

    value?: number
    avgIO?: number
}

export interface Event {
    uuid: string
    name: string
    description?: string

    // 0=通知 1=警告 2=紧急
    priority: number
    // 0=未处理 1=已处理
    status: number
    timestamp: number
}

export interface McServerStatus {
    ip: string
    online: boolean
    motd: string
    players: {
        max: number
        online: number
        list: string[]
    }
}