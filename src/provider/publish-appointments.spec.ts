// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { equal } from "assert"
import { formatDate } from "../helpers/time"
import { ecdhDecrypt } from "../crypto"
import { Status } from "../interfaces"
import {
    adminKeys,
    resetDB,
    mediator,
    backend,
    verifiedProvider,
} from "../testing/fixtures"

describe("Provider.publishAppointments()", function () {
    it("we should be able to publish appointments", async function () {
        const be = backend()
        const keys = await adminKeys()
        // we reset the database
        await resetDB(be, keys)
        // we create a mediator
        const med = await mediator(be, keys)
        // we create an unverified provider
        const vp = await verifiedProvider(be, keys, med)

        var appointments = []

        let date = new Date()

        // tomorrow 3 pm

        date.setDate(date.getDate() + 1)
        date.setHours(15)
        date.setMinutes(0)
        date.setSeconds(0)
        date.setMilliseconds(0)

        for (var i = 0; i < 5; i++) {
            var app = await vp.createAppointment(
                15,
                "moderna",
                5,
                date.toISOString()
            )

            appointments.push(app)
            // 5 minutes later
            date = new Date(date.getTime() + 5 * 60 * 1000)
        }

        const publishResult = await vp.publishAppointments(appointments)

        if (publishResult.status !== Status.Succeeded)
            throw new Error("cannot publish appointments")

        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)

        const getResult = await vp.getAppointments({
            from: formatDate(tomorrow),
            to: formatDate(tomorrow),
        })

        if (getResult.status !== Status.Succeeded)
            throw new Error("cannot get appointments")
        if (getResult.appointments.length != 5)
            throw new Error("expected 5 appointments")

        if (vp.openAppointments.length != 5)
            throw new Error("new appointments should be saved")

        for (const app of vp.openAppointments) {
            equal(app.properties.vaccine, "moderna")
            equal(app.duration, 15)
            equal(app.slotData.length, 5)
        }
    })
})
