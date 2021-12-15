import { ECDHData } from "./"

export interface ProviderBackupReferenceData {
    [Key: string]: any
}

export interface EncryptedProviderData {
    encryptedData: ECDHData
    data?: ProviderData
}

export interface VerifiedProviderData {}

export interface ProviderPublicKeys {
    signing: string
    encryption: string
}

export interface ProviderData {
    name: string
    street: string
    city: string
    zipCode: string
    description: string
    email: string
    accessible?: boolean
    website?: string
    publicKeys: ProviderPublicKeys
}
