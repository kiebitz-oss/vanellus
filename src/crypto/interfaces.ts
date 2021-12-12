export interface KeyPair {
    publicKey: string
    privateKey: JsonWebKey
}

export interface Data {
    iv: string
    data: string
}

export interface ECDHData {
    publicKey: string
    iv: string
    data: string
}

export interface SignedData {
    publicKey?: string
    signature: string
    data: string
}
