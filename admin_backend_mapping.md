# Publisher side (✅ done)

- **validationAndInvoices.tsx** → backend:

  - `routes/admin.publisher.validation.routes.js` (validations)
  - `routes/admin.publisher.invoices.routes.js` (invoices)
  - controllers/services/repos for each (done)
  - Key endpoints:  
    `GET /api/admin/publisher/validations` · `POST/PATCH/DELETE /api/admin/publisher/validations/...`  
    `GET /api/admin/publisher/invoices` · `POST/PATCH /api/admin/publisher/invoices/...`

- **transaction.tsx** → backend:

  - `routes/admin.publisher.transactions.routes.js`
  - controllers/services/repos (done; uses `admin_publisher_transactions`)
  - Key endpoints:  
    `GET /api/admin/publisher/:publisherName/transactions`  
    `POST /api/admin/publisher/:publisherName/transactions`  
    `PUT/DELETE /api/admin/publisher/transactions/:id`

- **publisher.tsx** (list + detail) → backend:

  - `routes/admin.publisher.list.routes.js`
  - `routes/admin.publisher.detail.routes.js`
  - controllers/services/repos (done)
  - Key endpoints:  
    `GET /api/admin/publisher/publishers?q=&page=&limit=`  
    `GET /api/admin/publisher/publishers/:publisherName`

- **publisherApproval.tsx** → backend:

  - `routes/admin.publisher.approvals.routes.js`
  - controllers/services/repos (done)
  - Key endpoints:  
    `GET /api/admin/publisher/approvals?status=&q=&page=&size=`  
    `PATCH /api/admin/publisher/approvals/status` (overall approve/reject/pending)  
    `PATCH /api/admin/publisher/approvals/section` (per‑section if columns exist)

- **dashboard.tsx / overview (publisher)** → you said this was already implemented earlier on your side, so we **didn’t change it**.

# Advertiser side (✅ done)

- **home_A.tsx / overview_A.tsx** → backend:

  - `routes/admin.advertiser.overview.routes.js`
  - controllers/services/repos (done)
  - Key endpoints:  
    `GET /api/admin/advertiser/overview/summary?start=&end=`  
    `GET /api/admin/advertiser/overview/top-offers?metric=&start=&end=&limit=`

- **offers_A.tsx** → backend:

  - `routes/admin.advertiser.offers.routes.js`
  - controllers/services/repos (done)
  - Key endpoints:  
    `GET /api/admin/advertiser/offers?status=&q=&page=&limit=`  
    `POST /api/admin/advertiser/offers`  
    `GET/PUT /api/admin/advertiser/offers/:offerId`  
    `PATCH /api/admin/advertiser/offers/:offerId/status`

- **offers_A.tsx** (rewards sub‑panel) → backend:

  - `routes/admin.advertiser.offerRewards.routes.js`
  - controllers/services/repos (done)
  - Key endpoints:  
    `GET /api/admin/advertiser/offers/:offerId/rewards`  
    `POST /api/admin/advertiser/offers/:offerId/rewards`  
    `PUT /api/admin/advertiser/rewards/:rewardId`  
    `DELETE /api/admin/advertiser/rewards/:rewardId`

- **offerApproval_A.tsx** → backend:

  - `routes/admin.advertiser.offerApprovals.routes.js`
  - controllers/services/repos (done)
  - Key endpoints:  
    `GET /api/admin/advertiser/offer-approvals?status=&q=&page=&limit=`  
    `GET /api/admin/advertiser/offer-approvals/:id` (approvalId or offerId)  
    `PATCH /api/admin/advertiser/offer-approvals/:id/status`

- **notification_A.tsx** → backend:

  - `routes/admin.advertiser.notificationApprovals.routes.js`
  - controllers/services/repos (done)
  - Key endpoints:  
    `GET /api/admin/advertiser/notification-approvals?status=&q=&page=&limit=`  
    `GET /api/admin/advertiser/notification-approvals/:id` (approvalId or notificationId)  
    `PATCH /api/admin/advertiser/notification-approvals/:id/status`

- **advertiser_A.tsx** (list + detail) → backend:
  - `routes/admin.advertiser.advertisers.routes.js`
  - controllers/services/repos (done)
  - Key endpoints:  
    `GET /api/admin/advertiser/advertisers?q=&page=&limit=`  
    `GET /api/admin/advertiser/advertisers/:advertiserName`





Quick reference (what this exposes)

Publisher

/api/admin/publisher/validations (GET/POST/PATCH/DELETE)

/api/admin/publisher/invoices (GET/POST/PATCH)

/api/admin/publisher/publishers (GET list)

/api/admin/publisher/publishers/:publisherName (GET detail)

/api/admin/publisher/approvals (GET queue)

/api/admin/publisher/approvals/status (PATCH)

/api/admin/publisher/approvals/section (PATCH)

/api/admin/publisher/:publisherName/transactions (GET/POST)

/api/admin/publisher/transactions/:id (PUT/DELETE)

Advertiser

/api/admin/advertiser/overview/summary (GET)

/api/admin/advertiser/overview/top-offers (GET)

/api/admin/advertiser/offers (GET/POST)

/api/admin/advertiser/offers/:offerId (GET/PUT)

/api/admin/advertiser/offers/:offerId/status (PATCH)

/api/admin/advertiser/offers/:offerId/rewards (GET/POST)

/api/admin/advertiser/rewards/:rewardId (PUT/DELETE)

/api/admin/advertiser/offer-approvals (GET)

/api/admin/advertiser/offer-approvals/:id (GET)

/api/admin/advertiser/offer-approvals/:id/status (PATCH)

/api/admin/advertiser/notification-approvals (GET)

/api/admin/advertiser/notification-approvals/:id (GET)

/api/admin/advertiser/notification-approvals/:id/status (PATCH)

/api/admin/advertiser/advertisers (GET)

/api/admin/advertiser/advertisers/:advertiserName (GET)
