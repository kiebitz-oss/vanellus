import { AdminKeys } from "./"
import { ecdhEncrypt, ecdhDecrypt } from "../../crypto"
import { Backend } from "../../backend"
import { Provider } from "../../provider"
import { ProviderData, RPCError, KeyPair } from "../../interfaces"

export async function unverifiedProvider(
    backend: Backend,
    adminKeys: AdminKeys
): Promise<Provider | RPCError> {
    const provider = new Provider("provider", backend)

    await provider.generateKeyPairs()

    const providerData: ProviderData = {
        name: "Max Mustermann",
        street: "Musterstr. 23",
        city: "Berlin",
        zipCode: "10707",
        description: "",
        email: "max@mustermann.de",
        publicKeys: {
            encryption: provider.keyPairs!.encryption.publicKey,
            signing: provider.keyPairs!.signing.publicKey,
        },
    }

    provider.data = providerData

    const jsonData = JSON.stringify(providerData)

    const encryptedData = await ecdhEncrypt(
        jsonData,
        provider.keyPairs!.data,
        adminKeys.provider.publicKey
    )

    const response = await backend.appointments.storeProviderData(
        { encryptedData: encryptedData! },
        provider.keyPairs!.signing
    )

    if (response != "ok") return response // this is an error

    return provider
}
