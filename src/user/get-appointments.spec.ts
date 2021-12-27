// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Status } from "../interfaces"
import { equal } from "assert"
import { formatDatetime } from "../helpers/time"
import {
    backend,
    adminKeys,
    resetDB,
    mediator,
    verifiedProvider,
} from "../testing/fixtures"
import { User } from "./"

beforeEach(async function () {
    this.backend = backend()

    const keys = await adminKeys()
    // we reset the database
    await resetDB(this.backend, keys)
    // we create a mediator
    const med = await mediator(this.backend, keys)
    // we create an unverified provider
    const vp = await verifiedProvider(this.backend, keys, med)

    let date = new Date()

    // tomorrow 3 pm

    date.setDate(date.getDate() + 1)
    date.setHours(15)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)

    var app = await vp.createAppointment(15, "moderna", 5, date.toISOString())

    const publishResult = await vp.publishAppointments([app])

    if (publishResult.status !== Status.Succeeded)
        throw new Error("cannot create appointment")

    this.user = new User("main", this.backend)
    // we generate a secret etc.
    this.user.initialize()
    // we set the queue data
    this.user.queueData = {
        zipCode: "10707",
    }
    // we set the contact data
    this.user.contactData = {
        name: "Max Mustermann",
    }
})

describe("User.getAppointments()", function () {
    it("we should be able to get appointments", async function () {
        const fromDate = new Date()
        // 24 hours in the future
        const toDate = new Date(new Date().getTime() + 48 * 60 * 60 * 1000)
        const result = await this.user.getAppointments({
            from: formatDatetime(fromDate),
            to: formatDatetime(toDate),
            zipCode: this.user.queueData!.zipCode,
        })

        if (result.status !== Status.Succeeded)
            throw new Error("should not fail")

        if (result.appointments.length !== 1)
            throw new Error("should return one appointment")
    })
})
