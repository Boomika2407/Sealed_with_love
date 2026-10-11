# 💌 Sealed: College Time Capsule Network

> *"Sealed with love, opened on time."*  
> A college-only full-stack web application where students seal letters and polaroids into digital capsules. A capsule opens **only when two conditions are met**: the server UTC unlock date has arrived **AND** the student is physically within range of the target campus spot.

---

## 🔒 1. Core Security Model: Server-Enforced Access Control

In trivial projects, the client hides locked text with CSS or `v-if` while the API returns the entire payload in the network tab. In **Sealed**, the server strictly enforces access control:

1. **Zero-Content Leakage Projection**: In the Mongoose schema, sensitive fields (`messageCiphertext`, `messageIv`, `messageTag`, `mediaUrl`, `mediaPublicId`) are designated with `select: false`. Standard list and detail endpoints (`GET /api/capsules/my-capsules`, `GET /api/capsules/:id`) **never return locked letters or image URLs**.
2. **AES-256-GCM Encryption at Rest**: Capsule messages are encrypted with Authenticated Encryption (`aes-256-gcm`). IVs and 128-bit authentication tags are stored per document, preventing database snooping and tamper attacks.
3. **Short-Lived Signed Media URLs**: Photos uploaded are authenticated/private. Short-lived signed URLs (5-minute expiration) are generated and returned **only from the `/unlock` endpoint upon passing verification**.
4. **Authoritative Server UTC Clock**: Device clock tampering does not work. The server uses its own UTC time check.
5. **Geospatial Proximity (Haversine Formula & GPS Accuracy)**: Great-circle distance is calculated between client coordinates and target GeoJSON coordinates. Unlock radius is configurable per spot (default 100m) and accounts for device GPS accuracy jitter while rejecting noisy readings (>300m).
6. **Rate Limiting on `/unlock`**: Protected with `express-rate-limit` (max 10 attempts/minute) to stop brute-force GPS guessing.
7. **Strict Server-Authoritative Lock**: No bypass flags exist. Server strictly enforces UTC date arrival and real GPS sensor proximity.

---

## 🛠️ 2. Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 (Vite) | Fast, responsive single-page architecture |
| **Styling** | Tailwind CSS + Custom CSS | Scrapbook collage, washi tape, polaroids, sticker buttons |
| **Animations** | Framer Motion & canvas-confetti | Press-and-hold wax stamp, 3D envelope opening, confetti |
| **Maps** | Leaflet.js + React-Leaflet | OpenStreetMap + Esri Satellite tiles with GeoJSON Polygon & Spot overlays |
| **GIS Engine** | Turf.js (`@turf/boolean-point-in-polygon`) | Server-side validation enforcing that custom pins are within campus bounds |
| **Backend** | Node.js + Express (ESM) | REST API with security middleware (`helmet`, `cors`) |
| **Database** | MongoDB Atlas / In-Memory (`2dsphere` GeoJSON index) | Spatial queries and temporal storage (`Campus` Polygon & `Spot` Point) |
| **Crypto** | Node `crypto` (`aes-256-gcm`) | Encryption at rest with tamper-proof auth tags |
| **Background Jobs** | `node-cron` + `nodemailer` | Periodic checks for matured capsules and email alerts |
| **Testing** | Node 24 native test runner (`node --test`), Supertest | Automated unit & integration test suite |

---

## 🏛️ Real College Campus Integration

1. **`Campus` Model**: Stores the official college perimeter as a **GeoJSON Polygon** boundary (`coordinates: [[[lon, lat], ...]]`), center point, and zoom level.
2. **`Spot` Model**: Stores named landmark locations as **GeoJSON Points** (`coordinates: [lon, lat]`), each with its own `category` (`gate`, `library`, `canteen`, `academic`, `sports`, `iconic`, `hostel`), custom description, and configurable `radiusMeters` (e.g. 50m for gates, 100m for sports turf).
3. **Dual Map Layers**: Switch effortlessly between **🗺️ OpenStreetMap** and **🛰️ Esri Satellite View** in high-resolution aerial detail.
4. **Custom Pin Turf.js Validation**: Students can pick a named spot or drop a custom pin. Custom pins are validated server-side using Turf.js (`booleanPointInPolygon`). Pins outside the campus boundary are rejected with witty college microcopy.
5. **Admin Spots Dashboard**: Built-in Admin page (`/api/spots` and `/api/campus`) to register, edit, and delete spots, with live polygon inspection.
6. **Seed Configuration**: Pre-seeded with real college spots from [`server/seed/spots.json`](file:///c:/Users/BOOMIKA/Desktop/Project/sealed_with_love/server/seed/spots.json).

---

## 🧪 3. Verification & Unit Tests

The backend lock engine has **35 passing unit & integration tests** covering all security constraints:

```bash
cd server
npm test
```

### Test Suite Coverage (35 / 35 Tests):
- `tests/crypto.test.js`: AES-256-GCM encryption, decryption, unique IV per message, and tamper detection (6 tests).
- `tests/geo.test.js`: Haversine formula calculation, spot confirmation, out-of-range samosa microcopy, configurable spot radii (50m vs 100m), GPS accuracy tolerance, and noisy GPS rejection (8 tests).
- `tests/time.test.js`: Past unlock dates, future unlock dates, 24h hour countdowns, and strict invalid input handling (5 tests).
- `tests/turfBoundary.test.js`: Turf.js polygon boundary verification, rejection of custom pins outside campus bounds, acceptance of pins inside bounds, spot creation, and boundary delivery (7 tests).
- `tests/unlockEngine.test.js`: Full lifecycle test:
  1. Capsule creation with AES-256-GCM encryption and `select: false`.
  2. Proof that locked endpoints omit sensitive content.
  3. Rejection when date not arrived (403 `TIME_LOCKED`).
  4. Rejection when at wrong location e.g. Hostel (403 `LOCATION_LOCKED`).
  5. Successful unlock & decryption when both pass (200 OK with `"WELCOME BACK. You survived college. 🎓"`).
  6. Heart reactions on campus wall.
  7. Public campus wall displaying decrypted polaroid letters.
  8. `node-cron` maturity processing and notification dispatch.
  9. Rate limiter tripping after 10 rapid unlock requests (429) (9 tests).

---

## 🚀 4. How to Run Locally

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm

### 1. Start Backend Server
```bash
cd server
npm run dev
```
*Note: If no local MongoDB is running, an embedded in-memory MongoDB automatically starts so you can test offline immediately!*

### 2. Start Frontend Client
```bash
cd client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🎨 5. Cute Scrapbook Aesthetic & Mascot Capsy
- **Mascot Capsy**: An adorable smiling pill-shaped time capsule with blushing cheeks and a graduation cap guiding students across the application.
- **Stickers & Doodles**: Hand-drawn SVG doodle stickers (stars, sparkles, cassette tapes, film strips, tiny envelopes, padlocks) floating gently in margins.
- **Badges & Milestones**: Earn scrapbook badges like "First Letter Sealed", "Patient One", "Gate Keeper", and "Wall Star".
- **Campus Wall Reactions**: React to decrypted letters with emoji stickers (❤️, 😭, 😂, 🫶, 🎓) that burst with lively pop animations.
- **Midnight Dorm Dark Mode**: Toggle between Day Scrapbook and Midnight Dorm with twinkling stars and gentle fireflies.

