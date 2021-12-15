// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhEncrypt, ephemeralECDHEncrypt } from "../crypto"
import {
    Status,
    OK,
    Result,
    AcceptedInvitation,
    SignedProviderData,
    SignedAppointment,
    Error,
} from "../interfaces"
import { User } from "./"

interface ConfirmOffersResult extends Result {
    acceptedInvitation: AcceptedInvitation
}

export async function bookAppointment(
    this: User,
    signedAppointment: SignedAppointment,
    provider: SignedProviderData
): Promise<ConfirmOffersResult | Error> {
    const providerData = {
        signedToken: this.tokenData!.signedToken,
        userToken: this.tokenData!.userToken,
    }

    const appointment = signedAppointment.json!

    const encryptedDataAndPublicKey = await ephemeralECDHEncrypt(
        JSON.stringify(providerData),
        appointment.publicKey
    )

    // we don't care about the ephmeral key
    const [encryptedData] = encryptedDataAndPublicKey!

    let response = await this.backend.appointments.bookAppointment(
        {
            id: appointment.id,
            providerID: provider.id,
            encryptedData: encryptedData,
            signedTokenData: this.tokenData!.signedToken,
        },
        this.tokenData!.signingKeyPair
    )

    if ("code" in response)
        return {
            status: Status.Failed,
            error: response,
        }

    const acceptedInvitation: AcceptedInvitation = {
        appointment: signedAppointment,
        provider: provider,
        booking: response,
    }

    // we store the information about the offer which we've accepted
    this.acceptedInvitation = acceptedInvitation

    return {
        status: Status.Succeeded,
        acceptedInvitation: acceptedInvitation,
    }
}
