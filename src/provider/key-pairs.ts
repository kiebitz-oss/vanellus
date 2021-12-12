// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    generateECDHKeyPair,
    generateECDSAKeyPair,
    generateSymmetricKey,
} from "../crypto"
import { Provider } from "./"
import { markAsLoading } from "helpers/actions"

// make sure the signing and encryption key pairs exist
export async function keyPairs(this: Provider, lockName) {
    const backend = settings.get("backend")

    if (lockName === undefined) lockName = "keyPairs"

    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock(lockName)
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        markAsLoading(state, keyStore)

        if (this.keyPairs === null) {
            try {
                const syncKey = await generateSymmetricKey()
                const signingKeyPair = await generateECDSAKeyPair()
                const encryptionKeyPair = await generateECDHKeyPair()
                const keyPairs = {
                    sync: syncKey,
                    signing: signingKeyPair,
                    encryption: encryptionKeyPair,
                }
                this.backend.local.set("keyPairs", keyPairs)
                return {
                    status: "loaded",
                    data: keyPairs,
                }
            } catch (e) {
                return {
                    status: "failed",
                    error: e,
                }
            }
        } else {
            return {
                status: "loaded",
                data: providerKeyPairs,
            }
        }
    } finally {
        this.unlock(lockName)
    }
}
