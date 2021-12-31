// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Provider } from "./"
import { randomBytes } from "../crypto"
import { Appointment, Slot } from "../interfaces"

export function createSlot() {
    return {
        open: true,
        id: randomBytes(32),
    }
}

export async function createAppointment(
    this: Provider,
    duration: number,
    vaccine: string,
    slots: number,
    timestamp: string
) {
    var slotData: Slot[] = []
    for (var i = 0; i < slots; i++) {
        slotData[i] = {
            id: randomBytes(32),
            open: true,
        }
    }
    const now = new Date().toISOString()

    return {
        bookings: [],
        updatedAt: now,
        modified: true,
        timestamp: timestamp,
        duration: duration,
        properties: { vaccine: vaccine },
        id: randomBytes(32),
        publicKey: "",
        slotData: slotData,
    }
}
