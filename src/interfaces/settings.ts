export interface AppointmentSettings {
    properties: { [Key: string]: any }
}

export interface ApiUrls {
    appointments: string
    storage: string
}

export interface Settings {
    apiUrls: ApiUrls
    appointment: AppointmentSettings
}
