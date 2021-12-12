// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import JSONRPCBackend from "./jsonrpc"
import Settings from "../settings"

// The storage backend
export default class StorageBackend extends JSONRPCBackend {
    public settings: Settings

    constructor(settings: Settings) {
        super(settings, "storageApi")
        this.settings = settings
    }

    async storeSettings({ id, data }: { id: string; data: any }) {
        return await this.call("storeSettings", { id, data })
    }

    async getSettings({ id }: { id: string }) {
        return await this.call("getSettings", { id })
    }
}
