import { User } from "./"
import { randomBytes } from "../crypto"
import { buf2base32, b642buf } from "../helpers/conversion"

export function generateUserSecret(this: User): string {
    return buf2base32(b642buf(randomBytes(10)))
}
