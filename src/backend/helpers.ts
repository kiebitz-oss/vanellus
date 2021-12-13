import { RPCResponse, RPCError } from "../interfaces"

export async function e<T>(call: Promise<RPCResponse>): Promise<RPCError | T> {
    const response = await call
    if (response.error) return response.error
    return response.result as T
}
