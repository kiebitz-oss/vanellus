import { Settings } from "../settings"
import {
    Backend,
    InMemoryStorage,
    StorageStore,
    Store,
    Storage,
} from "../backend"

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
