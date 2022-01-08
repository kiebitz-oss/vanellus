// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { verify, ecdhDecrypt } from "../crypto"
import {
    Error,
    Result,
    Status,
    ErrorType,
    EncryptedProviderData,
    KeyPair,
    ProviderData,
} from "../interfaces"
import { Mediator } from "./"

export interface ProvidersResult extends Result {
    data: EncryptedProviderData[]
}

export async function pendingProviders(
    this: Mediator
): Promise<ProvidersResult | Error> {
    const response = await this.backend.appointments.getPendingProviderData(
        {},
        this.keyPairs!.signing
    )

    if ("code" in response)
        return {
            status: Status.Failed,
            error: {
                type: ErrorType.RPC,
                data: response,
            },
        }

    for (const pd of response) {
        const decryptedData = await ecdhDecrypt(
            pd.encryptedData,
            this.keyPairs!.provider.privateKey
        )
        if (decryptedData === null)
            return {
                status: Status.Failed,
                error: {
                    type: ErrorType.Crypto,
                },
            }

        // to do: verify provider data!

        pd.data = JSON.parse(decryptedData) as ProviderData
    }

    return {
        status: Status.Succeeded,
        data: response,
    }
}

export async function verifiedProviders(
    this: Mediator
): Promise<ProvidersResult | Error> {
    const response = await this.backend.appointments.getVerifiedProviderData(
        {},
        this.keyPairs!.signing
    )

    if ("code" in response)
        return {
            status: Status.Failed,
            error: {
                type: ErrorType.RPC,
                data: response,
            },
        }

    for (const pd of response) {
        const decryptedData = await ecdhDecrypt(
            pd.encryptedData,
            this.keyPairs!.provider.privateKey
        )
        if (decryptedData === null)
            return {
                status: Status.Failed,
                error: {
                    type: ErrorType.Crypto,
                },
            }

        // to do: verify provider data!

        pd.data = JSON.parse(decryptedData) as ProviderData
    }

    return {
        status: Status.Succeeded,
        data: response,
    }
}
