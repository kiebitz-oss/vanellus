// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Provider } from "./"

export async function keys(this: Provider) {
    try {
        const keys = await this.backend.appointments.getKeys()
        return {
            status: "loaded",
            data: keys,
        }
    } catch (e) {
        return { status: "failed", error: e }
    }
}
