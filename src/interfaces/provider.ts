// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ECDHData, KeyPair } from "./"

export interface ProviderBackupReferenceData {
    [Key: string]: any
}

export interface EncryptedProviderData {
    encryptedData: ECDHData
    data?: SubmittedProviderData
}

export interface EncryptedConfirmedProviderData {
    iv: string
    data: string
    json?: ProviderData
}

export interface ConfirmedProviderData {
    publicKey?: string
    signature: string
    data: string
    json?: EncryptedConfirmedProviderData
}

export interface ProviderPublicKeys {
    signing: string
    encryption: string
}

export interface ProviderData {
    name: string
    street: string
    city: string
    zipCode: string
    description: string
    email: string
    accessible?: boolean
    website?: string
    submittedAt?: string
    version?: string
    id?: string
}

export interface SubmittedProviderData extends ProviderData {
    publicKeys?: ProviderPublicKeys
}

export interface VerifiedProviderData extends ProviderData {}

export interface ProviderKeyPairs {
    signing: KeyPair
    encryption: KeyPair
    data: KeyPair
    sync: string
}
