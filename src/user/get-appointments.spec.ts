// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Status } from "../interfaces"
import { equal } from "assert"
import { backend } from "../testing/fixtures"
import { User } from "./"

beforeEach(function () {
    this.user = new User("main", backend())
})

describe("User.getAppointments()", function () {
    it("we should be able to fetch appointments without a given date", async function () {
        const result = await this.user.getAppointments(10707)

        equal(result.status, Status.Succeeded)
        equal(result.appointments.length, 0)
    })

    it("we should be able to fetch appointments with a given date", async function () {
        const result = await this.user.getAppointments(
            10707,
            new Date(),
            new Date(),
        )

        equal(result.status, Status.Succeeded)
        equal(result.appointments.length, 0)
    })
})
