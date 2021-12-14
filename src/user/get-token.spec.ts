// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Status } from "../interfaces"
import { equal } from "assert"
import { formatDate } from "../helpers/time"
import { settings, backend } from "../testing/settings"
import { User } from "./"

beforeEach(function () {
    this.user = new User("main", settings, backend)
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

describe("getToken()", function () {
    it("should be able to get a token", async function () {
        const today = formatDate(new Date())
        const result = await this.user.getToken({})
        equal(result.status, Status.Succeeded)
        equal(result.tokenData.userToken.version, "0.3")
    })
})
