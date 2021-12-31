// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes, sign, verify, ecdhDecrypt } from "../crypto"
import {
    Status,
    Appointment,
    Slot,
    SignedAppointment,
    Result,
    Error,
} from "../interfaces"
import { Provider } from "./"

interface GetAppointmentsResult extends Result {
    appointments: Appointment[]
}

export async function getAppointments(
    this: Provider
): Promise<GetAppointmentsResult | Error> {
    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock("getAppointments")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    const decryptBookings = async (bookings: any) => {
        for (const booking of bookings) {
            const decryptedData = await ecdhDecrypt(
                booking.encryptedData,
                this.keyPairs!.encryption.privateKey
            )
            const dd = JSON.parse(decryptedData!)
            booking.data = dd
        }
        return bookings
    }

    try {
        const openAppointments = this.openAppointments

        const response = await this.backend.appointments.getAppointments(
            {},
            this.keyPairs!.signing
        )

        if (!(response instanceof Array))
            return {
                status: Status.Failed,
                error: response,
            }

        const newAppointments: Appointment[] = []

        for (const appointment of response) {
            const verified = await verify(
                [this.keyPairs!.signing.publicKey],
                appointment
            )
            if (!verified) {
                continue
            }
            const appData = JSON.parse(appointment.data)

            // this appointment was loaded already (should not happen)
            if (newAppointments.find((app) => app.id === appData.id)) {
                continue
            }

            const existingAppointment = openAppointments.find(
                (app) => app.id === appData.id
            )

            if (existingAppointment) {
                // if the remote version is older than the local one we skip this
                if (existingAppointment.modified) continue

                // we update the appointment by removing slots that do not exist
                // in the new version and by adding slots from the new version
                // that do not exist locally

                // remove slots that do not exist in the backend
                existingAppointment.slotData =
                    existingAppointment.slotData.filter((sl: Slot) =>
                        appData.slotData.some((slot: Slot) => slot.id === sl.id)
                    )

                // add new slots from the backend
                existingAppointment.slotData = [
                    ...existingAppointment.slotData,
                    ...appData.slotData.filter(
                        (sl: any) =>
                            !existingAppointment.slotData.some(
                                (slot: any) => slot.id === sl.id
                            )
                    ),
                ]

                // we update the slot data length
                existingAppointment.updatedAt = appData.updatedAt
                existingAppointment.bookings = await decryptBookings(
                    appointment.bookings || []
                )
                continue
            }

            const newAppointment: Appointment = {
                updatedAt: appData.updatedAt,
                timestamp: appData.timestamp,
                duration: appData.duration,
                slotData: appData.slotData,
                publicKey: appData.publicKey,
                properties: appData.properties,
                bookings: await decryptBookings(appointment.bookings || []),
                modified: false,
                id: appData.id,
            }

            newAppointments.push(newAppointment)
        }

        const allAppointments = [...openAppointments, ...newAppointments]
        this.openAppointments = allAppointments

        return {
            status: Status.Succeeded,
            appointments: allAppointments,
        }
    } catch (e) {
        console.error(e)
        return {
            status: Status.Failed,
            error: e as any,
        }
    } finally {
        this.unlock("getAppointments")
    }
}

getAppointments.actionName = "getAppointments"
