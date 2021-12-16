// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhDecrypt } from "../crypto"
import { Provider } from "./"

export async function checkVerifiedProviderData(this: Provider, data: any) {
    const verifiedData = await this.backend.appointments.checkProviderData(
        {},
        this.keyPairs!.signing
    )

    try {
        // to do: verify the signature of the encrypted data!

        const decryptedJSONData = await ecdhDecrypt(
            verifiedData.result.encryptedProviderData.data,
            this.keyPairs!.encryption.privateKey
        )

        if (decryptedJSONData === null) {
            // can't decrypt
            this.verifiedData = null
            return { status: "failed" }
        }
        const decryptedData = JSON.parse(decryptedJSONData)
        decryptedData.signedData.json = JSON.parse(
            decryptedData.signedData.data
        )
        this.verifiedData = decryptedData
        // to do: check signed keys as well
        return { status: "loaded", data: decryptedData }
    } catch (e) {
        this.verifiedData = null
        return { status: "failed" }
    }
}
