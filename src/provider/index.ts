// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { backupData } from "./backup-data"
import { checkData } from "./check-data"
import { generateKeyPairs } from "./generate-key-pairs"
import { storeData } from "./store-data"
import { createAppointment } from "./create-appointment"
import { restoreFromBackup } from "./restore-from-backup"
import { publishAppointments } from "./publish-appointments"
import { getAppointments } from "./get-appointments"

import { buf2base32, b642buf } from "../helpers/conversion"
import { randomBytes } from "../crypto"
import { Actor } from "../actor"
import { Backend } from "../backend"

import {
    ProviderBackupReferenceData,
    ProviderData,
    VerifiedProviderData,
    KeyPair,
    ProviderKeyPairs,
    Appointment,
} from "../interfaces"

export * from "./helpers"

export class Provider extends Actor {
    public backupData = backupData
    public checkData = checkData
    public storeData = storeData
    public createAppointment = createAppointment
    public restoreFromBackup = restoreFromBackup
    public publishAppointments = publishAppointments
    public getAppointments = getAppointments
    public generateKeyPairs = generateKeyPairs

    /**
     * create a new blank provider object
     * @param id A string to identify the provoder. Used to diferentiate objects
     * in the storage backend
     * @param backend The backend used for data storage and network
     * communication
     */

    constructor(id: string, backend: Backend) {
        super("provider", id, backend)
    }

    public async initialize() {
        this.secret = this.generateSecret()
        this.keyPairs = await this.generateKeyPairs()
    }

    private generateSecret(): string {
        return buf2base32(b642buf(randomBytes(10)))
    }

    public get loggedOut(): boolean {
        return this.get("loggedOut")
    }

    public set loggedOut(loggedOut: boolean) {
        this.set("loggedOut", loggedOut)
    }

    public get keyPairs(): ProviderKeyPairs | null {
        return this.get("keyPairs")
    }

    public set keyPairs(keyPairs: ProviderKeyPairs | null) {
        this.set("keyPairs", keyPairs)
    }

    public get data(): ProviderData | null {
        return this.get("data")
    }

    public set data(data: ProviderData | null) {
        this.set("data", data)
    }

    public get verifiedData(): VerifiedProviderData | null {
        return this.get("verifiedData")
    }

    public set verifiedData(verifiedData: VerifiedProviderData | null) {
        this.set("verifiedData", verifiedData)
    }

    public get secret(): string {
        return this.get("secret")
    }

    public set secret(secret: string) {
        this.set("secret", secret)
    }
}
