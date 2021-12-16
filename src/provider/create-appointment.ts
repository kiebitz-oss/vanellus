// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes } from "../crypto"
import { Provider } from "./"
import { Appointment } from "../interfaces"

export function createSlot() {
    return {
        open: true,
        id: randomBytes(32), // where the user can submit his confirmation
        status: randomBytes(32), // where the user can get the appointment status
        cancel: randomBytes(32), // where the user can cancel his confirmation
    }
}

export async function createAppointment(
    this: Provider,
    appointment: Appointment
) {
    const openAppointments = this.openAppointments
    openAppointments.push(appointment)
    this.openAppointments = openAppointments
    return {
        status: "loaded",
        data: openAppointments,
    }
}
