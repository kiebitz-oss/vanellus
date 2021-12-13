// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { sign } from "../crypto"
import { hash, urlEncode } from "../helpers/data"
import { Settings } from "../settings"
import { KeyPair } from "../crypto/interfaces"

class RPCException {
    public error: any
    public name: string
    public result: Result
    constructor(result: Result) {
        this.name = "RPCException"
        this.result = result
    }
}

interface Result {
    result?: any
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

interface Result {
    errors?: { [Key: string]: any }
    hash?: number
    status: number
}

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

    request(opts: Opts): Promise<Result> {
        const normalize = (data: Result): Result => {
            if (data.errors === undefined) data.errors = {}
            return data
        }

        return new Promise(async (resolve, reject) => {
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
                const json = (await response.json()) as any
                const data = normalize(json!)
                data.hash = hash(JSON.stringify(json!))
                data.status = response.status
                if (response.status >= 200 && response.status < 300) {
                    resolve(data)
                } else {
                    reject(data)
                }
            } catch (e) {
                reject({
                    jsonrpc: "2.0",
                    id: "-1",
                    error: {
                        code: -1,
                        message: "request failed",
                        data: {},
                    },
                })
            }
        })
    }

    async call(
        method: string,
        params: { [Key: string]: any },
        keyPair?: KeyPair,
        id?: string
    ) {
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

        try {
            const result = await this.request({
                url: `${this.apiUrl}`,
                method: "POST",
                json: {
                    jsonrpc: "2.0",
                    method: method,
                    params: callParams,
                    id: id,
                },
            })
            return result.result
        } catch (result) {
            throw new RPCException(result as Result)
        }
    }
}

export default JSONRPCBackend
