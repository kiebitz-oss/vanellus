// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesDecrypt, deriveSecrets } from "../crypto"
import { base322buf, b642buf } from "../helpers/conversion"
import { Provider } from "./"

export async function restoreFromBackup(
    this: Provider,
    secret: any,
    data: any,
    localOnly: any // if true, only local data will be imported
) {
    const decryptedData = await aesDecrypt(data, base322buf(secret))
    const dd = JSON.parse(decryptedData!)

    if (dd === null)
        return {
            status: "failed",
            error: {
                message: "decryption failed",
            },
        }

    if (dd.keyPairs.sync !== undefined && localOnly !== true) {
        const derivedSecrets = await deriveSecrets(
            b642buf(dd.keyPairs.sync),
            32,
            2
        )

        const [id, key] = derivedSecrets!

        try {
            const response = await this.backend.storage.getSettings({
                id: id,
            })
            const decryptedData = await aesDecrypt(
                response.result,
                b642buf(key)
            )
            const ddCloud = JSON.parse(decryptedData!)
        } catch (e) {
            console.error(e)
        }
    }

    this.backend.local.set("provider::secret", secret)

    return {
        status: "succeeded",
        data: dd,
    }
}
