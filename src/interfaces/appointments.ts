export interface Booking {
    id: string
}

export interface BookedSlot {
    id: string
}

export interface Slot {
    id: string
    open: boolean
}

export interface AcceptedInvitation {
    invitation: ProviderAppointments
    offer: SignedAppointment
    booking: Booking
}

export interface Appointment {
    bookings: any[]
    updatedAt: string
    modified: boolean
    timestamp: string
    duration: number
    properties: { [Key: string]: any }
    id: string
    slotData: Slot[]
}
export interface SignedAppointment {
    data: string
    updatedAt: string
    signature: string
    publicKey: string
    bookedSlots?: BookedSlot[]
    bookings?: Booking[]
    json?: Appointment
}

export interface SignedProviderData {
    data: string
    signature: string
    publicKey: string
    json?: PublicProviderData
}

export interface PublicProviderData {
    name: string
    street: string
    city: string
    zipCode: string
    description: string
}

export interface KeyChain {
    provider: ActorKey
    mediator: ActorKey
}

export interface ActorKey {
    data: string
    signature: string
    publicKey: string
    json?: ActorKeyData
}

export interface ActorKeyData {
    encryption: string
    signing: string
    data?: { [Key: string]: any }
}

export interface ProviderAppointments {
    provider: SignedProviderData
    offers: SignedAppointment[]
    keyChain: KeyChain
}
