// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { equal } from "assert"
import { Status } from "../../interfaces"
import { User } from "../../user"
import {
    adminKeys,
    backend,
    mediator,
    resetDB,
    unverifiedProvider,
} from "../fixtures"

import { aesDecrypt, aesEncrypt, deriveSecrets } from "../../crypto"
import { base322buf, b642buf } from "../../helpers/conversion"

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

describe("Provider lifecycle", function () {
    it ("create and authenticate a provider and work with appointments", async function () {

        // set up utc timezone so tests work reliably
        dayjs.extend(utc)

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


        // provider backup and recovery

        // creates a 24 character alphanumeric secret key
        const providerSecret = await provider.initSecret()
        const providerSecret2 = await provider.initSecret()

        equal(providerSecret.length, 24)
        equal(providerSecret, providerSecret2) // init should not overwrite the secret

        const encryptedKeyFile = await provider.backupData(providerSecret)

        await provider.backend.local.deleteAll("provider") // delete local storage
        await provider.restoreFromBackup( providerSecret, encryptedKeyFile)

        // confirm provider
        const pendingProviders = await med.pendingProviders()
        if ("status" in pendingProviders && pendingProviders.status === Status.Failed) {
            throw new Error("fetching provider data failed")
        }
        result = await med.confirmProvider(pendingProviders.providers[0])
        if ("error" in result) throw new Error("confirmation failed")


        // provider changes metadata
        if (provider.data === null) throw new Error("data should not be empty")
        const providerMetaData = provider.data
        providerMetaData.name = "John Doe"
        provider.data = providerMetaData

        await provider.uploadData()
        await provider.backend.local.deleteAll("provider") // delete local storage
        await provider.restoreFromBackup( providerSecret, encryptedKeyFile)

        equal(provider.data.name, "John Doe")


        // provider publishes appointments
        const tomorrow = dayjs().utc().add(1, 'day')
        var appTime = dayjs().utc().add(1, 'day').hour(8).minute(0).second(0)
        var appointments = []

        for (var i = 0; i < 5; i++) {
            var app = await provider.createAppointment({
                duration: 15,
                vaccine: "moderna",
                slotN: 5,
                timestamp: appTime.toISOString()
            });

            appointments.push(app)
            appTime = appTime.add(5, 'minute')
        }

        // publish multiple appointments in single request
        result = await provider.publishAppointments( appointments );
        equal(result, 'ok')

        result = await provider.getAppointments({
            from: tomorrow.format('YYYY-MM-DD'),
            to: tomorrow.format('YYYY-MM-DD')
        })
        equal(result.length, 5)


        // provider changes appointment
        const nextWeek = dayjs().utc().add(1, 'week').hour(8)
        var app = await provider.createAppointment({
          duration: 15,
          vaccine: "moderna",
          slotN: 5,
          timestamp: nextWeek.toISOString()
        })

        result = await provider.publishAppointments( [app] );
        equal(result, 'ok')

        const user = new User("testUser", backend())
        result = await user.getAppointments({
            from: nextWeek.format('YYYY-MM-DD'),
            to: nextWeek.format('YYYY-MM-DD'),
            zipCode: "10707"
        })

        equal(result[0].offers[0].duration, 15)

        app.duration = 30
        result = await provider.publishAppointments( [app] );
        equal(result, 'ok')

        result = await user.getAppointments({
            from: nextWeek.format('YYYY-MM-DD'),
            to: nextWeek.format('YYYY-MM-DD'),
            zipCode: "10707"
        })

        equal(result[0].offers[0].duration, 30)


        // provider cancels appointment
        app.slotData = []
        result = await provider.publishAppointments( [app] );
        equal(result, 'ok')

        result = await user.getAppointments({
            from: nextWeek.format('YYYY-MM-DD'),
            to: nextWeek.format('YYYY-MM-DD'),
            zipCode: "10707"
        })

        equal(result.length, 0)

    })
})
