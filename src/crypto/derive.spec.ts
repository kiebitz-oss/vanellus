import { equal } from "assert"
import { randomBytes, deriveSecrets } from "./"
import { b642buf } from "../helpers/conversion"

import crypto from "crypto"

// @ts-ignore
global.crypto = crypto.webcrypto

describe("Secret derivation test", () => {
    it("should be able to derive secrets", async () => {
        const passcode = randomBytes(16)

        const idAndKey = await deriveSecrets(b642buf(passcode), 32, 2)

        equal(idAndKey![0].length, 44)
    })
})
