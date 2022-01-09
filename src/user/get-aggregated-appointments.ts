// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    Status,
    Result,
    Error,
    ErrorType,
    Appointment,
    VerifiedAggregatedProviderAppointments,
} from "../interfaces"
import { GetAppointmentsParams } from "./get-appointments"
import { verify } from "../crypto"
import { User } from "./"

async function verifyAppointment(appointment: any, item: any) {
    // to do: verify based on key chain
    /*
    let found = false;
    for (const providerKeys of keys.lists.providers) {
        if (providerKeys.json.signing === appointment.publicKey) {
            found = true;
            break;
        }
    }
    if (!found) throw 'invalid key';
    const result = await verify([appointment.publicKey], appointment);
    if (!result) throw 'invalid signature';
    */
    return JSON.parse(appointment.data)
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

export interface GetAggregatedAppointmentsResult extends Result {
    data: VerifiedAggregatedProviderAppointments[]
}

export async function getAggregatedAppointments(
    this: User,
    { from, to, zipCode }: GetAppointmentsParams
): Promise<GetAggregatedAppointmentsResult | Error> {
    const response =
        await this.backend.appointments.getAggregatedAppointmentsByZipCode({
            zipCode: zipCode,
            from: from,
            to: to,
        })

    if (!(response instanceof Array))
        return {
            status: Status.Failed,
            error: {
                type: ErrorType.RPC,
                data: response,
            },
        }

    const verifiedAppointments: VerifiedAggregatedProviderAppointments[] = []

    for (const item of response) {
        item.provider.json = await verifyProviderData(item)
        // we copy the ID for convenience
        item.provider.json!.id = item.provider.id
        verifiedAppointments.push({
            provider: item.provider.json,
            aggregatedAppointments: item.aggregatedAppointments,
        } as VerifiedAggregatedProviderAppointments)
    }

    verifiedAppointments.sort((a, b) =>
        a.provider.name > b.provider.name ? 1 : -1
    )

    return {
        status: Status.Succeeded,
        data: verifiedAppointments,
    }
}
