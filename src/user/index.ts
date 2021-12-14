// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { restoreFromBackup } from "./restore-from-backup"
import { generateUserSecret } from "./generate-user-secret"
import { confirmOffers } from "./confirm-offers"
import { invitation } from "./invitation"
import { getToken } from "./get-token"
import { backupData } from "./backup-data"
import { cancelInvitation } from "./cancel-invitation"
import { getAppointments } from "./get-appointments"

import { Backend } from "../backend"
import {
    Settings,
    QueueData,
    TokenData,
    ContactData,
    AcceptedInvitation,
    ProviderAppointments,
} from "../interfaces"
import { Actor } from "../actor"

export class User extends Actor {
    public restoreFromBackup = restoreFromBackup
    public confirmOffers = confirmOffers
    public invitation = invitation
    public getToken = getToken
    public backupData = backupData
    public cancelInvitation = cancelInvitation
    public getAppointments = getAppointments
    private generateUserSecret = generateUserSecret

    constructor(id: string, settings: Settings, backend: Backend) {
        super("provider", id, settings, backend)
    }

    public initialize() {
        this.userSecret = this.generateUserSecret()
    }

    public get queueData(): QueueData | null {
        return this.get("queueData")
    }

    public set queueData(queueData: QueueData | null) {
        this.set("queueData", queueData)
    }

    public get userSecret(): string | null {
        return this.get("userSecret")
    }

    public set userSecret(userSecret: string | null) {
        this.set("userSecret", userSecret)
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

    public get acceptedInvitation(): AcceptedInvitation | null {
        return this.get("acceptedInvitation")
    }

    public set acceptedInvitation(
        acceptedInvitation: AcceptedInvitation | null
    ) {
        this.set("acceptedInvitation", acceptedInvitation)
    }
}
