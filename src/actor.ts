// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Backend } from "./backend"

export class Actor {
    public backend: Backend
    public actor: string
    public id: string

    constructor(actor: string, id: string, backend: Backend) {
        // the ID will be used to address local storage so that e.g. we can
        // manage multiple providers, users etc. if necessary...

        this.actor = actor
        this.id = id
        this.backend = backend
    }

    protected get(key: string): any {
        return this.backend.local.get(`${this.actor}::${this.id}::${key}`)
    }

    protected set(key: string, value: any) {
        this.backend.local.set(`${this.actor}::${this.id}::${key}`, value)
    }

    public unlock(key: string) {}

    public clearLocks() {}

    public lock(key: string) {}
}
