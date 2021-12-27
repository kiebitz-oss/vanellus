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

describe("Provider.checkData()", function () {
    it("we should be able to retrieve confirmed provider data", async function () {
        const be = backend()
        const keys = await adminKeys()
        // we reset the database
        await resetDB(be, keys)
        // we create a mediator
        const med = await mediator(be, keys)

        if ("code" in med) throw new Error("creating mediator failed")

        // we create an unverified provider
        const vp = await verifiedProvider(be, keys, med)

        if ("code" in vp) throw new Error("creating provider failed")

        const result = await vp.checkData({})

        if (result.status === Status.Failed)
            throw new Error("cannot get confirmed data")
    })
})
