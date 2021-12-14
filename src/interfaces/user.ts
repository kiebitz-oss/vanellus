import { KeyPair, ECDHData, SignedData } from "./"

export interface QueueData {
    zipCode: string
}

export interface SignedToken extends SignedData {}

export interface ContactData {
    name?: string
}

export interface UserToken {}

export interface TokenData {
    keyPair: KeyPair
    signingKeyPair: KeyPair
    signedToken: SignedToken
    userToken: UserToken
}
