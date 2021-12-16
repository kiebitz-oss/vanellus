// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes } from "../crypto"
import { Provider } from "./"

// generate and return the (local) provider data
export async function providerData(this: Provider, data: any) {
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
}
