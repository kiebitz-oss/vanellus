// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhEncrypt, ephemeralECDHEncrypt } from "../crypto"
import { Status, OK, Result, AcceptedInvitation, Error } from "../interfaces"
import { User } from "./"

interface ConfirmOffersResult extends Result {
    acceptedInvitation: AcceptedInvitation
}

export async function confirmOffers(this: User, offers: any, invitation: any): Promise<ConfirmOffersResult | Error > {
    const providerData = {
        signedToken: this.tokenData!.signedToken,
        tokenData: this.tokenData!.tokenData,
        contactData: this.tokenData!.encryptedContactData,
    }

    const encryptedProviderData = await ecdhEncrypt(
        JSON.stringify(providerData),
        this.tokenData!.keyPair,
        invitation.publicKey
    )

    for (const offer of offers) {

        const encryptedDataAndPublicKey = await ephemeralECDHEncrypt(
            JSON.stringify(providerData),
            offer.publicKey
        )

        const [encryptedData] = encryptedDataAndPublicKey!

        let response = await this.backend.appointments.bookAppointment(
            {
                id: offer.id,
                providerID: invitation.provider.id,
                encryptedData: encryptedData,
                signedTokenData: this.tokenData!.signedToken,
            },
            this.tokenData!.signingKeyPair
        )

        if (!("id" in response))
            return {
                status: Status.Failed,
                error: response,
            }

        const acceptedInvitation: AcceptedInvitation = {
            offer: offer,
            invitation: invitation,
            booking: response,
        }

        // we store the information about the offer which we've accepted
        this.acceptedInvitation = acceptedInvitation

        return {
            status: Status.Succeeded,
            acceptedInvitation: acceptedInvitation,
        }
   
    }
    return {
        status: Status.Failed,
    }
}
