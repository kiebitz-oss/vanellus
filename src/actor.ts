// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Backend } from "./backend"
import { Observer } from "./helpers/observer"
import { PublicKeys, Result, Error, Status } from "./interfaces"

interface PublicKeysResult extends Result {
    keys: PublicKeys
}

export interface CacheResult<T> {
    args: any[]
    result: T
}

export interface Cache<T, G> {
    get(...args: any[]): Promise<T>
}

export function cached<T, G extends Actor>(
    f: (this: G, ...args: any[]) => Promise<T>,
    name: string
): (this: G) => Cache<T, G> {
    return function (this: G) {
        return {
            get: async (...args: any[]): Promise<T> => {
                const result = await f.apply(this, args)
                this.setTemporarily(name, {
                    args: args,
                    result: result,
                } as CacheResult<T>)
                return result
            },
            result: (): T | null => {
                const cacheResult = this.getTemporarily(name)
                if (cacheResult === null) return null
                return cacheResult.result
            },
            args: (): any[] | null => {
                const cacheResult = this.getTemporarily(name)
                if (cacheResult === null) return null
                return cacheResult.args
            },
        }
    }
}

async function getKeys(this: Actor): Promise<PublicKeysResult | Error> {
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

export class Actor extends Observer {
    public keys = cached(getKeys, "keys")
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

    protected get(key: string): any {
        return this.backend.local.get(`${this.actor}::${this.id}::${key}`)
    }

    protected set(key: string, value: any) {
        this.notify(key, value)
        this.backend.local.set(`${this.actor}::${this.id}::${key}`, value)
    }

    protected getTemporarily(key: string): any {
        return this.backend.temporary.get(`${this.actor}::${this.id}::${key}`)
    }

    protected setTemporarily(key: string, value: any) {
        this.notify(key, value)
        this.backend.temporary.set(`${this.actor}::${this.id}::${key}`, value)
    }

    public unlock(key: string) {}

    public clearLocks() {}

    public lock(key: string) {}
}
