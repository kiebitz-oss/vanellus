// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhEncrypt } from "../crypto"
import { Result, Error, Status, AcceptedAppointment } from "../interfaces"
import { User } from "./"

export async function cancelAppointment(
    this: User,
    acceptedAppointment: AcceptedAppointment
): Promise<Result | Error> {
    const id = acceptedAppointment.appointment.id

    const result = await this.backend.appointments.cancelAppointment(
        {
            id: id,
            signedTokenData: this.tokenData!.signedToken,
            providerID: acceptedAppointment.provider.id,
        },
        this.tokenData!.keyPairs.signing
    )

    return {
        status: Status.Succeeded,
    }
}
