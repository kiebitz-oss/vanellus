// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { verify, ecdhDecrypt } from "../crypto"

export async function verifiedProviders(
    state: any,
    keyStore: any,
    settings: any,
    keyPairs: any
) {
    const backend = settings.get("backend")

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock("verifiedProviders")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        return await providers(
            state,
            keyStore,
            settings,
            keyPairs,
            (...args: any[]) =>
                backend.appointments.getVerifiedProviderData(...args)
        )
    } finally {
        backend.local.unlock("verifiedProviders")
    }
}

verifiedProviders.actionName = "verifiedProviders"

export async function pendingProviders(
    state: any,
    keyStore: any,
    settings: any,
    keyPairs: any
) {
    const backend = settings.get("backend")

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock("pendingProviders")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        return await providers(
            state,
            keyStore,
            settings,
            keyPairs,
            (...args: any[]) =>
                backend.appointments.getPendingProviderData(...args)
        )
    } finally {
        backend.local.unlock("pendingProviders")
    }
}

pendingProviders.actionName = "pendingProviders"

async function providers(
    state: any,
    keyStore: any,
    settings: any,
    keyPairs: any,
    loader: any
) {
    try {
        const providersList = await loader({ n: 10 }, keyPairs.signing)
        const invalidEntries = []
        const decryptedProviderList = []
        for (const entry of providersList) {
            try {
                const decryptedJSONData = await ecdhDecrypt(
                    entry.encryptedData,
                    keyPairs.provider.privateKey
                )
                const decryptedData = JSON.parse(decryptedJSONData!)
                decryptedData.entry = entry
                decryptedProviderList.push(decryptedData)
            } catch (e) {
                invalidEntries.push({
                    entry: entry,
                    error: e,
                })
            }
        }
        return {
            data: decryptedProviderList,
            invalidEntries: invalidEntries,
            status: "loaded",
        }
    } catch (e) {
        console.error(e)
        return { status: "failed", error: e }
    }
}
