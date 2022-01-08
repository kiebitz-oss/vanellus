// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesEncrypt, deriveSecrets } from "../crypto"
import { base322buf, b642buf } from "../helpers/conversion"
import {
    TokenData,
    QueueData,
    ContactData,
    AcceptedAppointment,
    Status,
    AESData,
    Result,
    Error,
    ErrorType,
} from "../interfaces"
import { User } from "./"

interface BackupData {
    createdAt: string
    version: string
    [Key: string]: any
}

export interface CloudBackupData extends BackupData {
    tokenData: TokenData | null
    queueData: QueueData | null
    contactData: ContactData | null
    acceptedAppointments: AcceptedAppointment[]
}

export interface BackupDataResult extends Result {
    data: AESData
}

// make sure the signing and encryption key pairs exist
export async function backupData(
    this: User
): Promise<BackupDataResult | Error> {
    const cloudData: CloudBackupData = {
        version: "0.2",
        createdAt: new Date().toISOString(),
        tokenData: this.tokenData,
        queueData: this.queueData,
        contactData: this.contactData,
        acceptedAppointments: this.acceptedAppointments,
    }

    const idAndKey = await deriveSecrets(base322buf(this.secret!), 32, 2)

    const [id, key] = idAndKey!

    const encryptedData = await aesEncrypt(
        JSON.stringify(cloudData),
        b642buf(key)
    )

    if (encryptedData === null)
        return {
            status: Status.Failed,
        }

    const response = await this.backend.storage.storeSettings({
        id: id,
        data: encryptedData,
    })

    if (response !== "ok")
        return {
            status: Status.Failed,
            error: {
                type: ErrorType.RPC,
                data: response,
            },
        }

    return {
        status: Status.Succeeded,
        data: encryptedData!,
    }
}
