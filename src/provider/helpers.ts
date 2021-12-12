// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

export function enrichAppointments(appointments: any) {
    const sortedAppointments = appointments
        .sort(
            (a: any, b: any) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
        )
        .map((oa: any) => ({ ...oa }))
    let activeAppointments: any[] = []

    for (const [i, oa] of sortedAppointments
        .filter((app: any) => app.slotData.length > 0)
        .entries()) {
        oa.maxOverlap = 0
        oa.index = i
        oa.start = new Date(`${oa.timestamp}`)
        // end of appointment (we calculate with 45 minute minimum duration)
        oa.stop = new Date(
            oa.start.getTime() + 1000 * 60 * Math.max(0, oa.duration)
        )
        activeAppointments = activeAppointments.filter(
            (aa) => aa.stop > oa.start
        )
        oa.overlapsWith = [...activeAppointments]

        for (const ova of oa.overlapsWith) {
            ova.overlapsWith.push(oa)
        }

        activeAppointments.push(oa)

        const na = activeAppointments.length - 1
        for (const aa of activeAppointments) {
            if (na > aa.maxOverlap) aa.maxOverlap = na
        }
    }
    return sortedAppointments
}
