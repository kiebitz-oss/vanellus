// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Status } from "../structs"
import { equal } from "assert"
import { formatDate } from "../helpers/time"
import { settings, backend } from "../testing/settings"
import { User } from "./"

beforeEach(function () {
    this.user = new User("main", settings, backend)
    this.user.queueData = {
        zipCode: "10707",
    }
})

describe("get appointments test", function () {
    it("should be able to derive secrets", async function () {
        const today = formatDate(new Date())
        const result = await this.user.getAppointments({
            from: today,
            to: today,
        })
        equal(result.status, Status.Succeeded)
        equal(result.data.length, 0)
    })
})
