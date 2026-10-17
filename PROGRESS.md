# WearCraft Development Progress

Updated: 2026-10-06

## Current State

WearCraft is a Next.js fashion e-commerce application with authenticated accounts, profile and address management, PayStack payment processing, order history, a persistent wishlist, product reviews, and a database-backed admin workspace.

## Completed

### Account and authentication

- Added profile retrieval and update APIs.
- Added address list, create, update, delete, and default-address operations.
- Added shared, strict profile and address validation with trimmed and bounded fields; profile forms reuse the same profile schema as the API.
- Made address creation, default reassignment, updates, and deletion transactional so default-address state remains consistent.
- Added typed API client methods and Zustand auth-store actions.
- Fixed authentication bootstrap after browser refreshes on protected pages.
- Added explicit logout navigation and cleared client cart state on logout.

### Checkout and payments

- Restored PayStack Inline checkout.
- Verify PayStack transaction references server-side against the authenticated customer, NGN currency, and database-derived order total before creating a paid order.
- Require a valid PayStack webhook signature and match event reference, amount, currency, and customer against its order before finalizing payment.
- Enforce unique payment references and make order creation and repeated successful webhook delivery idempotent.
- Derive product details, item prices, shipping, tax, and totals on the server instead of trusting checkout payload values.
- Return an existing order when its owner retries order creation with the same verified payment reference.
- Reject payment verification when `PAYSTACK_SECRET_KEY` is missing; unsigned simulated webhooks are not accepted.
- Fixed PayStack script placement and callback validation.
- Fixed order creation when cart product IDs differ from database product IDs.
- Wrapped order and address creation in a Prisma transaction.
- Configured `images.unsplash.com` for Next.js image rendering.

### Orders

- Added authenticated order history loading.
- Added request timeout handling, explicit error states, and retry behavior.
- Fixed the refresh lifecycle so orders load without requiring logout and login.

### Wishlist

- Added authenticated wishlist API routes.
- Added typed wishlist state management.
- Added the `/wishlist` page with loading, error, empty, remove, and move-to-cart states.
- Added wishlist controls to product cards and product detail pages.
- Added wishlist navigation to the desktop and mobile account menus.

### Codebase cleanup

- Removed source comments and obsolete commented-out implementations.
- Removed the seeded test user and test address from `prisma/seed.ts`.
- Removed demo credentials from the login page.
- Removed development-only test routes:
  - `src/app/test-stores`
  - `src/app/components-test`
- Removed empty unused component files and unused exports.
- Removed unused helper functions and mock payment verification code.
- Removed unused imports and variables.
- Normalized trailing whitespace.

### Storefront UI

- Established a warm editorial visual system with brown CTAs, neutral surfaces, olive and clay accents, larger rounded corners, and reduced-motion support.
- Redesigned the homepage with stronger hierarchy, FAQ content, newsletter contrast, and responsive editorial sections.
- Added automatic and manual hero imagery transitions for women's, men's, and unisex edits.
- Added Contact navigation and a dedicated Contact page.
- Refined shop search, filters, product cards, badges, ratings, spacing, and image rendering.
- Redesigned product detail pages with optimized imagery, thumbnail navigation, responsive purchase controls, wishlist actions, and product information.
- Refined cart and checkout layouts, empty states, quantity controls, order summaries, address sections, payment states, and responsive spacing.

### Product reviews

- Added authenticated review submission with rating, title, and comment validation.
- Added public product review retrieval with loading, empty, error, and unauthenticated states.
- Added verified-purchase status based on paid orders.
- Added one-review-per-user enforcement for each product.
- Added automatic product rating and review-count aggregation after submission.
- Added review summaries, interactive star input, review cards, and toast feedback to product pages.
- Fixed the review form to use the full parent width and separated it from the three-item service benefits grid.

### Admin foundation

