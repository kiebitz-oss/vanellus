// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesDecrypt, deriveSecrets } from "../crypto"
import { base322buf, b642buf } from "../helpers/conversion"
import { localKeys, cloudKeys } from "./backup-data"
import { Provider } from "./"

export async function restoreFromBackup(
    this: Provider,
    secret,
    data,
    localOnly // if true, only local data will be imported
) {
    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock("restoreFromBackup")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        const dd = JSON.parse(await aesDecrypt(data, base322buf(secret)))

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
            const [id, key] = await deriveSecrets(
                b642buf(dd.keyPairs.sync),
                32,
                2
            )

            try {
                const cloudData = await this.backend.storage.getSettings({
                    id: id,
                })
                const ddCloud = JSON.parse(
                    await aesDecrypt(cloudData, b642buf(key))
                )

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

restoreFromBackup.actionName = "restoreFromBackup"
