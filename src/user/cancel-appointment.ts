// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhEncrypt } from "../crypto"
import { Result } from "../interfaces"
import { User } from "./"

export async function cancelAppointment(
    this: User,
    state: any,
    keyStore: any,
    settings: any,
    acceptedInvitation: any,
    tokenData: any
) {
    const id = acceptedInvitation.offer.id

    try {
        const result = await this.backend.appointments.cancelAppointment(
            {
                id: id,
                signedTokenData: tokenData.signedToken,
                providerID: acceptedInvitation.invitation.provider.id,
            },
            tokenData.signingKeyPair
        )
    } catch (e) {
        console.error(e)
        return {
            status: "failed",
            error: e,
        }
    }

    return {
        status: "succeeded",
    }
}
