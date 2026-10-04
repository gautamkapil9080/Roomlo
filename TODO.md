# Roomlo TODO

This list is ordered so the app is made reliable and safe before new product features are added. Completed items are checked off after implementation and verification.

## Fix first: core flows and data correctness

- [x] **1. Make listing creation validate input and handle missing uploads.** A route middleware validates the listing with Joi and returns a clear 400 error for invalid input or a missing image before the controller saves anything.

- [x] **2. Fix listing update field names and apply updates safely.** The update route validates the nested listing payload; the controller explicitly sets only the permitted listing fields with Mongoose validators enabled, and the form reads the stored `Country` field.
- [x] **3. Require login and ownership for every listing mutation.** Listing creation and updates require login, updates and deletes require ownership checks.
- [x] **4. Require login for reviews and secure review creation.** Review routes require login; ratings are constrained to 1–5, reviews record their author, and missing listings return 404.
- [x] **5. Repair signup, login, logout, and flash handling.** Signup and logout pass errors through Express, use the correct flash keys/messages, login requests the Passport username, and post-login redirects are restricted to local paths.
- [x] **6. Handle missing listings and invalid IDs consistently.** Missing listings and Mongoose invalid-ID errors return 404 responses.
- [x] **7. Keep listing data names and currency consistent.** Listing forms and controllers use the schema's `Country` field and displayed listing prices use INR.
- [x] **8. Fix the tax toggle behavior.** The listing page toggle now adds and removes 3% GST from displayed prices.

## Fix next: reliability, security, and usability

- [x] **9. Add centralized request validation and clear error responses.** Shared Joi middleware validates create, update, and review requests; the error handler provides useful client errors, a real 404 response, and generic messages for server errors.
- [x] **10. Harden sessions and configuration.** Startup validates required environment variables, session secrets and port are configurable, cookies use secure production settings, and database/session errors are logged.
- [x] **11. Validate and constrain image uploads.** Uploads accept JPG, PNG, and WebP up to 5 MB, and old Cloudinary images are removed after replacement or listing deletion.
- [x] **12. Improve search behavior.** Search matches title, description, location, and country, escapes regex input, caps results, handles empty/no-result states, and supports price sorting.
- [x] **13. Make listing and review pages resilient.** Missing photos and empty results/reviews have fallbacks, and review authors and ratings are shown when available.
- [x] **14. Fix interaction and navigation details.** The brand links to listings, logout uses POST, and signed-in users can access the review form.
- [x] **15. Add automated checks for critical flows.** Node's test runner covers listing create/update/delete, authorization and ownership, request validation, upload policy, review creation, search filters, startup configuration, and error responses.

## Product features after the fixes

- [ ] **16. Add pagination and sorting** to listing and search results.
- [ ] **17. Add filters and categories** for price range, location, accommodation type, and amenities; connect the current decorative filter labels to real queries.
- [ ] **18. Add user profiles and account settings,** including a user's listings and reviews.
- [ ] **19. Add booking and availability management** with dates, guest counts, booking status, and conflict prevention.
- [ ] **20. Add payment processing** only after booking and price rules are defined; include payment status and failure handling.
- [ ] **21. Add saved/favorite listings** for signed-in users.
- [ ] **22. Improve listing management** with multiple photos, amenities, availability, and clearer host/contact details.
- [ ] **23. Refine responsive UI and accessibility,** including consistent currency/date formatting, keyboard behavior, labels, and mobile layouts.
- [ ] **24. Add operational basics:** structured logging, deployment/environment documentation, and backups/monitoring appropriate to the hosting setup.

## Notes from the review

- Existing README feature claims include listing CRUD, authentication, uploads, and reviews; completed flows are marked above.
- README already mentions payment, better search, profiles, pagination, and UI improvements. Those are kept in the feature list and ordered after correctness work.
- `npm test` uses Node's built-in test runner; all 17 checks pass without requiring a live database or Cloudinary account.
