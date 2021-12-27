// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { ecdhEncrypt } from "../crypto"
import { Result, Error, Status } from "../interfaces"
import { User } from "./"

export async function cancelAppointment(this: User): Promise<Result | Error> {
    const id = this.acceptedAppointment!.appointment.json.id

    const result = await this.backend.appointments.cancelAppointment(
        {
            id: id,
            signedTokenData: this.tokenData!.signedToken,
            providerID: this.acceptedAppointment!.provider.id,
        },
        this.tokenData!.signingKeyPair
    )

    return {
        status: Status.Succeeded,
    }
}
