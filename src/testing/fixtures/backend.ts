import { settings } from "../settings"
import { Store } from "../../interfaces"
import { Backend, InMemoryStorage, StorageStore } from "../../backend"

export function backend(): Backend {
    const store: Store = new StorageStore(new InMemoryStorage())
    const temporaryStore: Store = new StorageStore(new InMemoryStorage())
    return new Backend(settings, store, temporaryStore)
}
