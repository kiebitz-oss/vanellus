// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Status, Error, ProviderAppointments } from "../interfaces"
import { User } from "./"
import { formatDate } from "../helpers/time"

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

export async function getAppointments(
    this: User,
    zipCode: number,
    fromDate?: Date,
    toDate?: Date
) {
    try {
        const from = formatDate(fromDate || new Date())
        const to = formatDate(toDate || new Date())

        const response =
            await this.backend.appointments.getAppointmentsByZipCode({
                zipCode,
                from,
                to,
            })

        if (!(response instanceof Array))
            return {
                status: Status.Failed,
                error: response,
            }

        const verifiedAppointments = []

        for (const item of response as ProviderAppointments[]) {
            try {
                item.provider.json = await verifyProviderData(item)
                const verifiedOffers = []

                for (const offer of item.offers) {
                    const verifiedOffer = await verifyOffer(offer, item)

                    for (const slot of verifiedOffer.slotData) {
                        if (
                            offer.bookedSlots &&
                            offer.bookedSlots.some(
                                (bookedSlot) => bookedSlot.id === slot.id
                            )
                        ) {
                            slot.open = false
                        } else {
                            slot.open = true
                        }
                    }

                    verifiedOffers.push(verifiedOffer)
                }

                item.offers = verifiedOffers
                verifiedAppointments.push(item)
            } catch (e) {
                continue
            }
        }

        verifiedAppointments.sort((a, b) =>
            b.provider.json?.name &&
            a.provider.json?.name &&
            a.provider.json.name > b.provider.json.name
                ? 1
                : -1
        )

        this.verifiedAppointments = verifiedAppointments

        return {
            appointments: verifiedAppointments,
            status: Status.Succeeded,
        }
    } catch (e) {
        return {
            status: Status.Failed,
            error: e,
        } as Error
    }
}
