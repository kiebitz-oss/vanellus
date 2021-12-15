import { equal } from "assert"
import { ecdhDecrypt } from "../crypto"
import { Status } from "../interfaces"
import {
    adminKeys,
    resetDB,
    mediator,
    backend,
    unverifiedProvider,
} from "../testing/fixtures"

describe("Confirm provider test", function () {
    it("we should be able to confirm a provider", async function () {
        const be = backend()
        const keys = await adminKeys()
        // we reset the database
        await resetDB(be, keys)
        // we create a mediator
        const med = await mediator(be, keys)

        if ("code" in med) throw new Error("creating mediator failed")

        // we create an unverified provider
        const up = await unverifiedProvider(be, keys)

        if ("code" in up) throw new Error("creating provider failed")

        const pendingProviders = await med.pendingProviders()

        if (pendingProviders.status == Status.Failed) {
            throw new Error("fetching provider data failed")
        }

        equal(pendingProviders.providers.length, 1)
        equal(pendingProviders.providers[0].data!.name, up.data.name)

        const result = await med.confirmProvider(pendingProviders.providers[0])

        if ("error" in result) throw new Error("confirmation failed")

        // to do: finish test
    })
})
