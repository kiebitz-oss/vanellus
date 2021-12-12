// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesDecrypt, deriveSecrets } from "../crypto"
import { base322buf, b642buf } from "../helpers/conversion"
import { localKeys, cloudKeys } from "./backup-data"
import { Provider } from "./"

export async function restoreFromBackup(
    this: Provider,
    secret: any,
    data: any,
    localOnly: any // if true, only local data will be imported
) {
    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock("restoreFromBackup")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        const decryptedData = await aesDecrypt(data, base322buf(secret))
        const dd = JSON.parse(decryptedData!)

        if (dd === null)
            return {
                status: "failed",
                error: {
                    message: "decryption failed",
                },
            }

        for (const key of localKeys) {
            this.backend.local.set(`provider::${key}`, dd[key])
        }

        // if there's local data in the backup we restore it too...
        for (const key of cloudKeys) {
            if (dd[key] !== undefined)
                this.backend.local.set(`provider::${key}`, dd[key])
        }

        if (dd.keyPairs.sync !== undefined && localOnly !== true) {
            const derivedSecrets = await deriveSecrets(
                b642buf(dd.keyPairs.sync),
                32,
                2
            )

            const [id, key] = derivedSecrets!

            try {
                const cloudData = await this.backend.storage.getSettings({
                    id: id,
                })
                const decryptedData = await aesDecrypt(cloudData, b642buf(key))
                const ddCloud = JSON.parse(decryptedData!)

                for (const key of cloudKeys) {
                    if (ddCloud[key] !== undefined && ddCloud[key] !== null)
                        this.backend.local.set(`provider::${key}`, ddCloud[key])
                }
            } catch (e) {
                console.error(e)
            }
        }

        this.backend.local.set("provider::secret", secret)

        return {
            status: "succeeded",
            data: dd,
        }
    } catch (e) {
        console.error(e)
        return {
            status: "failed",
            error: e,
        }
    } finally {
        this.backend.local.set("provider::loggedOut", false)
        this.unlock("restoreFromBackup")
    }
}
