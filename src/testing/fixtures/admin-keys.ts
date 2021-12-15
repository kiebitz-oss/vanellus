import fs from "fs"

import { AdminKeyPair } from "../../interfaces"

export interface AdminKeys {
    root: AdminKeyPair
    provider: AdminKeyPair
    token: AdminKeyPair
}

export function adminKeys(path: string): AdminKeys {
    const keys = fs.readFileSync(path, "ascii")
    const json = JSON.parse(keys)
    const extractKey = (name: string): AdminKeyPair => {
        const keyData: { [Key: string]: string } = json.admin.signing.keys.find(
            (key: any) => key.name === name
        )
        return {
            publicKey: keyData.public_key,
            privateKey: keyData.private_key,
        }
    }
    return {
        root: extractKey("root"),
        token: extractKey("token"),
        provider: extractKey("provider"),
    }
}
