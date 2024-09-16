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