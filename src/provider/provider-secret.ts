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

  /**
   * Initializes and returns a secret 24 character alpahnumeric code. If the
   * provider object already has a secret associated with it, the existing one
   * is preserved and returned
   */

export function initSecret(this: Provider) {
    let data = this.backend.local.get("secret")
    if (data === null) {
        data = createSecret()
        this.backend.local.set("secret", data)
    }
    return data
}

export function createSecret() {
    return buf2base32(b642buf(randomBytes(15)))
}
