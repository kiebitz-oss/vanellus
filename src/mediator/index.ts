// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { confirmProvider } from "./confirm-provider"
import { pendingProviders, verifiedProviders } from "./providers"
import { getStats } from "./get-stats"
import { MediatorKeyPairs } from "../interfaces"
import { Actor } from "../actor"
import { Backend } from "../backend"

export class Mediator extends Actor {
    public confirmProvider = confirmProvider
    public pendingProviders = pendingProviders
    public verifiedProviders = verifiedProviders
    public getStats = getStats

    constructor(id: string, backend: Backend) {
        super("mediator", id, backend)
    }

    public get keyPairs(): MediatorKeyPairs | null {
        return this.get("keyPairs")
    }

    public set keyPairs(keyPairs: MediatorKeyPairs | null) {
        this.set("keyPairs", keyPairs)
    }
}
