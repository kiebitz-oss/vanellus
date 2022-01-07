// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Backend } from "./backend"
import { Observer } from "./helpers/observer"
import { PublicKeys, Result, Error, ErrorType, Status } from "./interfaces"

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

interface Task {
    name: string
}

export function locked<T, G extends Actor>(
    f: (this: G, ...args: any[]) => Promise<T | Error>
): (this: G, ...args: any[]) => Promise<T | Error> {
    return async function (this: G, ...args: any[]): Promise<T | Error> {
        // we lock the task
        const [task, existing] = this.lock(f.name)
        if (existing) return { status: Status.Failed } // we can't obtain a lock
        try {
            return await f.apply(this, args)
        } catch (e) {
            console.log(e)
            return { status: Status.Failed }
        } finally {
            // we unlock the task
            this.unlock(f.name)
        }
    }
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
    const response = await this.backend.appointments.getKeys()

    if ("code" in response)
        return {
            status: Status.Failed,
            error: {
                type: ErrorType.RPC,
                data: response,
            },
        }

    return {
        status: Status.Succeeded,
        keys: response,
    }
}

export class Actor extends Observer {
    public keys = cached(locked(getKeys), "keys")
    public backend: Backend
    public actor: string
    public id: string

    private _tasks: { [Key: string]: Task }

    constructor(actor: string, id: string, backend: Backend) {
        // the ID will be used to address local storage so that e.g. we can
        // manage multiple providers, users etc. if necessary...

        super()

        this._tasks = {}

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

    unlock(task: string) {
        delete this._tasks[task]
    }

    lock(task: string): [Task, boolean] {
        if (this._tasks[task] === undefined) {
            this._tasks[task] = {
                name: task,
            }
            return [this._tasks[task], false]
        }

        return [this._tasks[task], true]
    }

    clearLocks() {
        this._tasks = {}
    }
}
