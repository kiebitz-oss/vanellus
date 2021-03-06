// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { restoreFromBackup } from "./restore-from-backup"
import { getToken } from "./get-token"
import { backupData } from "./backup-data"
import { generateKeyPairs } from "./generate-key-pairs"
import { bookAppointment } from "./book-appointment"
import { cancelAppointment } from "./cancel-appointment"
import { getAppointment } from "./get-appointment"
import { getAppointments } from "./get-appointments"
import { getAggregatedAppointments } from "./get-aggregated-appointments"
import { buf2base32, b642buf } from "../helpers/conversion"
import { randomBytes } from "../crypto"
import { Backend } from "../backend"

import {
    QueueData,
    TokenData,
    ContactData,
    UserKeyPairs,
    AcceptedAppointment,
    ProviderAppointments,
} from "../interfaces"

import { Actor, cached, locked } from "../actor"

export class User extends Actor {
    public restoreFromBackup = locked(restoreFromBackup)
    public cancelAppointment = locked(cancelAppointment)
    public generateKeyPairs = locked(generateKeyPairs)
    public bookAppointment = locked(bookAppointment)
    public backupData = locked(backupData)
    public getToken = locked(getToken)

    // cached endpoints
    public aggregatedAppointments = cached(
        locked(getAggregatedAppointments),
        "aggregatedAppointments"
    )
    public appointments = cached(locked(getAppointments), "appointments")
    public appointment = cached(locked(getAppointment), "appointment")

    private generateSecret() {
        this.secret = buf2base32(b642buf(randomBytes(10)))
    }

    constructor(id: string, backend: Backend) {
        super("user", id, backend)
    }

    public async initialize() {
        this.generateSecret()
        await this.generateKeyPairs()
    }

    public get queueData(): QueueData | null {
        return this.get("queueData")
    }

    public set queueData(queueData: QueueData | null) {
        this.set("queueData", queueData)
    }

    public get secret(): string | null {
        return this.get("secret")
    }

    public set secret(secret: string | null) {
        this.set("secret", secret)
    }

    public get keyPairs(): UserKeyPairs | null {
        return this.get("keyPairs")
    }

    public set keyPairs(keyPairs: UserKeyPairs | null) {
        this.set("keyPairs", keyPairs)
    }

    public get tokenData(): TokenData | null {
        return this.get("tokenData")
    }

    public set tokenData(tokenData: TokenData | null) {
        this.set("tokenData", tokenData)
    }

    public get contactData(): ContactData | null {
        return this.get("contactData")
    }

    public set contactData(contactData: ContactData | null) {
        this.set("contactData", contactData)
    }

    public get acceptedAppointments(): AcceptedAppointment[] {
        return this.get("acceptedAppointments") || []
    }

    public set acceptedAppointments(
        acceptedAppointments: AcceptedAppointment[]
    ) {
        this.set("acceptedAppointments", acceptedAppointments)
    }
}
