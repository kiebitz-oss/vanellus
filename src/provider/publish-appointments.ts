// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes, sign } from "../crypto"
import { SignedData } from "../interfaces"
import { Provider } from "./"

export async function publishAppointments(this: Provider) {
    const openAppointments = this.backend.local.get(
        "provider::appointments::open",
        []
    )

    const signedAppointments: SignedData[] = []
    const relevantAppointments = openAppointments.filter(
        (oa: any) =>
            new Date(oa.timestamp) >
                new Date(new Date().getTime() - 1000 * 60 * 60 * 4) &&
            oa.modified
    )

    for (const appointment of relevantAppointments) {
        try {
            const properties: { [Key: string]: any } = {}
            const convertedAppointment = {
                id: appointment.id,
                duration: appointment.duration,
                timestamp: appointment.timestamp,
                publicKey: this.keyPairs!.encryption.publicKey,
                properties: properties,
                slotData: appointment.slotData.map((sl: any) => ({
                    id: sl.id,
                })),
            }

            for (const [k, v] of Object.entries(
                this.backend.settings.appointment.properties
            )) {
                for (const [kk] of Object.entries(v.values)) {
                    if (appointment[kk] === true)
                        convertedAppointment.properties[k] = kk
                }
            }
            // we sign each appointment individually so that the client can
            // verify that they've been posted by a valid provider
            const signedAppointment = await sign(
                this.keyPairs!.signing.privateKey,
                JSON.stringify(convertedAppointment),
                this.keyPairs!.signing.publicKey
            )

            if (signedAppointment === null) throw "null"

            signedAppointments.push(signedAppointment)
        } catch (e) {
            console.error(e)
            continue
        }
    }

    if (signedAppointments.length === 0)
        return {
            status: "aborted",
            data: null,
        }

    const result = await this.backend.appointments.publishAppointments(
        {
            offers: signedAppointments,
        },
        this.keyPairs!.signing
    )

    for (const appointment of relevantAppointments) {
        // we remove the 'modified' tag so that it won't be published
        // again...
        delete appointment.modified
    }

    this.backend.local.set("appointments::open", openAppointments)

    return {
        status: "succeeded",
        data: result,
    }
}
