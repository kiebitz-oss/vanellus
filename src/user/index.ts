// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import restoreFromBackup from "./restore-from-backup"
import acceptInvitation from "./accepted-invitation"
import confirmOffers from "./confirm-offers"
import contactData from "./contact-data"
import invitation from "./invitation"
import tokenData from "./token-data"
import getToken from "./get-token"
import userSecret from "./user-secret"
import queueData from "./queue-data"
import backupData from "./backup-data"
import appointments from "./appointments"
import confirmDeletion from "./confirm-deletion"
import cancelInvitation from "./cancel-invitation"
import getAppointments from "./get-appointments"

class User {
    public restoreFromBackup = restoreFromBackup
    public acceptInvitation = acceptInvitation
    public confirmOffers = confirmOffers
    public contactData = contactData
    public invitation = invitation
    public tokenData = tokenData
    public getToken = getToken
    public userSecret = userSecret
    public queueData = queueData
    public backupData = backupData
    public appointments = appointments
    public confirmDeletion = confirmDeletion
    public cancelInvitation = cancelInvitation
    public getAppointments = getAppointments
}
