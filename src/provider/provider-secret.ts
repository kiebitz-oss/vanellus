// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { buf2base32, b642buf } from "../helpers/conversion"
import { randomBytes } from "../crypto"
import { Provider } from "./"

export async function providerSecret(this: Provider, data: any, lockName: any) {
    if (data !== undefined) this.backend.local.set("secret", data)
    data = this.backend.local.get("secret")
    if (data === null)
        return {
            status: "failed",
        }
    return {
        status: "loaded",
        data: data,
    }
}

export function init(this: Provider) {
    let data = this.backend.local.get("secret")
    if (data === null) {
        data = buf2base32(b642buf(randomBytes(15)))
        this.backend.local.set("secret", data)
    }
    return {
        status: "loaded",
        data: data,
    }
}
