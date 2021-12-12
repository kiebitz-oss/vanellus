// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { buf2base32, b642buf } from "../helpers/conversion"
import { randomBytes } from "../crypto"
import { enrichAppointments } from "./helpers"
import { Provider } from "./"

export async function openAppointments(this: Provider) {
    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock("openAppointments")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        const appointments = this.backend.local.get("appointments::open", [])
        let changed = false

        for (const appointment of appointments) {
            if (appointment.id === undefined) {
                appointment.id = randomBytes(32)
                changed = true
            }
        }

        if (changed) this.backend.local.set("appointments::open", appointments)

        try {
            return {
                status: "loaded",
                data: appointments,
                enrichedData: enrichAppointments(appointments),
            }
        } catch (e) {
            console.error(e)
        }
    } finally {
        this.unlock("openAppointments")
    }
}
