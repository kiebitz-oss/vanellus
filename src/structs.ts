export enum Status {
    Succeeded = "succeeded",
    Failed = "failed",
    Waiting = "waiting",
}

export interface Result {
    status: Status.Succeeded
    [key: string]: any
}

export interface Error {
    status: Status.Failed
    error: { [key: string]: any }
}
