// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
// README.md contains license information.

import { b642buf, buf2b64, str2ab } from "../helpers/conversion"

export async function hash(rawData: string) {
  const data = b642buf(rawData)
  return buf2b64(await crypto.subtle.digest("SHA-256", data))
}

export async function hashString(rawData: string) {
  const data = str2ab(rawData)
  return buf2b64(await crypto.subtle.digest("SHA-256", data))
}
