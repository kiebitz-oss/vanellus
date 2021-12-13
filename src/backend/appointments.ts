// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import {
    hash,
    sign,
    verify,
    deriveToken,
    generateECDSAKeyPair,
    ephemeralECDHEncrypt,
    ecdhDecrypt,
    generateECDHKeyPair,
    randomBytes,
} from "../crypto"

import {
    RPCError,
    Settings,
    KeyPair,
    ECDHData,
    SignedData,
    SignedAppointment,
    ProviderAppointments,
} from "../interfaces"
import { e } from "./helpers"
import JSONRPCBackend from "./jsonrpc"

// The appointments backend
export class AppointmentsBackend extends JSONRPCBackend {
    constructor(settings: Settings) {
        super(settings, "appointments")
    }

    async confirmProvider(
        {
            encryptedProviderData,
            publicProviderData,
            signedKeyData,
        }: {
            encryptedProviderData: ECDHData
            publicProviderData: SignedData
            signedKeyData: SignedData
        },
        keyPair: KeyPair
    ) {
        return await this.call(
            "confirmProvider",
            {
                encryptedProviderData,
                publicProviderData,
                signedKeyData,
            },
            keyPair
        )
    }

    // public endpoints

    async getAppointmentsByZipCode({
        zipCode,
        from,
        to,
    }: {
        zipCode: string
        from: string
        to: string
    }): Promise<ProviderAppointments[] | RPCError> {
        return e<ProviderAppointments[]>(
            this.call("getAppointmentsByZipCode", {
                zipCode,
                from,
                to,
            })
        )
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
        return await this.call("getKeys", {})
    }

    // user endpoints

    async cancelAppointment(
        {
            providerID,
            id,
            signedTokenData,
        }: { providerID: string; id: string; signedTokenData: SignedData },
        keyPair: KeyPair
    ) {
        return await this.call(
            "cancelAppointment",
            { providerID, id, signedTokenData },
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
        return await this.call(
            "bookAppointment",
            { providerID, id, encryptedData, signedTokenData },
            keyPair
        )
    }

    // get a token for a given queue
    async getToken({
        hash,
        encryptedData,
        publicKey,
        code,
        queueData,
        signedTokenData,
    }: {
        hash: string
        encryptedData: ECDHData
        publicKey: string
        code?: string
        queueData?: { [Key: string]: any }
        signedTokenData: SignedData
    }) {
        return await this.call("getToken", {
            hash: hash,
            code: code,
            publicKey: publicKey,
            encryptedData: encryptedData,
            queueData: queueData,
            signedTokenData: signedTokenData,
        })
    }

    // provider-only endpoints

    // get all published appointments from the backend
    async getAppointments(
        {},
        keyPair: KeyPair
    ): Promise<SignedAppointment[] | RPCError> {
        return e<SignedAppointment[]>(
            this.call("getProviderAppointments", {}, keyPair)
        )
    }

    // publish all local appointments to the backend
    async publishAppointments(
        { offers }: { offers: SignedData[] },
        keyPair: KeyPair
    ) {
        return await this.call("publishAppointments", { offers }, keyPair)
    }

    async cancelBooking({ id }: { id: string }, keyPair: KeyPair) {
        return await this.call("cancelBooking", { id }, keyPair)
    }

    // get n tokens from the given queue IDs
    async getBookedAppointments({}, keyPair: KeyPair) {
        return await this.call("getBookedAppointments", {}, keyPair)
    }

    async storeProviderData(
        { encryptedData, code }: { encryptedData: ECDHData; code?: string },
        keyPair: KeyPair
    ) {
        return await this.call(
            "storeProviderData",
            { encryptedData, code },
            keyPair
        )
    }

    async checkProviderData({}, keyPair: KeyPair) {
        return await this.call("checkProviderData", {}, keyPair)
    }

    // mediator-only endpoint

    async getPendingProviderData(
        { limit }: { limit: number },
        keyPair: KeyPair
    ) {
        return await this.call("getPendingProviderData", { limit }, keyPair)
    }

    async getVerifiedProviderData(
        { limit }: { limit: number },
        keyPair: KeyPair
    ) {
        return await this.call("getVerifiedProviderData", { limit }, keyPair)
    }
}
