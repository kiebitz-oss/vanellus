// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { restoreFromBackup } from "./restore-from-backup"
import { getToken } from "./get-token"
import { backupData } from "./backup-data"
import { generateKeyPairs } from "./generate-key-pairs"
import { bookAppointment } from "./book-appointment"
import { cancelAppointment } from "./cancel-appointment"
import { getAppointments } from "./get-appointments"
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

import { Actor } from "../actor"

export class User extends Actor {
    public restoreFromBackup = restoreFromBackup
    public cancelAppointment = cancelAppointment
    public generateKeyPairs = generateKeyPairs
    public bookAppointment = bookAppointment
    public getAppointments = getAppointments
    public backupData = backupData
    public getToken = getToken

    private generateSecret() {
        this.secret = buf2base32(b642buf(randomBytes(10)))
    }

    constructor(id: string, backend: Backend) {
        super("provider", id, backend)
    }

    public async initialize() {
        await this.generateKeyPairs()
        this.generateSecret()
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

    public get verifiedAppointments(): ProviderAppointments[] | null {
        return this.get("verifiedAppointments")
    }

    public set verifiedAppointments(
        verifiedAppointments: ProviderAppointments[] | null
    ) {
        this.set("verifiedAppointments", verifiedAppointments)
    }

    public get acceptedAppointment(): AcceptedAppointment | null {
        return this.get("acceptedAppointment")
    }

    public set acceptedAppointment(
        acceptedAppointment: AcceptedAppointment | null
    ) {
        this.set("acceptedAppointment", acceptedAppointment)
    }
}
