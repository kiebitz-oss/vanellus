// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { sign } from "../crypto"
import { Settings, Error, RPCResponse, RPCError } from "../interfaces"
import { KeyPair } from "../interfaces"

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

    async call<R = any>(
        method: string,
        params: Record<string, unknown>,
        keyPair?: KeyPair,
        id?: string
    ): Promise<R | RPCError> {
        let callParams

        if (typeof keyPair === "object") {
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
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    ["Content-Type"]: "application/json",
                },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: method,
                    params: callParams,
                    id: id,
                }),
            })

            if (!response.ok) {
                return {
                    code: -1,
                    message: "request failed",
                    data: {
                        error: response.statusText,
                    },
                } as RPCError
            }

            return response.json().then((data) => data.result as R)
        } catch (e) {
            return {
                code: -1,
                message: "request failed",
                data: {
                    error: (e as Error).toString(),
                },
            } as RPCError
        }
    }
}

export default JSONRPCBackend
