// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { aesEncrypt, deriveSecrets } from "../crypto"
import { base322buf, b642buf } from "../helpers/conversion"
import { Provider } from "./"

export const localKeys = ["keyPairs"]
export const cloudKeys = ["data", "data::verified", "data::encryptionKeyPair"]

interface BackupData {
    createdAt: string
    version: string
    [Key: string]: any
}

// make sure the signing and encryption key pairs exist
export async function backupData(this: Provider, lockName: string) {
    if (lockName === undefined) lockName = "backupData"

    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock(lockName)
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        const data: BackupData = {
            version: "0.2",
            createdAt: new Date().toISOString(),
        }

        if (this.loggedOut) return

        for (const key of localKeys) {
            data[key] = this.backend.local.get(`${key}`)
        }

        const cloudData: BackupData = {
            version: "0.2",
            createdAt: new Date().toISOString(),
        }
        for (const key of cloudKeys) {
            const v = this.backend.local.get(`${key}`)
            cloudData[key] = v
            // we also store the data locally so that we can restore it from
            // there in case something goes wrong with the cloud backup...
            data[key] = v
        }

        const referenceData = { local: { ...data }, cloud: { ...cloudData } }
        if (this.referenceData !== null) {
            if (
                JSON.stringify(this.referenceData) ===
                JSON.stringify(referenceData)
            ) {
                return {
                    status: "succeeded",
                    ...this.referenceData,
                }
            }
        }

        // locally stored data
        const encryptedData = await aesEncrypt(
            JSON.stringify(data),
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
            status: "succeeded",
            data: encryptedData,
            referenceData: referenceData,
        }
    } catch (e) {
        console.error(e)
        return {
            status: "failed",
            error: e,
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
