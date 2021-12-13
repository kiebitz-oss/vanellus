// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Provider } from "./"
import { Appointment } from "../interfaces"

export async function cancelAppointment(
    this: Provider,
    appointment: Appointment
) {
    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock("canceledAppointment")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        const openAppointments = this.openAppointments

        // we select the appointment from the "official" list as the given appointment might
        // contain enrichment data and e.g. cyclic data structures...
        const canceledAppointment = openAppointments.find(
            (ap) => ap.id === appointment.id
        )

        if (canceledAppointment === undefined)
            return {
                status: "failed",
            }

        const otherAppointments = openAppointments.filter(
            (ap) => ap.id !== appointment.id
        )

        // we simply remove all slots
        canceledAppointment.slotData = []
        canceledAppointment.modified = true

        // we push the modified appointment
        otherAppointments.push(canceledAppointment)
        this.openAppointments = otherAppointments

        return {
            status: "suceeded",
            data: otherAppointments,
        }
    } finally {
        this.unlock("canceledAppointment")
    }
}
