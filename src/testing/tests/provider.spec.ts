// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { equal } from "assert"
import { Status } from "../../interfaces"
import { User } from "../../user"
import { formatDate } from "../../helpers/time"
import {
    adminKeys,
    backend,
    mediator,
    resetDB,
    unverifiedProvider,
} from "../fixtures"

describe("Provider lifecycle", function () {
    it ("create and authenticate a provider and work with appointments", async function () {
        const be = backend()
        const keys = await adminKeys()
        let result

        await resetDB(be, keys)

        // create mediator
        const med = await mediator(be, keys)
        if ("code" in med) throw new Error("creating mediator failed")

        //create provider
        const provider = await unverifiedProvider(be, keys)
        if ("code" in provider) throw new Error("creating provider failed")

        // confirm provider
        const pendingProviders = await med.pendingProviders()
        if ("status" in pendingProviders && pendingProviders.status === Status.Failed) {
            throw new Error("fetching provider data failed")
        }
        result = await med.confirmProvider(pendingProviders.providers[0])
        if ("error" in result) throw new Error("confirmation failed")

        const tomorrow = new Date( new Date().getTime() + (1000 * 60 * 60 * 24))
        var appTime = new Date( tomorrow.getTime() )
        appTime.setHours(8)
        appTime.setMinutes(0)
        appTime.setSeconds(0)
        for (var i = 0; i < 5; i++) {
          const app = await provider.createAppointment({
              duration: 15,
              vaccine: "moderna",
              slotN: 5,
              timestamp: appTime.toISOString()
          });

          result = await provider.publishAppointments( [app] );
          equal(result, 'ok')

          appTime = new Date(appTime.getTime() + 1000 * 60 * 3)
        }

        const user = new User("testUser", backend())
        result = await this.user.getAppointments({
            from: formatDate(tomorrow),
            to: formatDate(tomorrow),
            zipCode: "10707"
        })
        equal(result.status, Status.Succeeded)
        equal(result.appointments[0].offers.length, 5)
    })
})
