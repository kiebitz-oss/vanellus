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
    unverifiedProvider,
} from "../testing/fixtures"

describe("Provider.checkData()", function () {
    it("we should be able to retrieve confirmed provider data", async function () {
        const be = backend()
        const keys = await adminKeys()
        await resetDB(be, keys)
        const med = await mediator(be, keys)
        const provider = await unverifiedProvider(be, keys)

        var result

        result = await provider.checkData()
        if (result.status !== Status.Failed)
            throw new Error("checkData should fail for unverified providers")

        const pendingProviders = await med.pendingProviders()
        if (pendingProviders.status == Status.Failed) {
            throw new Error("fetching provider data failed")
        }
        result = await med.confirmProvider(pendingProviders.providers[0])

        result = await provider.checkData()
        if (result.status === Status.Failed)
            throw new Error("cannot get confirmed data")
    })
})
