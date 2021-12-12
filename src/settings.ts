export interface Translations {}

export default class Settings {
    public appointmentProperties: { [Key: string]: any }

    constructor() {
        this.appointmentProperties = {}
    }

    public apiUrl(key: string): string {
        return ""
    }

    public t(t: Translations, key: string, ...args: any[]): string {
        return ""
    }
}
