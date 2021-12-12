// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { sign } from "../crypto"
import { hash, urlEncode } from "../helpers/data"
import Settings from "../settings"
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
    method: string
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
    public urlKey: string

    constructor(settings: Settings, urlKey: string) {
        this.settings = settings
        this.urlKey = urlKey
    }

    get apiUrl(): string {
        return this.settings.apiUrl(this.urlKey)
    }

    request(opts: Opts): Promise<Result> {
        const normalize = (data: Result): Result => {
            if (data.errors === undefined) data.errors = {}
            return data
        }

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            let params = ""
            if (opts.params !== undefined) urlEncode(opts.params)
            xhr.open(
                opts.method,
                opts.url + (params !== null ? "?" + params : "")
            )

            xhr.onload = () => {
                const contentType = (
                    xhr.getResponseHeader("content-type") || ""
                ).trim()
                if (/^application\/json(;.*)?$/i.exec(contentType) === null)
                    reject({
                        status: xhr.status,
                        message: "not a JSON response",
                        errors: {},
                    })
                const data = normalize(JSON.parse(xhr.response))
                data.status = xhr.status
                // this is a non-cryptogaphic (!) hash, just used to e.g. decide whether we should
                // rerender a given graph...
                data.hash = hash(xhr.response)
                if (xhr.status >= 200 && xhr.status < 300) {
                    // setTimeout( () => resolve(data), 1000); // uncomment to add a delay for debugging
                    resolve(data)
                } else {
                    reject(data)
                }
            }
            xhr.onerror = () => {
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
            if (opts.headers) {
                Object.entries(opts.headers).forEach(([key, value]) => {
                    xhr.setRequestHeader(key, value)
                })
            }
            const data = opts.data
            const json = opts.json

            if (data !== undefined) {
                xhr.setRequestHeader(
                    "Content-Type",
                    "application/x-www-form-urlencoded"
                )
                xhr.send(urlEncode(data))
            } else if (json !== undefined) {
                xhr.setRequestHeader("Content-Type", "application/json")
                xhr.send(JSON.stringify(json))
            } else {
                xhr.send()
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