- Added database-backed customer and admin roles.
- Added server-side admin authorization that rechecks the current user role.
- Added review publication state and public filtering for hidden reviews.
- Added admin review listing, publish/hide, delete, and rating recalculation APIs.
- Added a responsive `/admin/reviews` moderation workspace with loading, error, empty, and action states.
- The new role and moderation fields must be applied with `npm run db:push` before deployment; the local PostgreSQL user cannot create Prisma shadow databases for `prisma migrate dev`.

### Admin product management

- Added admin-only product listing, creation, update, and deletion APIs.
- Added strict product payload validation for pricing, slugs, categories, images, stock, and catalogue metadata.
- Prevented deletion of products that are referenced by order history.
- Added a responsive `/admin/products` workspace for catalogue maintenance and stock visibility.

### Admin shell and media uploads

- Added a dedicated admin layout with sidebar navigation and dashboard entry point.
- Removed the storefront navbar and footer from admin routes.
- Added admin-role route guarding and automatic admin login redirection.
- Added protected Cloudinary uploads for JPG, PNG, and WebP product images.
- Updated product management to upload images instead of accepting pasted image URLs.
- Product records continue to store only Cloudinary secure URLs in `Product.images`.

### Admin order management

- Added admin-only, searchable, paginated order listing with fulfilment and payment filters.
- Added operational summary metrics for all orders, orders requiring attention, paid order value, daily order count, and fulfilment status totals.
- Added a detailed order workspace with item, customer, payment reference, address, and cost breakdowns.
- Added guarded fulfilment transitions from pending through delivery, with cancellation restricted to unpaid orders.
- Kept payment status read-only in the admin interface; fulfilment progression requires verified payment.
- Added active state to shared admin sidebar navigation.

### Admin customer management

- Added an admin-only, searchable, paginated customer directory that excludes admin accounts and never exposes password data.
- Added customer activity summaries for recent registrations, order participation, paid lifetime spend, reviews, and wishlist items.
- Added customer detail views with contact information, saved addresses, and recent order history linked to order operations.
- Increased admin workspace card corner radii to a consistent, more generous 2xl treatment across overview, product, review, customer, and order surfaces.

### Admin analytics

- Added an admin-only analytics API with selectable 7-, 30-, and 90-day periods.
- Added paid revenue, order volume, average order value, and new-customer metrics with previous-period comparisons.
- Added daily paid sales trends, fulfilment distribution, payment outcomes, and top products ranked by units in paid orders.
- Added a responsive analytics dashboard with accessible native SVG visualization and links to related admin workspaces.
- Updated the Baseline browser-data development dependency to `baseline-browser-mapping@2.11.27` to resolve the recurring stale-data warning.

### Transactional email

- Added SMTP-backed welcome, profile-change, order-confirmation, shipment, and delivery notifications.
- Added SMTP configuration validation and server-side delivery error logging.
- Preserve saved account, order, and fulfilment changes when email delivery fails and report the failure to the caller.
- Real Gmail SMTP delivery was tested successfully by the project owner.
- Automatic retry queues are not implemented.

### API request validation

- Added strict, bounded query validation to public product listing filters, including categories, price ranges, search, sorting, and pagination.
- Return actionable HTTP 400 responses for invalid or contradictory filters instead of passing malformed values into Prisma.
- Support both API price-sort names and the storefront's low-to-high/high-to-low sort values.
- Validate product review lookup and submission values, rejecting duplicate or unknown lookup filters.
- Return a client error for malformed multipart upload requests rather than treating request parsing failures as server errors.
- Keep product rating/count aggregates limited to published reviews, matching the public product review feed.
- Require a PayStack reference and reject client-controlled order fields when creating orders.
- Disable simulated unpaid checkout orders; checkout now remains unavailable until both the public and server PayStack keys are configured.
- Use same-origin API requests by default so deployment does not depend on knowing the production URL at build time.
- Enforce the same per-line quantity limit in the cart as the order API and sum stock demand across product variants in each order request.

### Accessibility and interaction polish

