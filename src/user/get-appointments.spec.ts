// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Status } from "../interfaces"
import { equal } from "assert"
import { formatDatetime, formatDate } from "../helpers/time"
import {
    backend,
    adminKeys,
    resetDB,
    mediator,
    verifiedProvider,
} from "../testing/fixtures"
import { User } from "./"

describe("User.appointments()", function () {
    it("we should be able to get appointments", async function () {
        const be = backend()

        const keys = await adminKeys()
        // we reset the database
        await resetDB(be, keys)
        // we create a mediator
        const med = await mediator(be, keys)
        // we create an unverified provider
        const vp = await verifiedProvider(be, keys, med)

        let date = new Date()

        // tomorrow 3 pm

        date.setDate(date.getDate() + 1)
        date.setHours(15)
        date.setMinutes(0)
        date.setSeconds(0)
        date.setMilliseconds(0)

        const SLOTS = 5

        var app = await vp.createAppointment(
            15,
            "moderna",
            SLOTS,
            date.toISOString()
        )

        const publishResult = await vp.publishAppointments([app])

        if (publishResult.status !== Status.Succeeded)
            throw new Error("cannot create appointment")

        const user = new User("main", be)
        // we generate a secret etc.
        user.initialize()
        // we set the queue data
        user.queueData = {
            zipCode: "10707",
        }
        // we set the contact data
        user.contactData = {
            name: "Max Mustermann",
        }

        const fromDate = new Date()
        // 24 hours in the future
        const toDate = new Date(new Date().getTime() + 48 * 60 * 60 * 1000)
        const result = await user.appointments().get({
            from: formatDatetime(fromDate),
            to: formatDatetime(toDate),
            zipCode: user.queueData!.zipCode,
        })

        if (result.status !== Status.Succeeded)
            throw new Error("should not fail")

        if (result.data.length !== 1)
            throw new Error("should return one appointment")

        const aggregatedResult = await user.aggregatedAppointments().get({
            from: formatDatetime(fromDate),
            to: formatDatetime(toDate),
            zipCode: user.queueData!.zipCode,
        })

        if (aggregatedResult.status !== Status.Succeeded)
            throw new Error("should not fail")

        equal(aggregatedResult.data.length, 1)

        if (
            !(
                formatDate(date) in
                aggregatedResult.data[0].aggregatedAppointments
            )
        )
            throw new Error("expected appointment to show up")

        equal(
            aggregatedResult.data[0].aggregatedAppointments[formatDate(date)],
            SLOTS
        )
    })
})
