// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

// make sure the signing and encryption key pairs exist
export async function getStats(
    state: any,
    keyStore: any,
    settings: any,
    params: any
) {
    const backend = settings.get("backend")
    try {
        const stats = await backend.appointments.getStats(params)
        return {
            status: "loaded",
            data: stats,
        }
    } catch (e) {
        console.error(e)
        return {
            status: "failed",
            error: e,
        }
    }
}

getStats.actionName = "getStats"
