// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { AdminKeys } from "./"
import { ecdhEncrypt, ecdhDecrypt } from "../../crypto"
import { Backend } from "../../backend"
import { Provider } from "../../provider"
import { ProviderData, KeyPair, Status } from "../../interfaces"

export async function unverifiedProvider(
    backend: Backend,
    adminKeys: AdminKeys
): Promise<Provider> {
    const provider = new Provider("provider", backend)

    await provider.initialize()

    const providerData: ProviderData = {
        name: "Max Mustermann",
        street: "Musterstr. 23",
        city: "Berlin",
        zipCode: "10707",
        description: "",
        email: "max@mustermann.de",
    }

    provider.data = providerData

    const result = await provider.storeData()

    if (result.status === Status.Failed)
        throw new Error("cannot store provider data")

    return provider
}
