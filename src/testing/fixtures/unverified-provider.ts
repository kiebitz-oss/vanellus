import { AdminKeys } from "./"
import {
    generateECDSAKeyPair,
    generateECDHKeyPair,
    ecdhEncrypt,
    ecdhDecrypt,
} from "../../crypto"
import { Backend } from "../../backend"
import { ProviderData, RPCError, KeyPair } from "../../interfaces"

export interface Provider {
    dataKeyPair: KeyPair
    signingKeyPair: KeyPair
    encryptionKeyPair: KeyPair
    data: ProviderData
}

export async function unverifiedProvider(
    backend: Backend,
    adminKeys: AdminKeys
): Promise<Provider | RPCError> {
    const dataKeyPair = await generateECDHKeyPair()
    const signingKeyPair = await generateECDSAKeyPair()
    const encryptionKeyPair = await generateECDHKeyPair()

    const providerData: ProviderData = {
        name: "Max Mustermann",
        street: "Musterstr. 23",
        city: "Berlin",
        zipCode: "10707",
        description: "",
        email: "max@mustermann.de",
        publicKeys: {
            encryption: encryptionKeyPair!.publicKey,
            signing: signingKeyPair!.publicKey,
        },
    }

    const jsonData = JSON.stringify(providerData)

    const encryptedData = await ecdhEncrypt(
        jsonData,
        dataKeyPair!,
        adminKeys.provider.publicKey
    )

    const response = await backend.appointments.storeProviderData(
        { encryptedData: encryptedData! },
        signingKeyPair!
    )

    if (response != "ok") return response // this is an error

    return {
        dataKeyPair: dataKeyPair!,
        signingKeyPair: signingKeyPair!,
        encryptionKeyPair: encryptionKeyPair!,
        data: providerData,
    }
}
