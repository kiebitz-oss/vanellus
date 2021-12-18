// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Status } from "../interfaces"
import { equal } from "assert"
import { formatDate } from "../helpers/time"
import { adminKeys, backend, resetDB } from "../testing/fixtures"
import { User } from "./"

describe("User.getAppointments()", function () {
    it("we should be able to fetch appointments", async function () {
        this.user = new User("main", backend())

        const keys = await adminKeys()
        await resetDB(backend(), keys)

        const today = formatDate(new Date())
        const result = await this.user.getAppointments({
            from: today,
            to: today,
            zipCode: "10707"
        })
        equal(result.status, Status.Succeeded)
        equal(result.appointments.length, 0)
    })
})
