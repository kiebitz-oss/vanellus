// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Provider } from "./"

export async function verifiedProviderData(this: Provider) {
    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock("verifiedProviderData")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        const providerData = this.backend.local.get("data::verified")
        return {
            status: "loaded",
            data: providerData,
        }
    } finally {
        this.unlock("verifiedProviderData")
    }
}
