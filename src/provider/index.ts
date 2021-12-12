// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import backupData from "./backup-data"
import checkVerifiedProviderData from "./check-verified-provider-data"
import keyPairs from "./key-pairs"
import keys from "./keys"
import providerData from "./provider-data"
import schedule from "./schedule"
import submitProviderData from "./submit-provider-data"
import createAppointment from "./create-appointment"
import verifiedProviderData from "./verified-provider-data"
import providerSecret from "./provider-secret"
import openAppointments from "./open-appointments"
import restoreFromBackup from "./restore-from-backup"
import updateAppointment from "./update-appointment"
import cancelAppointment from "./cancel-appointment"
import publishAppointments from "./publish-appointments"
import getAppointments from "./get-appointments"

interface Appointment {}

export class Provider {
    public backupData = backupData
    public checkVerifiedProviderData = checkVerifiedProviderData
    public keyPairs = keyPairs
    public keys = keys
    public providerData = providerData
    public schedule = schedule
    public submitProviderData = submitProviderData
    public createAppointment = createAppointment
    public verifiedProviderData = verifiedProviderData
    public providerSecret = providerSecret
    public openAppointments = openAppointments
    public restoreFromBackup = restoreFromBackup
    public updateAppointment = updateAppointment
    public cancelAppointment = cancelAppointment
    public publishAppointments = publishAppointments
    public getAppointments = getAppointments

    // this will be replaced by persistent storage
    private _loggedOut: boolean
    private _openAppointments: Array<Appointment>
    private _id: string

    constructor(id: string){
        // the ID will be used to address local storage so that e.g. we can
        // manage multiple providers, users etc. if necessary...
        this._id = id
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
}
