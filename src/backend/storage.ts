// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import JSONRPCBackend from "./jsonrpc"
import { Settings, KeyPair } from "../interfaces"

// The storage backend
export class StorageBackend extends JSONRPCBackend {
    constructor(settings: Settings) {
        super(settings, "storage")
    }

    async storeSettings({ id, data }: { id: string; data: any }) {
        return await this.call("storeSettings", { id, data })
    }

    async getSettings({ id }: { id: string }) {
        return await this.call("getSettings", { id })
    }

    // only works for test deployments
    async resetDB({}: {}, keyPair: KeyPair) {
        return await this.call("resetDB", {}, keyPair)
    }
}
