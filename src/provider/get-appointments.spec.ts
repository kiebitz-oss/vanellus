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

describe("Provider.getAppointments()", function () {
    it("we should be able to get provider appointments", async function () {
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

        const today = formatDate(new Date())
        const result = await vp.getAppointments({ from: today, to: today })

        if ("error" in result) throw new Error("cannot get appointments")
    })
})
