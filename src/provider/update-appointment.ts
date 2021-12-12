// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes } from "../crypto"
import { createSlot } from "./create-appointment"
import { Provider } from "./"

export async function updateAppointment(
    this: Provider,
    data: any,
    appointment: any
) {
    try {
        // we lock the local backend to make sure we don't have any data races
        await this.lock("updateAppointment")
    } catch (e) {
        throw null // we throw a null exception (which won't affect the store state)
    }

    try {
        const openAppointments = this.backend.local.get(
            "appointments::open",
            []
        )

        const otherAppointments = openAppointments.filter(
            (ap: any) => ap.id !== appointment.id
        )
        if (!openAppointments.find((ap: any) => ap.id === appointment.id))
            return {
                status: "failed",
            }

        const openSlots = appointment.slotData.filter(
            (sl: any) => !sl.canceled && sl.open
        )
        const closedSlots = appointment.slotData.filter(
            (sl: any) => !sl.canceled && !sl.open
        )

        // we take as many slots from the closed ones
        const cs = Math.min(closedSlots.length, data.slotData.length)
        // then we take the rest from the open ones
        const os = Math.min(
            openSlots.length,
            Math.max(0, data.slotData.length - cs)
        )
        // and we possible add new slots as well
        const ns = Math.max(0, data.slotData.length - cs - os)

        appointment.slotData = [
            ...closedSlots.slice(0, cs),
            ...openSlots.slice(0, os),
            ...[...Array(ns).keys()].map(() => createSlot()),
        ]

        for (const [k, v] of Object.entries(data)) {
            appointment[k] = v
        }

        appointment.modified = true

        // we push the modified appointment
        otherAppointments.push(appointment)
        this.backend.local.set("appointments::open", otherAppointments)

        return {
            status: "loaded",
            data: otherAppointments,
        }
    } finally {
        this.unlock("updateAppointment")
    }
}
