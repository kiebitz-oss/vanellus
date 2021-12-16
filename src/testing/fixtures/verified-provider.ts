import { AdminKeys } from "./"
import {
    generateECDSAKeyPair,
    generateECDHKeyPair,
    ecdhEncrypt,
    ecdhDecrypt,
} from "../../crypto"
import { Backend } from "../../backend"
import { Mediator } from "../../mediator"
import { Provider } from "../../provider"
import { unverifiedProvider } from "./unverified-provider"
import {
    ProviderData,
    RPCError,
    KeyPair,
    EncryptedProviderData,
    Status,
} from "../../interfaces"

export async function verifiedProvider(
    backend: Backend,
    adminKeys: AdminKeys,
    mediator: Mediator
): Promise<Provider | RPCError> {
    const provider = await unverifiedProvider(backend, adminKeys)

    let pendingProviders = await mediator.pendingProviders()

    if ("code" in provider) throw new Error("cannot create unverified provider")

    if (pendingProviders.status == Status.Failed) {
        throw new Error("fetching provider data failed")
    }

    const pendingProvider = pendingProviders.providers.find(
        (pr: EncryptedProviderData) =>
            pr.data!.publicKeys.signing === provider.keyPairs!.signing.publicKey
    )

    const result = await mediator.confirmProvider(pendingProvider!)

    if ("error" in result) throw new Error("cannot confirm provider")

    return provider
}
