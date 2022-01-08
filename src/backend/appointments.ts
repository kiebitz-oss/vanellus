// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    OK,
    Booking,
    Settings,
    KeyPair,
    ECDHData,
    PublicKeys,
    SignedData,
    SignedToken,
    SignedAppointment,
    ConfirmedProviderData,
    SignedMediatorKeyData,
    EncryptedProviderData,
    ProviderAppointments,
} from "../interfaces"
import JSONRPCBackend from "./jsonrpc"

// The appointments backend
export class AppointmentsBackend extends JSONRPCBackend {
    constructor(settings: Settings) {
        super(settings, "appointments")
    }

    async confirmProvider(
        {
            confirmedProviderData,
            publicProviderData,
            signedKeyData,
        }: {
            confirmedProviderData: SignedData
            publicProviderData: SignedData
            signedKeyData: SignedData
        },
        keyPair: KeyPair
    ) {
        return await this.call<OK>(
            "confirmProvider",
            {
                confirmedProviderData,
                publicProviderData,
                signedKeyData,
            },
            keyPair
        )
    }

    // public endpoints

    async getAppointment({
        id,
        providerID,
    }: {
        id: string
        providerID: string
    }) {
        return this.call<ProviderAppointments>("getAppointment", {
            id,
            providerID,
        })
    }
    async getAppointmentsByZipCode({
        zipCode,
        from,
        to,
    }: {
        zipCode: string
        from: string
        to: string
    }) {
        return this.call<ProviderAppointments[]>("getAppointmentsByZipCode", {
            zipCode,
            from,
            to,
        })
    }

    async getStats({
        id,
        metric,
        type,
        n,
        filter,
        from,
        to,
    }: {
        id?: string
        metric?: string
        type: string
        n?: number
        filter?: { [Key: string]: any }
        from?: string
        to?: string
    }) {
        return await this.call("getStats", {
            id,
            metric,
            type,
            n,
            from,
            to,
            filter,
        })
    }

    // return all public keys present in the system
    async getKeys() {
        return this.call<PublicKeys>("getKeys", {})
    }

    // root endpoints

    // only works for test deployments
    async resetDB({}: {}, keyPair: KeyPair) {
        return await this.call<OK>("resetDB", {}, keyPair)
    }

    async addMediatorPublicKeys(
        { signedKeyData }: { signedKeyData: SignedMediatorKeyData },
        keyPair: KeyPair
    ) {
        return this.call<OK>(
            "addMediatorPublicKeys",
            { signedKeyData },
            keyPair
        )
    }

    // user endpoints

    async cancelAppointment(
        {
            providerID,
            slotID,
            id,
            signedTokenData,
        }: {
            providerID: string
            slotID: string
            id: string
            signedTokenData: SignedData
        },
        keyPair: KeyPair
    ) {
        return this.call<OK>(
            "cancelAppointment",
            { providerID, slotID, id, signedTokenData },
            keyPair
        )
    }

    async bookAppointment(
        {
            providerID,
            id,
            encryptedData,
            signedTokenData,
        }: {
            providerID: string
            id: string
            encryptedData: ECDHData
            signedTokenData: SignedData
        },
        keyPair: KeyPair
    ) {
        return this.call<Booking>(
            "bookAppointment",
            { providerID, id, encryptedData, signedTokenData },
            keyPair
        )
    }

    // get a token for a given queue
    async getToken({
        hash,
        publicKey,
        code,
    }: {
        hash: string
        publicKey: string
        code?: string
    }) {
        return this.call<SignedToken>("getToken", {
            hash: hash,
            code: code,
            publicKey: publicKey,
        })
    }

    // provider-only endpoints

    // get all published appointments from the backend
    async getAppointments(
        { from, to }: { from: string; to: string },
        keyPair: KeyPair
    ) {
        return this.call<SignedAppointment[]>(
            "getProviderAppointments",
            { from, to },
            keyPair
        )
    }

    // publish all local appointments to the backend
    async publishAppointments(
        { appointments }: { appointments: SignedData[] },
        keyPair: KeyPair
    ) {
        return await this.call<OK>(
            "publishAppointments",
            { appointments },
            keyPair
        )
    }

    async storeProviderData(
        { encryptedData, code }: { encryptedData: ECDHData; code?: string },
        keyPair: KeyPair
    ) {
        return this.call<OK>(
            "storeProviderData",
            { encryptedData, code },
            keyPair
        )
    }

    async checkProviderData({}, keyPair: KeyPair) {
        return await this.call<ConfirmedProviderData>(
            "checkProviderData",
            {},
            keyPair
        )
    }

    // mediator-only endpoint

    async getPendingProviderData(
        { limit }: { limit?: number },
        keyPair: KeyPair
    ) {
        return this.call<EncryptedProviderData[]>(
            "getPendingProviderData",
            { limit },
            keyPair
        )
    }

    async getVerifiedProviderData(
        { limit }: { limit?: number },
        keyPair: KeyPair
    ) {
        return this.call<EncryptedProviderData[]>(
            "getVerifiedProviderData",
            { limit },
            keyPair
        )
    }
}
