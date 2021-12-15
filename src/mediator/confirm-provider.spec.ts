import { adminKeys } from "../testing/fixtures/admin-keys"

describe("Confirm provider test", function () {
    it("we should be able to confirm a provider", async function () {
        await adminKeys("../services/settings/dev/002_admin.json")
    })
})
