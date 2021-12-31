// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesEncrypt, deriveSecrets } from "../crypto"
import { base322buf, b642buf } from "../helpers/conversion"
import {
    ProviderKeyPairs,
    ProviderData,
    VerifiedProviderData,
    AESData,
    Status,
    Result,
    Error,
} from "../interfaces"
import { Provider } from "./"

export interface BackupData {
    createdAt: string
    version: string
    [Key: string]: any
}

export interface LocalBackupData extends BackupData {
    keyPairs: ProviderKeyPairs | null
}

export interface CloudBackupData extends BackupData {
    verifiedData: VerifiedProviderData | null
    data: ProviderData | null
}

interface BackupDataResult extends Result {
    data: AESData
}

export async function backupData(
    this: Provider
): Promise<BackupDataResult | Error> {
    const cloudData: CloudBackupData = {
        version: "0.2",
        createdAt: new Date().toISOString(),
        data: this.data,
        verifiedData: this.verifiedData,
    }

    const idAndKey = await deriveSecrets(b642buf(this.keyPairs!.sync), 32, 2)

    const [id, key] = idAndKey!

    // cloud stored data
    const encryptedCloudData = await aesEncrypt(
        JSON.stringify(cloudData),
        b642buf(key)
    )

    if (encryptedCloudData === null)
        return {
            status: Status.Failed,
        }

    const result = await this.backend.storage.storeSettings({
        id: id,
        data: encryptedCloudData,
    })

    const localData: LocalBackupData = {
        version: "0.2",
        keyPairs: this.keyPairs,
        createdAt: new Date().toISOString(),
    }

    const encryptedData = await aesEncrypt(
        JSON.stringify(localData),
        base322buf(this.secret)
    )

    return {
        status: Status.Succeeded,
        data: encryptedData!,
    }
}
