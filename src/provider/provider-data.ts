// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes } from "../crypto"
import { Provider } from "./"

// generate and return the (local) provider data
export async function providerData(this: Provider, data) {
    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock("providerData")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        let providerData = this.backend.local.get("provider::data")
        if (providerData === null) {
            providerData = {
                data: {},
            }
        }
        if (data !== undefined) {
            providerData.data = data
        }
        this.backend.local.set("provider::data", providerData)
        return {
            status: "loaded",
            data: providerData,
        }
    } finally {
        this.unlock("providerData")
    }
}
