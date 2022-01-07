// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhDecrypt } from "../crypto"
import {
    Result,
    Error,
    ErrorType,
    Status,
    ConfirmedProviderData,
    ProviderData,
} from "../interfaces"
import { Provider } from "./"

export interface CheckDataResult extends Result {
    data: ProviderData
}

export async function checkData(
    this: Provider,
    data: any
): Promise<CheckDataResult | Error> {
    const response = await this.backend.appointments.checkProviderData(
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

    // to do: check signature
    const decryptedJSONData = await ecdhDecrypt(
        JSON.parse(response.data),
        this.keyPairs!.data.privateKey
    )

    if (decryptedJSONData === null) {
        // can't decrypt
        this.verifiedData = null
        return { status: Status.Failed }
    }

    const decryptedData: ProviderData = JSON.parse(decryptedJSONData)

    this.verifiedData = decryptedData
    // to do: check signed keys as well
    return { status: Status.Succeeded, data: decryptedData }
}
