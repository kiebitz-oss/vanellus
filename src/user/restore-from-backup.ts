// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesDecrypt, deriveSecrets } from "../crypto"
import { base322buf, b642buf } from "../helpers/conversion"
import { Status, Result, Error, AESData, ErrorType } from "../interfaces"
import { CloudBackupData } from "./backup-data"
import { User } from "./"

export interface RestoreFromBackupResult extends Result {
    data: CloudBackupData
}

// make sure the signing and encryption key pairs exist
export async function restoreFromBackup(
    this: User
): Promise<RestoreFromBackupResult | Error> {
    const secrets = await deriveSecrets(base322buf(this.secret!), 32, 2)
    const [id, key] = secrets!
    const response = await this.backend.storage.getSettings({ id: id })

    if ("code" in response)
        return {
            status: Status.Failed,
            error: {
                type: ErrorType.RPC,
                data: response,
            },
        }

    const decryptedData = await aesDecrypt(response, b642buf(key))
    const dd: CloudBackupData = JSON.parse(decryptedData!)

    this.tokenData = dd.tokenData
    this.queueData = dd.queueData
    this.contactData = dd.contactData
    this.acceptedAppointments = dd.acceptedAppointments

    return {
        status: Status.Succeeded,
        data: dd,
    }
}
