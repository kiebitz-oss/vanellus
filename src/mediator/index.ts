// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { confirmProvider } from "./confirm-provider"
import { keyPairs } from "./key-pairs"
import { pendingProviders, verifiedProviders } from "./providers"
import { getStats } from "./get-stats"
import { validKeyPairs } from "./valid-key-pairs"
import { reconfirmProviders } from "./reconfirm-providers"
import { KeyPair } from "../interfaces"

export interface KeyPairs {
    signing: KeyPair
    encryption: KeyPair
    sync: string
}

class Mediator {
    public confirmProvider = confirmProvider
    public keyPairs = keyPairs
    public pendingProviders = pendingProviders
    public verifiedProviders = verifiedProviders
    public getStats = getStats
    public validKeyPairs = validKeyPairs
    public reconfirmProviders = reconfirmProviders
}
