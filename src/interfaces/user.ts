import { KeyPair, ECDHData, SignedData } from "./"

export interface QueueData {
    zipCode: string
}

export interface SignedToken extends SignedData {}

export interface TokenData {
    [Key: string]: any
}

export interface ContactData {
    
}

export interface TokenData {
    keyPair: KeyPair
    tokenData: TokenData
    signingKeyPair: KeyPair
    signedToken: SignedToken
    encryptedContactData: ECDHData
}
