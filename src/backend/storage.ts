// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import JSONRPCBackend from "./jsonrpc"
import { Settings } from "../interfaces"

// The storage backend
export class StorageBackend extends JSONRPCBackend {
    constructor(settings: Settings) {
        super(settings, "storage")
    }

    async storeSettings({ id, data }: { id: string; data: any }) {
        return await this.call(this.methods.storeSettings, { id, data })
    }

    async getSettings({ id }: { id: string }) {
        return await this.call(this.methods.getSettings, { id })
    }
}
