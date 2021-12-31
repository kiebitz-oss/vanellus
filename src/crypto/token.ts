// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { Buffer } from "buffer"
import { b642buf, buf2b64, str2ab } from "../helpers/conversion"

// salt for the key derivation (public information)
export const salt = b642buf(
    "tlsfpYaKiH/WZUnWkoeE2g==" // 16 bytes
)

export async function deriveToken(secret: string, n: number) {
    const secretBytes = b642buf(secret)

    const secretKey = await crypto.subtle.importKey(
        "raw",
        secretBytes,
        "HKDF",
        false,
        ["deriveBits"]
    )

    const token = await crypto.subtle.deriveBits(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: salt, // this is public information
            info: str2ab(`${n}`),
        },
        secretKey,
        256
    )

    return buf2b64(token)
}
