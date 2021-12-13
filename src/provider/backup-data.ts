// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Status, Result, Error } from "../interfaces"
import { aesEncrypt, deriveSecrets } from "../crypto"
import { KeyPair } from "../interfaces"
import { base322buf, b642buf } from "../helpers/conversion"
import { KeyPairs, ProviderData, VerifiedProviderData } from "../interfaces"
import { Provider } from "./"

interface BackupData {
    createdAt: string
    version: string
    [Key: string]: any
}

interface LocalBackupData extends BackupData {
    keyPairs: KeyPairs | null
}

interface CloudBackupData extends BackupData {
    verifiedData: VerifiedProviderData | null
    data: ProviderData | null
}

interface BackupDataResult extends Result {
    localData: LocalBackupData
    cloudData: CloudBackupData
}

interface BackupDataError extends Error {}

// make sure the signing and encryption key pairs exist
export async function backupData(
    this: Provider,
    lockName: string
): Promise<BackupDataResult | BackupDataError> {
    if (lockName === undefined) lockName = "backupData"

    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock(lockName)
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        const localData: LocalBackupData = {
            version: "0.2",
            keyPairs: this.keyPairs,
            createdAt: new Date().toISOString(),
        }

        if (this.loggedOut)
            return {
                status: Status.Failed,
                error: {
                    error: "logged out",
                },
            }

        const cloudData: CloudBackupData = {
            version: "0.2",
            createdAt: new Date().toISOString(),
            data: this.data,
            verifiedData: this.verifiedData,
        }

        const referenceData = {
            local: { ...localData },
            cloud: { ...cloudData },
        }

        if (this.referenceData !== null) {
            if (
                JSON.stringify(this.referenceData) ===
                JSON.stringify(referenceData)
            ) {
                return {
                    status: Status.Succeeded,
                    referenceData: referenceData,
                    localData: localData,
                    cloudData: cloudData,
                }
            }
        }

        // locally stored data
        const encryptedData = await aesEncrypt(
            JSON.stringify(localData),
            base322buf(this.secret)
        )

        const idAndKey = await deriveSecrets(
            b642buf(this.keyPairs!.sync),
            32,
            2
        )

        const [id, key] = idAndKey!

        // cloud stored data
        const encryptedCloudData = await aesEncrypt(
            JSON.stringify(cloudData),
            b642buf(key)
        )

        await this.backend.storage.storeSettings({
            id: id,
            data: encryptedCloudData,
        })

        return {
            status: Status.Succeeded,
            referenceData: referenceData,
            localData: localData,
            cloudData: cloudData,
        }
    } catch (e) {
        return {
            status: Status.Failed,
            error: {
                error: e instanceof Error ? e.toString() : "unknown error",
            },
        }
    } finally {
        if (lockName === "logout") {
            this.loggedOut = true
            // we make sure not other tasks are executed after this task
            this.clearLocks()
        } else {
            this.unlock(lockName)
        }
    }
}
