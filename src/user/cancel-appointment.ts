// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhEncrypt } from "../crypto"
import {
    Result,
    Error,
    ErrorType,
    Status,
    AcceptedAppointment,
} from "../interfaces"
import { User } from "./"

export async function cancelAppointment(
    this: User,
    acceptedAppointment: AcceptedAppointment
): Promise<Result | Error> {
    const response = await this.backend.appointments.cancelAppointment(
        {
            id: acceptedAppointment.appointment.id,
            signedTokenData: this.tokenData!.signedToken,
            providerID: acceptedAppointment.provider.id,
        },
        this.tokenData!.keyPairs.signing
    )

    if (response !== "ok")
        return {
            status: Status.Failed,
            error: {
                type: ErrorType.RPC,
                data: response,
            },
        }

    return {
        status: Status.Succeeded,
    }
}
