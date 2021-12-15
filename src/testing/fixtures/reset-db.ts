import { Backend } from "../../backend"
import { AdminKeys } from "./"

export async function resetDB(backend: Backend, adminKeys: AdminKeys) {
    await backend.appointments.resetDB({}, adminKeys.root)
}
