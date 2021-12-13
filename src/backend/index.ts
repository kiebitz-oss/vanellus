// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { PrefixStore } from "./store"
import { AppointmentsBackend } from "./appointments"
import { StorageBackend } from "./storage"
import { LocalBackend } from "./local"
import { Settings, Store } from "../interfaces"

export * from "./store"

export class Backend {
    public local: LocalBackend
    public storage: StorageBackend
    public temporary: LocalBackend
    public settings: Settings
    public appointments: AppointmentsBackend

    constructor(settings: Settings, store: Store, temporaryStore: Store) {
        this.settings = settings
        this.storage = new StorageBackend(settings)
        this.appointments = new AppointmentsBackend(settings)
        this.local = new LocalBackend(settings, new PrefixStore(store, "local"))
        this.temporary = new LocalBackend(
            settings,
            new PrefixStore(temporaryStore, "temporary")
        )
    }
}
