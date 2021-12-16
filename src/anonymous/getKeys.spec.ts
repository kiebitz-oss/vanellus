import { equal } from "assert"
import { Actor } from "../actor"
import {
    adminKeys,
    backend,
} from "../testing/fixtures"

describe("Anonymous.getKeys()", function () {
    it ("we should be able to get the public keys anonymously", async function () {
        const be = backend()
        const keys = await adminKeys()

        const actor = new Actor("anonymous", "anonymous", be)

        const publicKeys = await actor.getKeys()

        equal(publicKeys.rootKey, keys.root.publicKey)
        equal(publicKeys.tokenKey, keys.token.publicKey)
        equal(publicKeys.providerData, keys.provider.publicKey)
    })
})
