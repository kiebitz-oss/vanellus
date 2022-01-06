// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhEncrypt, generateECDHKeyPair, sign } from "../crypto"
import { ProviderData, PublicKeys, Status, OK } from "../interfaces"
import { Provider } from "./"

// store the provider data for validation in the backend
export async function storeData(this: Provider, code?: string) {
    const publicKeys = await this.keys().get()

    if (publicKeys.status === Status.Failed) return publicKeys

    const keys = publicKeys.keys
    const data = this.data!

    const dataToEncrypt = Object.assign({}, data)

    dataToEncrypt.publicKeys = {
        signing: this.keyPairs!.signing.publicKey,
        encryption: this.keyPairs!.encryption.publicKey,
    }

    const encryptedData = await ecdhEncrypt(
        JSON.stringify(dataToEncrypt),
        this.keyPairs!.data,
        keys.providerData
    )

    const result = await this.backend.appointments.storeProviderData(
        {
            encryptedData: encryptedData!,
            code: code,
        },
        this.keyPairs!.signing
    )

    if (result !== "ok")
        return {
            status: Status.Failed,
            error: result,
        }

    data.submittedAt = new Date().toISOString()
    data.version = "0.4"

    this.data = data

    return {
        status: Status.Succeeded,
        data: result,
    }
}
