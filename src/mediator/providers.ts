// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { verify, ecdhDecrypt } from "../crypto"
import {
    Error,
    Result,
    Status,
    EncryptedProviderData,
    KeyPair,
    ProviderData,
} from "../interfaces"
import { Mediator } from "./"

interface ProvidersResult extends Result {
    providers: EncryptedProviderData[]
}

export async function pendingProviders(
    this: Mediator
): Promise<ProvidersResult | Error> {
    const providerData = await this.backend.appointments.getPendingProviderData(
        {},
        this.keyPairs!.signing
    )

    if ("code" in providerData)
        return {
            status: Status.Failed,
            error: providerData,
        }

    for (const pd of providerData) {
        const decryptedData = await ecdhDecrypt(
            pd.encryptedData,
            this.keyPairs!.provider.privateKey
        )
        if (decryptedData === null)
            return {
                status: Status.Failed,
                error: pd,
            }

        // to do: verify provider data!

        pd.data = JSON.parse(decryptedData) as ProviderData
    }

    return {
        status: Status.Succeeded,
        providers: providerData,
    }
}

export async function verifiedProviders(
    this: Mediator
): Promise<ProvidersResult | Error> {
    const providerData =
        await this.backend.appointments.getVerifiedProviderData(
            {},
            this.keyPairs!.signing
        )

    if ("code" in providerData)
        return {
            status: Status.Failed,
            error: providerData,
        }

    for (const pd of providerData) {
        const decryptedData = await ecdhDecrypt(
            pd.encryptedData,
            this.keyPairs!.provider.privateKey
        )
        if (decryptedData === null)
            return {
                status: Status.Failed,
                error: pd,
            }

        // to do: verify provider data!

        pd.data = JSON.parse(decryptedData) as ProviderData
    }

    return {
        status: Status.Succeeded,
        providers: providerData,
    }
}
