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

import Backend from "../backend"
import Settings from "../settings"

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

export class Provider {
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

    public backend: Backend
    public settings: Settings

    // this will be replaced by persistent storage
    private _loggedOut: boolean
    private _openAppointments: Array<Appointment>
    private _id: string
    private _keyPairs: KeyPairs | null
    private _verifiedData: any
    private _secret: string
    private _referenceData: { [Key: string]: any } | null

    constructor(id: string, settings: Settings, backend: Backend) {
        // the ID will be used to address local storage so that e.g. we can
        // manage multiple providers, users etc. if necessary...

        this._id = id
        this._referenceData = null
        this._verifiedData = null
        this._loggedOut = true
        this._secret = ""
        this._openAppointments = []
        this._keyPairs = null

        this.backend = backend
        this.settings = settings
    }

    public get openAppointments(): Array<Appointment> {
        return this._openAppointments
    }

    public set openAppointments(appointments: Array<Appointment>) {
        this._openAppointments = appointments
    }

    public get loggedOut(): boolean {
        return this._loggedOut
    }

    public set loggedOut(loggedOut: boolean) {
        this._loggedOut = loggedOut
    }

    public get keyPairs(): KeyPairs | null {
        return this._keyPairs
    }

    public get referenceData() {
        return this._referenceData
    }

    public get verifiedData(): any {
        return this._verifiedData
    }

    public set verifiedData(value: any) {
        this._verifiedData = value
    }

    public get secret(): string {
        return this._secret
    }

    public unlock(key: string) {}

    public clearLocks() {}

    public lock(key: string) {}
}
