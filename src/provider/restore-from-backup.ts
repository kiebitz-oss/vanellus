// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesDecrypt, deriveSecrets } from "../crypto"
import { base322buf, b642buf } from "../helpers/conversion"
import { Provider } from "./"
import { LocalBackupData, CloudBackupData } from "./backup-data"
import { AESData } from "../interfaces"

/**
 * Restores the data of a provider by decrypting the provider keys and
 * subsequently downloading the provider metadata from the server
 * @param secret the 24 character alphanumeric secret from the provider
 * @param data the encrypted keys from the provider backup file
 */

export async function restoreFromBackup(this: Provider, data: AESData) {
    const decryptedKeyData = await aesDecrypt(data, base322buf(this.secret!))
    const dd: LocalBackupData = JSON.parse(decryptedKeyData!)

    if (dd === null) throw new Error("decryption failed")
    if (!dd.keyPairs!.sync) throw new Error("sync key missing")

    const derivedSecrets = await deriveSecrets(
        b642buf(dd.keyPairs!.sync),
        32,
        2
    )

    const [id, key] = derivedSecrets!

    const response = await this.backend.storage.getSettings({
        id: id,
    })
    const decryptedData = await aesDecrypt(response, b642buf(key))
    const ddCloud: CloudBackupData = JSON.parse(decryptedData!)

    this.keyPairs = dd.keyPairs
    this.data = ddCloud.data
    this.verifiedData = ddCloud.verifiedData

    return ddCloud.data
}
