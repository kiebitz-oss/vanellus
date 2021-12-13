// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { backupData } from "./backup-data"
import { checkVerifiedProviderData } from "./check-verified-provider-data"
import { generateKeyPairs } from "./generate-key-pairs"
import { keys } from "./keys"
import { providerData } from "./provider-data"
import { submitProviderData } from "./submit-provider-data"
import { createAppointment } from "./create-appointment"
import { verifiedProviderData } from "./verified-provider-data"
import { providerSecret } from "./provider-secret"
import { restoreFromBackup } from "./restore-from-backup"
import { updateAppointment } from "./update-appointment"
import { cancelAppointment } from "./cancel-appointment"
import { publishAppointments } from "./publish-appointments"
import { getAppointments } from "./get-appointments"

import { Actor } from "../actor"
import { Backend } from "../backend"
import { Settings } from "../settings"
import { KeyPair } from "../crypto/interfaces"

export interface Slot {
    id: string
}

export interface Appointment {
    bookings: any[]
    updatedAt: string
    modified: boolean
    timestamp: string
    duration: number
    properties: { [Key: string]: any }
    id: string
    slotData: Slot[]
}

export interface KeyPairs {
    signing: KeyPair
    encryption: KeyPair
    sync: string
}

export interface ReferenceData {
    [Key: string]: any
}

export interface VerifiedData {}

export interface Data {}

export class Provider extends Actor {
    public backupData = backupData
    public checkVerifiedProviderData = checkVerifiedProviderData
    public keys = keys
    public providerData = providerData
    public submitProviderData = submitProviderData
    public createAppointment = createAppointment
    public verifiedProviderData = verifiedProviderData
    public providerSecret = providerSecret
    public restoreFromBackup = restoreFromBackup
    public updateAppointment = updateAppointment
    public cancelAppointment = cancelAppointment
    public publishAppointments = publishAppointments
    public getAppointments = getAppointments
    public generateKeyPairs = generateKeyPairs

    constructor(id: string, settings: Settings, backend: Backend) {
        super("provider", id, settings, backend)
    }

    public get openAppointments(): Array<Appointment> {
        return this.get("openAppointments")
    }

    public set openAppointments(appointments: Array<Appointment>) {
        this.set("openAppointments", appointments)
    }

    public get loggedOut(): boolean {
        return this.get("loggedOut")
    }

    public set loggedOut(loggedOut: boolean) {
        this.set("loggedOut", loggedOut)
    }

    public get keyPairs(): KeyPairs | null {
        return this.get("keyPairs")
    }

    public set keyPairs(keyPairs: KeyPairs | null) {
        this.set("keyPairs", keyPairs)
    }

    public get referenceData(): ReferenceData | null {
        return this.get("referenceData")
    }

    public get data(): Data | null {
        return this.get("verifiedData")
    }

    public set data(data: Data | null) {
        this.set("data", data)
    }

    public get verifiedData(): VerifiedData | null {
        return this.get("verifiedData")
    }

    public set verifiedData(verifiedData: any) {
        this.set("verifiedData", verifiedData)
    }

    public get secret(): string {
        return this.get("secret")
    }

    public set secret(secret: string) {
        this.set("secret", secret)
    }
}
