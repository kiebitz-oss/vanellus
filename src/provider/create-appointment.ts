// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { randomBytes } from "../crypto"
import { Appointment, Slot } from "../interfaces"

export function createSlot() {
    return {
        open: true,
        id: randomBytes(32), // where the user can submit his confirmation
        status: randomBytes(32), // where the user can get the appointment status
        cancel: randomBytes(32), // where the user can cancel his confirmation
    }
}

interface CreateAppointmentParams {
    duration: number,  // minutes
    vaccine: string,   // name of vaccine
    slotN: number,     // number of slots
    timestamp: string, // starting time of appointment
}

export async function createAppointment(
    { duration, vaccine, slotN, timestamp }: CreateAppointmentParams
) {
    var slots : Slot[] = [];
    for (var i = 0; i < slotN; i++) {
        slots[i] = {
            "id": randomBytes(32),
            "open": true,
        }
    }
    const now = new Date().toISOString()

    return {
        bookings: [],
        updatedAt: now,
        modified: true,
        timestamp: timestamp,
        duration: duration,
        properties: {"vaccine": vaccine},
        id: randomBytes(32),
        publicKey: "",
        slotData: slots,
    }
}
