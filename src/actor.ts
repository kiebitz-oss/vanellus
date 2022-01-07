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

type Task = [string, Date, number]

function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export function locked<T, G extends Actor>(
    f: (this: G, ...args: any[]) => Promise<T | Error>
): (this: G, ...args: any[]) => Promise<T | Error> {
    return async function (this: G, ...args: any[]): Promise<T | Error> {
        // we lock the task
        if ((await this.lock(f.name)) === false)
            return { status: Status.Failed } // we can't obtain a lock

        const result = await f.apply(this, args)

        // we unlock the task
        this.unlock(f.name)

        return result
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

    private _taskId: number
    private _tasks: Task[]
    private _locked: boolean

    constructor(actor: string, id: string, backend: Backend) {
        // the ID will be used to address local storage so that e.g. we can
        // manage multiple providers, users etc. if necessary...

        super()

        this._taskId = 0
        this._tasks = []
        this._locked = false

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
        if (this._tasks.length === 0) return false // should never happen
        if (this._tasks[0][0] !== task) return false // wrong task order (should not happen)
        this._tasks = this._tasks.slice(1)
        return true
    }

    async lock(task: string) {
        if (this._tasks.find((t: Task) => t[0] === task) !== undefined) {
            console.warn(
                `Task ${this.actor}::${this.id}::${task} is already in queue, aborting...`
            )
            return false
        }

        const taskId = this._taskId++
        this._tasks.push([task, new Date(), taskId])

        while (true) {
            if (this._tasks.length === 0) return false // should not happen
            const [t, dt, id] = this._tasks[0]
            if (id === taskId) break // it's our turn
            if (new Date().getTime() - dt.getTime() > 1000 * 10)
                // tasks time out after 10 seconds
                this._tasks = this._tasks.slice(1)
            await timeout(10)
        }
        return true
    }

    clearLocks() {
        this._tasks = []
    }
}
