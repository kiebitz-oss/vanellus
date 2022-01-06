// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Backend } from "./backend"
import { Observer } from "./helpers/observer"
import { PublicKeys, Result, Error, Status } from "./interfaces"

interface PublicKeysResult extends Result {
    keys: PublicKeys
}

export class Actor extends Observer {
    public backend: Backend
    public actor: string
    public id: string

    constructor(actor: string, id: string, backend: Backend) {
        // the ID will be used to address local storage so that e.g. we can
        // manage multiple providers, users etc. if necessary...

        super()

        this.actor = actor
        this.id = id
        this.backend = backend
    }

    public async getKeys(): Promise<PublicKeysResult | Error> {
        const result = await this.backend.appointments.getKeys()

        if ("code" in result)
            return {
                status: Status.Failed,
                error: result,
            }

        return {
            status: Status.Succeeded,
            keys: result,
        }
    }

    protected get(key: string): any {
        return this.backend.local.get(`${this.actor}::${this.id}::${key}`)
    }

    protected set(key: string, value: any) {
        this.notify(key, value)
        this.backend.local.set(`${this.actor}::${this.id}::${key}`, value)
    }

    public unlock(key: string) {}

    public clearLocks() {}

    public lock(key: string) {}
}
