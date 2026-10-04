const test = require("node:test");
const assert = require("node:assert/strict");
const Listing = require("../model/listing");
const { isLogin } = require("../middleware/isAuthenticate");
const { ForEqual } = require("../middleware/ForAuthorization");

test("login middleware saves local destination for a signed-out visitor", () => {
    const req = {
        isAuthenticated: () => false,
        originalUrl: "/listings/new",
        session: {},
        flash() {}
    };
    let redirected;
    isLogin(req, { redirect: (url) => { redirected = url; } }, () => assert.fail("next should not run"));
    assert.equal(req.session.redirectUrl, "/listings/new");
    assert.equal(redirected, "/user/login");
});

test("ownership middleware allows the owner and rejects another user", async () => {
    const originalFindById = Listing.findById;
    const ownerId = { toString: () => "owner" };
    try {
        Listing.findById = async () => ({ owner: { equals: (id) => id === ownerId } });
        let allowed = false;
        await ForEqual({ params: { id: "listing" }, user: { _id: ownerId } }, {}, () => { allowed = true; });
        assert.equal(allowed, true);

        let redirected;
        const req = { params: { id: "listing" }, user: { _id: "another" }, flash() {} };
        await ForEqual(req, { redirect: (url) => { redirected = url; } }, () => assert.fail("next should not run"));
        assert.equal(redirected, "/listings/listing");
    } finally {
        Listing.findById = originalFindById;
    }
});
