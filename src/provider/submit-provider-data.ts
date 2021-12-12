// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhEncrypt, generateECDHKeyPair, sign } from "../crypto"
import { Provider } from "./"

// store the provider data for validation in the backend
export async function submitProviderData(this: Provider, data: any, keys: any) {
    if (this.keyPairs === null) return

    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock("submitProviderData")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        const dataToEncrypt = Object.assign({}, data)
        let keyPair = this.backend.local.get("data::encryptionKeyPair")

        if (keyPair === null) {
            keyPair = await generateECDHKeyPair()
            this.backend.local.set("data::encryptionKeyPair", keyPair)
        }

        dataToEncrypt.publicKeys = {
            signing: this.keyPairs.signing.publicKey,
            encryption: this.keyPairs.encryption.publicKey,
        }

        const providerDataKey = keys.providerData
        // we convert the data to JSON
        const jsonData = JSON.stringify(dataToEncrypt)

        const encryptedData = await ecdhEncrypt(
            jsonData,
            keyPair,
            providerDataKey
        )

        try {
            const result = await this.backend.appointments.storeProviderData(
                {
                    encryptedData: encryptedData!,
                    code: data.data.code,
                },
                this.keyPairs.signing
            )

            data.submittedAt = new Date().toISOString()
            data.version = "0.4"
            this.backend.local.set("data", data)
            return {
                status: "succeeded",
                data: result,
            }
        } catch (e) {
            console.error(e)
            return { status: "failed", error: e }
        }
    } finally {
        this.unlock("submitProviderData")
    }
}

export function reset(this: Provider) {
    return { status: "initialized" }
}
