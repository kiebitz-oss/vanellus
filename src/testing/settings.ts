// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Settings } from "../settings"
import {
    Backend,
    InMemoryStorage,
    StorageStore,
    Store,
    Storage,
} from "../backend"

import fetch from "node-fetch"

// @ts-ignore
global.fetch = fetch

export const settings: Settings = {
    appointment: {
        properties: {},
    },
    apiUrls: {
        appointments: "http://localhost:8888/jsonrpc",
        storage: "http://localhost:8888/jsonrpc",
    },
}

export const store: Store = new StorageStore(new InMemoryStorage())
export const temporaryStore: Store = new StorageStore(new InMemoryStorage())
export const backend: Backend = new Backend(settings, store, temporaryStore)
