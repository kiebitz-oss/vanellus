// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { sign } from "../crypto"
import { urlEncode } from "../helpers/data"
import { Settings, Error, RPCResponse } from "../interfaces"
import { KeyPair } from "../interfaces"

class RPCException {
    public error: any
    public name: string
    public result: Result

    constructor(result: Result) {
        this.name = "RPCException"
        this.result = result
    }
}

interface Headers {
    [Key: string]: string
}

interface Opts {
    headers?: Headers
    url: string
    method?: string
    json?: { [Key: string]: any }
    data?: { [Key: string]: any }
    params?: { [Key: string]: any }
}

type Result = any

class JSONRPCBackend {
    public settings: Settings
    public urlKey: "storage" | "appointments"

    constructor(settings: Settings, urlKey: "storage" | "appointments") {
        this.settings = settings
        this.urlKey = urlKey
    }

    get apiUrl(): string {
        return this.settings.apiUrls[this.urlKey]
    }

    async request(opts: Opts): Promise<RPCResponse> {
        let params = ""
        if (opts.params !== undefined) params = urlEncode(opts.params)!

        const fetchOpts: { [Key: string]: any } = {
            method: opts.method || "GET",
            headers: opts.headers || {},
        }

        if (opts.data !== undefined) {
            fetchOpts.headers["Content-Type"] =
                "application/x-www-form-urlencoded"
            fetchOpts.body = urlEncode(opts.data)
        } else if (opts.json !== undefined) {
            fetchOpts.headers["Content-Type"] = "application/json"
            fetchOpts.body = JSON.stringify(opts.json)
        }

        try {
            const response = await fetch(
                opts.url + (params !== null ? "?" + params : ""),
                fetchOpts
            )
            return (await response.json()) as RPCResponse
        } catch (e) {
            return {
                jsonrpc: "2.0",
                id: "-1",
                error: {
                    code: -1,
                    message: "request failed",
                    data: {
                        error: (e as Error).toString(),
                    },
                },
            }
        }
    }

    async call(
        method: string,
        params: { [Key: string]: any },
        keyPair?: KeyPair,
        id?: string
    ): Promise<RPCResponse> {
        let callParams
        if (keyPair !== undefined) {
            const dataToSign = {
                ...params,
                timestamp: new Date().toISOString(),
            }
            const signedData = await sign(
                keyPair.privateKey,
                JSON.stringify(dataToSign),
                keyPair.publicKey
            )
            callParams = signedData
        } else {
            callParams = params
        }

        return await this.request({
            url: `${this.apiUrl}`,
            method: "POST",
            json: {
                jsonrpc: "2.0",
                method: method,
                params: callParams,
                id: id,
            },
        })
    }
}

export default JSONRPCBackend
