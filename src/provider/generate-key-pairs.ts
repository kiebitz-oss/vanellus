// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    generateECDHKeyPair,
    generateECDSAKeyPair,
    generateSymmetricKey,
} from "../crypto"

import { Provider } from "./"
import { KeyPairs } from "../interfaces"

// make sure the signing and encryption key pairs exist
export async function generateKeyPairs(this: Provider): Promise<KeyPairs> {
    const syncKey = await generateSymmetricKey()
    const signingKeyPair = await generateECDSAKeyPair()
    const encryptionKeyPair = await generateECDHKeyPair()

    const keyPairs = {
        sync: syncKey!,
        signing: signingKeyPair!,
        encryption: encryptionKeyPair!,
    }

    return keyPairs
}
