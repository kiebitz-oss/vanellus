import { AdminKeys } from "./"
import { Backend } from "../../backend"
import { Mediator } from "../../mediator"
import { generateECDSAKeyPair, generateECDHKeyPair, sign } from "../../crypto"
import {
    MediatorKeyData,
    SignedMediatorKeyData,
    KeyPair,
    RPCError,
} from "../../interfaces"

export async function mediator(
    backend: Backend,
    adminKeys: AdminKeys
): Promise<Mediator | RPCError> {
    const signingKeyPair = await generateECDSAKeyPair()
    const encryptionKeyPair = await generateECDHKeyPair()

    const mediatorKeyData: MediatorKeyData = {
        signing: signingKeyPair!.publicKey,
        encryption: encryptionKeyPair!.publicKey,
    }

    const signedData = await sign(
        adminKeys.root.privateKey,
        JSON.stringify(mediatorKeyData),
        adminKeys.root.publicKey
    )

    const response = await backend.appointments.addMediatorPublicKeys(
        {
            signedKeyData: {
                publicKey: signedData!.publicKey!,
                signature: signedData!.signature,
                data: signedData!.data,
            },
        },
        adminKeys.root
    )

    if (response != "ok") return response // this is an error

    const mediator = new Mediator("mediator", backend)

    mediator.keyPairs = {
        signing: signingKeyPair!,
        encryption: encryptionKeyPair!,
        provider: adminKeys.provider,
    }

    return mediator
}
