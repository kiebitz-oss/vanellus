// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { restoreFromBackup } from "./restore-from-backup"
import { acceptedInvitation } from "./accepted-invitation"
import { confirmOffers } from "./confirm-offers"
import { contactData } from "./contact-data"
import { invitation } from "./invitation"
import { getToken } from "./get-token"
import { userSecret } from "./user-secret"
import { backupData } from "./backup-data"
import { confirmDeletion } from "./confirm-deletion"
import { cancelInvitation } from "./cancel-invitation"
import { getAppointments } from "./get-appointments"

import { Backend } from "../backend"
import {
    Settings,
    QueueData,
    TokenData,
    ProviderAppointments,
} from "../interfaces"
import { Actor } from "../actor"

export class User extends Actor {
    public restoreFromBackup = restoreFromBackup
    public acceptedInvitation = acceptedInvitation
    public confirmOffers = confirmOffers
    public contactData = contactData
    public invitation = invitation
    public getToken = getToken
    public userSecret = userSecret
    public backupData = backupData
    public confirmDeletion = confirmDeletion
    public cancelInvitation = cancelInvitation
    public getAppointments = getAppointments

    constructor(id: string, settings: Settings, backend: Backend) {
        super("provider", id, settings, backend)
    }

    public get queueData(): QueueData | null {
        return this.get("queueData")
    }

    public set queueData(queueData: QueueData | null) {
        this.set("queueData", queueData)
    }

    public get tokenData(): TokenData | null {
        return this.get("tokenData")
    }

    public set tokenData(tokenData: TokenData | null) {
        this.set("tokenData", tokenData)
    }

    public get verifiedAppointments(): ProviderAppointments[] | null {
        return this.get("verifiedAppointments")
    }

    public set verifiedAppointments(
        verifiedAppointments: ProviderAppointments[] | null
    ) {
        this.set("verifiedAppointments", verifiedAppointments)
    }
}
