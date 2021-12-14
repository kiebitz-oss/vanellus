export interface RPCResponse {
    jsonrpc: string
    id: string
    error?: RPCError
    result?: any
}

export type OK = "ok"

export interface RPCResult {
    id: string
    result: any
}

export interface RPCError {
    code: number
    message: string
    data?: any
}
