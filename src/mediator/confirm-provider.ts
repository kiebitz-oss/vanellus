// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { sign, ecdhDecrypt, ephemeralECDHEncrypt } from "../crypto"

import { KeyPairs } from "./"

export async function confirmSingleProvider(
    providerData: any,
    keyPairs: KeyPairs,
    backend: any
) {
    const keyHashesData = {
        signing: providerData.publicKeys.signing,
        encryption: providerData.publicKeys.encryption,
        queueData: {
            zipCode: providerData.data.zipCode,
            accessible: providerData.data.accessible,
        },
    }

    const keysJSONData = JSON.stringify(keyHashesData)

    // we remove the 'code' field from the provider
    if (providerData.data.code !== undefined) delete providerData.data.code

    const publicProviderData = {
        name: providerData.data.name,
        street: providerData.data.street,
        city: providerData.data.city,
        zipCode: providerData.data.zipCode,
        website: providerData.data.website,
        description: providerData.data.description,
    }

    const publicProviderJSONData = JSON.stringify(publicProviderData)
    const providerJSONData = JSON.stringify(providerData.data)

    const signedKeyData = await sign(
        keyPairs.signing.privateKey,
        keysJSONData,
        keyPairs.signing.publicKey
    )

    // this will be stored for the provider, so we add the public key data
    const signedProviderData = await sign(
        keyPairs.signing.privateKey,
        providerJSONData,
        keyPairs.signing.publicKey
    )

    // this will be stored for the general public
    const signedPublicProviderData = await sign(
        keyPairs.signing.privateKey,
        publicProviderJSONData,
        keyPairs.signing.publicKey
    )

    const fullData = {
        signedData: signedProviderData,
        signedPublicData: signedPublicProviderData,
    }

    const encryptedData = await ephemeralECDHEncrypt(
        JSON.stringify(fullData),
        providerData.entry.encryptedData.publicKey
    )

    // we encrypt the data with the public key supplied by the provider
    const [encryptedProviderData, _] = encryptedData!

    const signedEncryptedProviderData = await sign(
        keyPairs.signing.privateKey,
        JSON.stringify(encryptedProviderData),
        keyPairs.signing.publicKey
    )

    const result = await backend.appointments.confirmProvider(
        {
            encryptedProviderData: signedEncryptedProviderData,
            publicProviderData: signedPublicProviderData,
            signedKeyData: signedKeyData,
        },
        keyPairs.signing
    )
}

export async function confirmProvider(
    state: any,
    keyStore: any,
    settings: any,
    providerData: any,
    keyPairs: any
) {
    const backend = settings.get("backend")

    try {
        // we lock the local backend to make sure we don't have any data races
        await backend.local.lock("confirmProvider")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        const result = await confirmSingleProvider(
            providerData,
            keyPairs,
            backend
        )

        return {
            status: "suceeded",
            data: result,
        }
    } finally {
        backend.local.unlock("confirmProvider")
    }
}

confirmProvider.actionName = "confirmProvider"
