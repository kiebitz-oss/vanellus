// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Actor } from "../actor"
import { PublicKeys, RPCError } from "../interfaces"

export async function getKeys(this: Actor): Promise<PublicKeys> {
      const result = await this.backend.appointments.getKeys()

      if ("rootKey" in result) {
          return result
      }
      else {
          throw new Error("Fetching public keys failed")
      }
}

