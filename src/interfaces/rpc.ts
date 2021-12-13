export interface RPCResponse {
    jsonrpc: string
    id: string
    error?: RPCError
    result?: any
}

export interface RPCError {
    code: number
    message: string
    data?: any
}
