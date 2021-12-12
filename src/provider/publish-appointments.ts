// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes, sign } from "../crypto"
import { Provider } from "./"

export async function publishAppointments(this: Provider) {
    const properties = this.settings.get("appointmentProperties")

    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock("publishAppointments")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        const openAppointments = this.backend.local.get(
            "provider::appointments::open",
            []
        )

        const signedAppointments = []
        const relevantAppointments = openAppointments.filter(
            (oa) =>
                new Date(oa.timestamp) >
                    new Date(new Date().getTime() - 1000 * 60 * 60 * 4) &&
                oa.modified
        )

        for (const appointment of relevantAppointments) {
            try {
                const convertedAppointment = {
                    id: appointment.id,
                    duration: appointment.duration,
                    timestamp: appointment.timestamp,
                    publicKey: keyPairs.encryption.publicKey,
                    properties: {},
                    slotData: appointment.slotData.map((sl) => ({
                        id: sl.id,
                    })),
                }

                for (const [k, v] of Object.entries(properties)) {
                    for (const [kk] of Object.entries(v.values)) {
                        if (appointment[kk] === true)
                            convertedAppointment.properties[k] = kk
                    }
                }
                // we sign each appointment individually so that the client can
                // verify that they've been posted by a valid provider
                const signedAppointment = await sign(
                    keyPairs.signing.privateKey,
                    JSON.stringify(convertedAppointment),
                    keyPairs.signing.publicKey
                )

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
            keyPairs.signing
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
    } catch (e) {
        return {
            status: "failed",
        }
    } finally {
        this.unlock("publishAppointments")
    }
}
