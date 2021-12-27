// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { deepEqual } from "assert"
import { formatDate } from "../helpers/time"
import { Provider } from "../provider"
import { ecdhDecrypt } from "../crypto"
import { Status } from "../interfaces"
import {
    adminKeys,
    resetDB,
    mediator,
    backend,
    verifiedProvider,
} from "../testing/fixtures"

describe("Provider.backupData()", function () {
    it("we should be able to backup data", async function () {
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

        const backupResult = await vp.backupData()

        if (backupResult.status === Status.Failed)
            throw new Error("cannot backup data")

        const newProvider = new Provider("new", be)

        newProvider.secret = vp.secret

        let restoreResult = await newProvider.restoreFromBackup(
            backupResult.data
        )

        if (restoreResult.status === Status.Failed)
            throw new Error("cannot restore data")

        deepEqual(newProvider.data, vp.data)

        // we overwrite the secret
        newProvider.initialize()

        restoreResult = await newProvider.restoreFromBackup(backupResult.data)

        if (restoreResult.status !== Status.Failed)
            throw new Error("should fail")
    })
})
