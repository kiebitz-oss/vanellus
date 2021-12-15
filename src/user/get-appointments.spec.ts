// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Status } from "../interfaces"
import { equal } from "assert"
import { formatDate } from "../helpers/time"
import { backend } from "../testing/fixtures"
import { User } from "./"

beforeEach(function () {
    this.user = new User("main", backend())
    this.user.queueData = {
        zipCode: "10707",
    }
})

describe("get appointments test", function () {
    it("should be able to fetch appointments", async function () {
        const today = formatDate(new Date())
        const result = await this.user.getAppointments({
            from: today,
            to: today,
        })
        equal(result.status, Status.Succeeded)
        equal(result.appointments.length, 0)
    })
})
