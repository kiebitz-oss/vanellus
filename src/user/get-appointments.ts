// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Status, Result, Error, ProviderAppointments } from "../interfaces"
import { verify } from "../crypto"
import { User } from "./"

async function verifyOffer(offer: any, item: any) {
    // to do: verify based on key chain
    /*
    let found = false;
    for (const providerKeys of keys.lists.providers) {
        if (providerKeys.json.signing === offer.publicKey) {
            found = true;
            break;
        }
    }
    if (!found) throw 'invalid key';
    const result = await verify([offer.publicKey], offer);
    if (!result) throw 'invalid signature';
    */
    return JSON.parse(offer.data)
}

async function verifyProviderData(item: any) {
    // to do: verify based on key chain
    /*
    let found = false;
    if (item.keyChain.mediator.signin)
    for (const mediatorKeys of keys.lists.mediators) {
        if (mediatorKeys.json.signing === providerData.publicKey) {
            found = true;
            break;
        }
    }
    if (!found) throw 'invalid key';
    const result = await verify([item.provider.publicKey], providerData);
    if (!result) throw 'invalid signature';
    */
    return JSON.parse(item.provider.data)
}

interface GetAppointmentsResult extends Result {
    appointments: ProviderAppointments[]
}

interface GetAppointmentsParams {
    from: string
    to: string
    zipCode: string
}

export async function getAppointments(
    this: User,
    { from, to, zipCode }: GetAppointmentsParams
): Promise<GetAppointmentsResult | Error> {
    const response = await this.backend.appointments.getAppointmentsByZipCode({
        zipCode: zipCode,
        from: from,
        to: to,
    })

    if (!(response instanceof Array))
        return {
            status: Status.Failed,
            error: response,
        }

    const verifiedAppointments: ProviderAppointments[] = []

    for (const item of response) {
        item.provider.json = await verifyProviderData(item)
        const verifiedOffers = []
        for (const offer of item.offers) {
            const verifiedOffer = await verifyOffer(offer, item)
            for (const slot of verifiedOffer.slotData) {
                if (offer.bookedSlots!.some((id: any) => id === slot.id))
                    slot.open = false
                else slot.open = true
            }
            verifiedOffers.push(verifiedOffer)
        }
        item.offers = verifiedOffers
        verifiedAppointments.push(item)
    }

    verifiedAppointments.sort((a, b) =>
        a.provider.json!.name > b.provider.json!.name ? 1 : -1
    )

    return {
        status: Status.Succeeded,
        appointments: verifiedAppointments,
    }
}