- Give product quantity controls a labelled group and live quantity value for assistive technology.
- Disable quantity controls at their valid bounds and keep cart quantities within the API's per-item limit.
- Keep a single main landmark in storefront layouts.
- Remove simulated contact and newsletter success states; contact now uses a configured support email, and the collection callout remains useful without a fake subscription.
- Replace footer links to unimplemented routes with working shop, FAQ, and contact destinations; avoid publishing placeholder phone and email details.

### Storefront data consistency

- Updated the shop page to load products from the database-backed public API.
- Updated product detail pages to resolve database IDs and slugs through the public product API.
- Updated the homepage featured collection to load database products and use their real IDs.
- Preserved storefront filters, sorting, reviews, wishlist actions, cart actions, and loading states while replacing the legacy in-memory catalogue.
- Configured the database-backed homepage for dynamic rendering so production builds do not require a reachable database during prerendering.

## UI Redesign Roadmap

The storefront will be redesigned into a more modern, distinctive, and aesthetically pleasing fashion experience inspired by considered editorial brands rather than generic e-commerce templates.

- Establish a refined color system with balanced neutrals and purposeful accent colors.
- Introduce a cohesive typography system with expressive display fonts and highly readable body text.
- Replace placeholder branding with a considered logo and consistent brand marks.
- Curate stronger hero imagery and product photography with consistent aspect ratios and cropping.
- Refine icons, controls, buttons, badges, cards, forms, and navigation for visual consistency.
- Improve spacing, layout rhythm, responsive grids, and mobile-first behavior.
- Add subtle, purposeful animations for page transitions, image interactions, menus, loading states, and feedback.
- Improve toast notifications with clear success, error, warning, and informational states.
- Design polished loading, empty, error, disabled, hover, focus, and reduced-motion states.
- Preserve accessibility with semantic markup, keyboard support, visible focus states, and sufficient contrast.

## Validation

- TypeScript passes for application source using a project config that excludes malformed generated `.next` route types.
- Focused ESLint passes with 0 errors for the changed API, checkout, product, and cart files.
- Production build passes with `NEXT_DISABLE_FONT_DOWNLOAD=1 npm run build`.
- `baseline-browser-mapping@2.11.27` is installed directly as a development dependency to keep Baseline browser data current.
- The production build generates the storefront and API routes, including PayStack availability status.
- Storefront product and cart imagery use `next/image`; no raw `<img>` elements remain under `src/`.
- No source comments remain in `src/` or `prisma/`.
- No test-account credentials or development-only test-route references remain.
- `npm test` passes 54 checks covering account validation, API error responses, order and payment configuration, product and review validation, PayStack verification and webhooks, JWT secret validation, and wishlist request validation.
- Completed a PayStack test-mode checkout; verified the provider transaction, created one paid order, confirmed repeated signed webhook delivery is idempotent, and confirmed a mismatched amount is rejected.
- PayStack hardening changes passed TypeScript, focused ESLint, and Prisma schema validation.
- Verified there were no duplicate payment references before adding the database unique constraint; applied the constraint to the configured local database.
- Prisma Client regeneration reported a Windows file-lock (`EPERM`) while the development server was using the generated engine.
- The current production build passes with generated routes, including the payment-availability endpoint.

## Pending Tasks

### Immediate correctness and validation

- Production settings are not available in this workspace: local PayStack keys are test-mode, the app URL is localhost, and both configured databases are local. Confirm live credentials, public app URL, and webhook endpoint in the hosting environment before deployment.
- Apply the payment-reference unique constraint to production before deploying the application changes.

### Product features

- Configure a durable retry queue before relying on transactional email at production volume.
- Set a verified public support email and publish accurate privacy, terms, shipping, and returns information before accepting customers.

### Production hardening

- Inventory availability is checked against requested quantities, but stock is not reserved or decremented atomically when orders are paid. Define and implement a reservation/release or oversell/refund workflow before accepting live orders.
- Review responsive and accessibility behavior across the complete shopping flow.
