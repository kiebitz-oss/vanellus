// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { backupData } from "./backup-data"
import { checkVerifiedProviderData } from "./check-verified-provider-data"
import { generateKeyPairs } from "./generate-key-pairs"
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
import {
    ProviderBackupReferenceData,
    ProviderData,
    VerifiedProviderData,
    KeyPair,
    ProviderKeyPairs,
    Appointment,
} from "../interfaces"

export class Provider extends Actor {
    public backupData = backupData
    public checkVerifiedProviderData = checkVerifiedProviderData
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

    constructor(id: string, backend: Backend) {
        super("provider", id, backend)
    }

    public get openAppointments(): Appointment[] {
        return this.get("openAppointments")
    }

    public set openAppointments(appointments: Appointment[]) {
        this.set("openAppointments", appointments)
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

    public get referenceData(): ProviderBackupReferenceData | null {
        return this.get("referenceData")
    }

    public set referenceData(
        referenceData: ProviderBackupReferenceData | null
    ) {
        this.set("referenceData", referenceData)
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
