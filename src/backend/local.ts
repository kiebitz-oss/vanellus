// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

function timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

import { Store } from "./store"
import { Settings } from "../settings"

type Task = [string, Date, number]

// The local backend
export class LocalBackend {
    public store: Store
    public settings: Settings

    private _taskId: number
    private _tasks: Task[]
    private _locked: boolean

    constructor(settings: Settings, store: Store) {
        this.settings = settings
        this.store = store
        this._taskId = 0
        this._tasks = []
        this._locked = false
    }

    get(key: string, defaultValue?: any) {
        return this.store.get(key, defaultValue)
    }

    unlock(task: string) {
        if (this._tasks.length === 0) throw "should not happen"
        if (this._tasks[0][0] !== task) throw "wrong task"
        this._tasks = this._tasks.slice(1)
        console.log(`Finished task ${task}...`)
    }

    clearLocks() {
        this._tasks = []
    }

    async lock(task: string) {
        if (this._tasks.find((t: Task) => t[0] === task) !== undefined) {
            console.log(`task ${task} is already in queue, aborting...`)
            throw "already queued up" // there's already a task queued up
        }

        const taskId = this._taskId++
        this._tasks.push([task, new Date(), taskId])

        while (true) {
            if (this._tasks.length === 0) throw "should not happen"
            const [t, dt, id] = this._tasks[0]
            if (id === taskId) break // it's our turn
            if (new Date().getTime() - dt.getTime() > 1000 * 60 * 5)
                // tasks time out after 5 minutes
                this._tasks = this._tasks.slice(1)
            await timeout(10)
        }
        console.log(`Executing task ${task}...`)
        // now we go...
    }

    set(key: string, data: any) {
        return this.store.set(key, data)
    }

    delete(key: string) {
        return this.store.delete(key)
    }

    deleteAll(prefix: string) {
        return this.store.deleteAll(prefix)
    }
}
