// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { equal } from "assert"
import { User } from "../../user"
import {
    adminKeys,
    backend,
    mediator,
    resetDB,
    verifiedProvider,
} from "../fixtures"

describe("Mediator lifecycle", function () {
    it ("run through a typical mediator workflow", async function () {

        const be = backend()
        const keys = await adminKeys()
        let result

        await resetDB(be, keys)

        // create mediator
        const med = await mediator(be, keys)
        if ("code" in med) throw new Error("creating mediator failed")

    })
})

