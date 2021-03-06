// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { equal } from "assert"
import { formatDatetime } from "../helpers/time"
import { ecdhDecrypt } from "../crypto"
import { Status } from "../interfaces"
import {
    adminKeys,
    resetDB,
    mediator,
    backend,
    verifiedProvider,
} from "../testing/fixtures"

describe("Provider.getAppointments()", function () {
    it("we should be able to get provider appointments", async function () {
        const be = backend()
        const keys = await adminKeys()
        await resetDB(be, keys)
        const med = await mediator(be, keys)
        const vp = await verifiedProvider(be, keys, med)
        const fromDate = new Date()
        const toDate = new Date(fromDate.getTime() + 60 * 60 * 24 * 1000)
        const result = await vp.appointments().get({
            from: formatDatetime(fromDate),
            to: formatDatetime(toDate),
        })
        equal(result.status, Status.Succeeded)
    })
})
