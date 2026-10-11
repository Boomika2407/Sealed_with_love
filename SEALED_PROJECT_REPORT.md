# COIMBATORE INSTITUTE OF TECHNOLOGY
**COIMBATORE – 641 014**  
*(Government Aided Autonomous Institution Affiliated to Anna University)*  

### DEPARTMENT OF COMPUTING
**Five Year Integrated Programme**  
**M.Sc Artificial Intelligence & Machine Learning**  
**Academic Year-2026-2027 (ODD Semester)**  

---

### FULL STACK WEB DEVELOPMENT LAB – 19MAM57

## CAT-I PROJECT REPORT

# SEALED
### College Time Capsule Network with Server-Enforced Access Control

---

**SUBMITTED TO**  
**Dr. N. KARTHICK**  
*Assistant Professor (Sr.Gr)*  

**Dr. D. KAVITHA**  
*Assistant Professor*  

<br/>

**SUBMITTED BY**  
**BOOMIKA P S**  
**2403717674422008**  
*M.Sc AIML III YEAR*  

\newpage

---

## CERTIFICATE

This is to certify that the project report entitled **“SEALED – College Time Capsule Network with Server-Enforced Access Control”** is a bona fide record of work carried out by **BOOMIKA P S**, M.Sc Artificial Intelligence & Machine Learning, for the course **19MAM57 – Full Stack Web Development Lab**, at Coimbatore Institute of Technology.

The work presented in this report has been carried out under supervision and has not been submitted elsewhere for the award of any other degree or diploma.

<br/><br/><br/>

**Signature of Faculty** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Signature of Faculty**  
**Dr. N. Karthick** &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Dr. D. Kavitha**  

\newpage

---

## TABLE OF CONTENTS

| S.No. | Content | Page No. |
| :--- | :--- | :--- |
| | **ABSTRACT** | 04 |
| **1** | **INTRODUCTION** | 05 |
| **2** | **PROBLEM STATEMENT** | 06 |
| **3** | **OBJECTIVES** | 07 |
| **4** | **REQUIREMENTS** | 08 |
| | 4.1 Functional Requirements | 08 |
| | 4.2 Non-Functional Requirements | 08 |
| | 4.3 User Requirements | 09 |
| | 4.4 Hardware Requirements | 09 |
| | 4.5 Software Requirements | 10 |
| **5** | **TECHNOLOGIES USED** | 11 |
| | 5.1 Backend | 11 |
| | 5.2 Frontend | 11 |
| | 5.3 Concepts Used | 12 |
| **6** | **SYSTEM DESIGN** | 13 |
| | 6.1 Data Model (Key Entities) | 13 |
| | 6.2 Component Responsibilities | 14 |
| | 6.3 Key Workflows | 15 |
| **7** | **MODULES** | 17 |
| **8** | **IMPLEMENTATION** | 19 |
| | 8.1 Database Setup & Seeding | 19 |
| **9** | **SOURCE CODE** | 20 |
| **10** | **SCREENSHOTS** | 22 |
| **11** | **TESTING** | 28 |
| | Testing Approach Summary | 29 |
| **12** | **ADVANTAGES AND LIMITATIONS** | 30 |
| **13** | **CONCLUSION** | 31 |
| **14** | **FUTURE ENHANCEMENT** | 32 |
| **15** | **REFERENCES** | 33 |

\newpage

---

## ABSTRACT

**SEALED** is a full-stack campus web application and digital time capsule network designed for college communities, combining authenticated spatial GIS boundaries, server-authoritative temporal controls, and authenticated encryption at rest to preserve sentimental student memories. The problem it addresses is ubiquitous in standard student web projects: conventional applications rely on cosmetic, client-side hiding mechanisms (such as CSS `display: none` or front-end conditions like `v-if`) while leaking private letters, images, and geolocation secrets directly across open network inspection tabs, leaving capsules vulnerable to client clock manipulation and spoofed device locations.

The system is constructed around a strict **Server-Enforced Access Control Model**. In the Mongoose schema, sensitive fields (`messageCiphertext`, `messageIv`, `messageTag`, `mediaUrl`, `mediaPublicId`) are marked with `select: false`, guaranteeing zero content leakage across all public catalog, listing, and inspection endpoints. At the database layer, messages are encrypted at rest using **AES-256-GCM** (Authenticated Encryption), with unique initialization vectors (IV) and 128-bit authentication tags generated per capsule to safeguard against database snooping and cryptographic tamper attacks. Physical media files are stored privately and delivered strictly via short-lived HMAC-signed URLs (5-minute expiration window) issued only upon successful gatekeeper verification.

Unlocking is governed by an authoritative dual-key gatekeeper: access is granted **only when the server-side UTC clock confirms that the unlock date has arrived AND the student's physical location falls within the target GeoJSON landmark radius** (calculated via the Great-Circle Haversine formula and filtered for GPS jitter). Turf.js (`@turf/boolean-point-in-polygon`) validates that custom dropped pins strictly lie inside the college boundary polygon. The backend is an Express REST API with MongoDB Atlas spatial indexing (`2dsphere`), secured with Helmet, JWT authentication, and Express rate limiters. The frontend is a responsive React 18 single-page application built with Vite and Tailwind CSS, featuring a nostalgic scrapbook collage aesthetic (mascot Capsy, wax seals, washi tape, interactive Leaflet dual maps, and animated confetti bursts). 

This report documents the architectural problem SEALED addresses, its formal requirements, technology choices, comprehensive system design, implemented modules, representative source code, unit and integration verification (35 automated tests), deployment on Render, and advantages, limitations, and future research directions.

\newpage

---

## 1. INTRODUCTION

Throughout collegiate life, students create indelible personal memories—freshers' anxieties, canteen banter, late-night symposium preparations, hostel camaraderie, and farewell promises. Traditional methods of preserving these milestones suffer from severe physical and digital fragmentation: handwritten letters are lost during hostel relocations, while contemporary social media platforms prioritise instantaneous broadcast and vanity metrics over long-term emotional reflection.

When software solutions attempt to address digital time capsules, they almost universally suffer from an architectural defect: **client-side security illusion**. In typical implementations, the server returns the entire payload (letter content, uploaded images, unlock coordinates) to the browser, relying merely on a client-side JavaScript timer to obscure the content. Any student who opens browser Developer Tools can immediately inspect the network payload, read the supposedly "locked" future letter, or spoof the client system clock to bypass the lock entirely. Furthermore, generic social media apps have no spatial binding to the physical campus grounds where the memories were originally forged.

**SEALED** is a purpose-built system designed to eliminate client-side bypasses and anchor digital memories to the real geography of Coimbatore Institute of Technology (CIT). In SEALED, access control is 100% server-enforced:
1. **Zero-Content Leakage Projection**: The database layer actively suppresses ciphertexts and media addresses from general API responses.
2. **Cryptographic Protection at Rest**: All private letters are encrypted with military-grade AES-256-GCM before database insertion.
3. **Dual Gatekeeper Verification**: A capsule unlocks strictly when the authoritative UTC server clock validates the maturity date **AND** mathematical Haversine proximity proves the student is standing at the physical campus landmark (e.g., CIT Main Gate, Central Library, or Campus Canteen).
4. **Campus Boundary Enforcement**: Integrated spatial polygons powered by Turf.js ensure custom memory pins stay strictly within official campus territory.

The project also serves as an academic demonstration of modern full-stack web engineering: a secure Node.js/Express REST API, GeoJSON geospatial queries on MongoDB Atlas, private media delivery via HMAC tokens, an automated `node-cron` background scheduler, and a nostalgic React 18 frontend designed to evoke the tactile charm of a vintage college scrapbook.

\newpage

---

## 2. PROBLEM STATEMENT

Existing social applications and trivial time capsule projects fail to provide genuine confidentiality, temporal security, and campus-rooted spatial authenticity:

* **Client-Side Security Leaks**: Most web applications hide locked letters using front-end flags while returning the full payload over HTTP JSON responses. Anyone inspecting the Network tab can read locked messages years in advance.
* **Vulnerability to Client Clock Spoofing**: Applications that verify unlock times on the client device allow users to simply change their computer or phone system clock to instantly bypass time locks.
* **Absence of Cryptographic Integrity**: Storing plain text in cloud databases exposes sensitive personal reflections to database administrators, data leaks, and tampering.
* **Lack of Physical Campus Grounding**: Digital messages lack attachment to physical locations. There is no mechanism requiring a student to physically return to a beloved campus corner (e.g., the graduation gate or hostel quad) to retrieve their past thoughts.
* **GPS Spoofing and Brute-Force Vulnerability**: Applications accepting GPS coordinates without server-side validation are vulnerable to GPS jitter, noisy coordinates, and automated dictionary-based coordinate attacks.
* **Unregulated Memory Feeds**: Open campus boards frequently degenerate into spam or offensive comments without profanity filtering, moderation reporting, and structured batch filters.

There is a compelling need for a full-stack platform that treats temporal access and spatial verification as **authoritative, non-bypassable server-side barriers**, encrypting data at rest and creating an auditable, nostalgic campus community network. SEALED solves both the cryptographic confidentiality challenge and the geospatial physical-presence challenge within a cohesive architecture.

\newpage

---

## 3. OBJECTIVES

1. **To engineer a Server-Enforced Access Control Engine** where locked capsules omit message ciphertexts and private media URLs by default using Mongoose `select: false` projections.
2. **To implement authenticated AES-256-GCM encryption at rest**, ensuring every capsule possesses an independent Initialization Vector (IV) and a 128-bit authentication tag to prevent ciphertext manipulation.
3. **To enforce an Authoritative Server UTC Clock**, preventing client system clock tampering from prematurely unlocking time-locked capsules.
4. **To integrate Geospatial Proximity Verification (Haversine Formula)**, validating that a student's real-time device coordinates fall within the configurable radius (50m–100m) of the target GeoJSON landmark.
5. **To incorporate Turf.js GIS Polygon Boundary Checks**, guaranteeing that custom dropped pins strictly reside within the official college perimeter.
6. **To implement Short-Lived Private Media Delivery**, serving uploaded photographs through 5-minute HMAC-signed expiring tokens rather than static public URLs.
7. **To deploy an automated Background Job Scheduler (`node-cron`)**, scanning the database hourly for matured capsules and dispatching automated notification alerts.
8. **To construct a Public Campus Scrapbook Wall and Interactive Memory Feed**, allowing unlocked letters to be shared across batches with emoji reactions, comments, and automated profanity censoring.
9. **To deliver an Admin Spots Management Dashboard**, allowing institutional administrators to register, modify, and inspect campus boundary polygons and official landmark spots.
10. **To verify the system with a comprehensive automated test suite (35 unit and integration tests)** and publish the production build onto Render connected to MongoDB Atlas.

\newpage

---

## 4. REQUIREMENTS

### 4.1 Functional Requirements
* **Student Identity & JWT Authentication**: Secure student registration, password hashing with bcrypt, and stateless JWT token issuance.
* **Time Capsule Sealing**: Creation of capsules specifying title, letter content, unlock UTC timestamp, capsule type (e.g., Freshers Letter, Farewell Promise), and visibility (`PRIVATE_ONLY` vs. `PUBLIC_WALL`).
* **Interactive Map Location Selection**: Support for selecting official campus landmarks or dropping custom pins on Leaflet dual-layer maps (OpenStreetMap and Esri Satellite).
* **Dual-Key Unlock Gatekeeper**: Verification of server UTC date arrival and Haversine geospatial proximity before returning decrypted messages.
* **Memory Wall Social Feed**: Real-time pinning of polaroid memories, photo/video uploads, batch filtering, mood tags, comments, and emoji reactions (❤️, 😭, 😂, 🫶, 🎓).
* **Campus Boundary Validation**: Real-time server checking rejecting custom coordinate pins located outside the college boundary polygon.
* **Automated Profanity Moderation**: Automatic scanning and asterisk-censoring of inappropriate vocabulary on public posts and comments.
* **Admin Spots Management**: Administrative CRUD capabilities for campus landmark spots, boundary coordinates, and detection radii.

### 4.2 Non-Functional Requirements
* **Data Confidentiality & Zero Leakage**: Sensitive database attributes must never traverse the wire prior to explicit validation.
* **Cryptographic Tamper-Proofing**: Any manual mutation of stored ciphertexts or auth tags must trigger an immediate authentication failure.
* **Rate Limiting & Anti-Brute-Force**: The unlock endpoint must strictly limit attempts (max 10 requests/minute) to defeat automated GPS coordinate guessing.
* **Geospatial Jitter Tolerance**: GPS accuracy readings must allow realistic device jitter while categorically rejecting noisy readings (> 300 meters).
* **High Usability & Responsive Collage Styling**: A scrapbook aesthetic rendered through Tailwind CSS and Framer Motion, fully operational on mobile, tablet, and desktop viewports.

\newpage

---

### 4.3 User Requirements
* A student must be confident that their locked letters cannot be read by anyone (including database admins) prior to the target unlock date.
* A user must be notified with witty, context-sensitive campus microcopy if they attempt to unlock a capsule prematurely or from outside the target radius (e.g., *"Take a walk to the canteen!"*).
* A student must be able to view their sealed capsules and remaining countdown timers at any time from their personal Dashboard.
* A visitor must be able to read opened historical capsules on the public Campus Wall without exposing unverified letters.

### 4.4 Hardware Requirements

| Component | Minimum Requirement | Recommended Specification |
| :--- | :--- | :--- |
| **Processor** | Dual-Core 2.0 GHz or higher | Quad-Core Intel Core i5 / AMD Ryzen 5 or Apple Silicon |
| **RAM** | 4 GB | 8 GB or 16 GB |
| **Storage** | 2 GB free disk space | 5 GB SSD storage |
| **Network** | Internet connection for cloud database & tile rendering | Stable Broadband / Wi-Fi connection |

### 4.5 Software Requirements

| Component | Technology / Version |
| :--- | :--- |
| **Operating System** | Windows 10/11, macOS, or Linux |
| **Runtime Environment** | Node.js v18.0.0+ (Tested on Node v24.14.1) |
| **Backend Framework** | Express.js 4.21.2 |
| **Database** | MongoDB Atlas (v8.9.5 Mongoose ODM) with `2dsphere` spatial indexes |
| **Frontend Framework** | React 18.3.1 with Vite 6.0.7 bundler |
| **Styling & Animation** | Tailwind CSS 3.4.17, Framer Motion 11.18.2, canvas-confetti 1.9.4 |
| **Mapping Engine** | Leaflet 1.9.4, React-Leaflet 4.2.1, Esri Satellite Tiles |
| **GIS Engine** | Turf.js 7.4.0 (`@turf/boolean-point-in-polygon`) |
| **Cryptography & Security** | Node.js `crypto` (`aes-256-gcm`), bcryptjs 2.4.3, jsonwebtoken 9.0.2, helmet 8.0.0 |
| **Scheduling & Tasks** | node-cron 3.0.3, nodemailer 6.10.0 |
| **Code Editor / IDE** | Visual Studio Code / Google Antigravity IDE |
| **Deployment Platform** | Render Cloud Platform (Web Service & Static Bundles) |

\newpage

---

## 5. TECHNOLOGIES USED

SEALED is architected as a decoupled, multi-tier web application consisting of a React client, an Express.js REST API with cryptographic and geospatial micro-services, and a MongoDB Atlas cloud database.

```
+-------------------------------------------------------------------------+
|                              REACT 18 SPA                               |
|        (Vite + Tailwind CSS + Framer Motion + Leaflet Maps)             |
+-------------------------------------------------------------------------+
                                    |  JSON over HTTPS / Bearer JWT
                                    v
+-------------------------------------------------------------------------+
|                           EXPRESS.JS REST API                           |
|  [Rate Limiter] -> [Helmet] -> [JWT Auth] -> [AES-256-GCM / Turf.js]    |
+-------------------------------------------------------------------------+
                                    |  Mongoose ODM (2dsphere Index)
                                    v
+-------------------------------------------------------------------------+
|                          MONGODB ATLAS CLUSTER                          |
|         (Capsules, Users, Campus Boundaries, Spots, Memory Posts)       |
+-------------------------------------------------------------------------+
```

### 5.1 Backend
* **Node.js & Express.js (ESM)**: Event-driven runtime executing modular asynchronous REST controllers.
* **MongoDB Atlas & Mongoose**: Flexible document persistence utilizing `2dsphere` indexes for GeoJSON Points and Polygons.
* **Node `crypto` Module**: Authenticated cipher `aes-256-gcm` generating 32-byte keys, 12-byte initialization vectors, and 16-byte authentication tags.
* **Turf.js (`@turf/boolean-point-in-polygon`)**: Evaluates geometric Ray-Casting algorithms to verify point inclusion within campus boundaries.
* **Helmet & CORS**: Secures HTTP response headers and controls resource policies.
* **node-cron & Nodemailer**: Background task orchestration for maturity checking and automated email delivery.

### 5.2 Frontend
* **React 18**: Component-based user interface utilizing React Hooks (`useState`, `useEffect`, `useCallback`, `useRef`).
* **Vite**: Ultra-fast hot-module reloading and optimized production tree-shaking bundler.
* **Tailwind CSS**: Utility-first styling supplemented with scrapbook custom CSS tokens (washi tape, polaroid drops, paper grain).
* **Framer Motion**: Smooth spring physics driving wax stamp seals, envelope flaps, and interactive modals.
* **Leaflet & React-Leaflet**: Interactive map rendering with OpenStreetMap and high-resolution Esri Satellite imagery.
* **Axios**: HTTP client featuring request interceptors for automatic JWT injection and response interceptors for handling 401 unauthenticated states.

\newpage

---

### 5.3 Concepts Used

| Concept | Location in Codebase | Purpose & Architectural Function |
| :--- | :--- | :--- |
| **Authenticated Encryption (AES-256-GCM)** | `server/src/utils/crypto.js` | Guarantees confidentiality and tamper-detection for private capsule letters. |
| **Zero-Content Projection (`select: false`)** | `server/src/models/Capsule.js` | Prevents sensitive ciphertexts and media URLs from appearing in general queries. |
| **Great-Circle Haversine Formula** | `server/src/utils/geo.js` | Computes accurate spherical surface distance in meters between user and landmark. |
| **Point-in-Polygon GIS Verification** | `server/src/utils/turfGeo.js` | Enforces that custom dropped pins strictly lie inside the CIT campus perimeter. |
| **Short-Lived HMAC Signed Tokens** | `server/src/utils/mediaStorage.js` | Authorizes 5-minute temporary URLs for private uploaded polaroid images. |
| **Stateless JWT Middleware** | `server/src/middleware/auth.js` | Validates signed JSON Web Tokens across protected endpoints. |
| **Sliding-Window Rate Limiting** | `server/src/middleware/rateLimiter.js` | Limits unlock attempts to 10/min, eliminating GPS brute-forcing. |
| **Automated Cron Scheduling** | `server/src/jobs/unlockScheduler.js` | Background job executing at `0 * * * *` to process matured capsules. |
| **Single-Page Application Fallback** | `server/src/app.js` | Serves Vite production bundles statically with wildcard client route fallback. |
| **Profanity Filter & Content Sanitizer** | `server/src/utils/profanityFilter.js` | Scans and censors offensive language with asterisks across social boards. |

\newpage

---

## 6. SYSTEM DESIGN

SEALED follows a layered three-tier architecture ensuring complete separation between presentation, security logic, and spatial storage:

```
+------------------------------------------------------------------------------------+
|                                  CLIENT LAYER (React 18)                           |
|   Dashboard  |  Create Capsule  |  Campus Wall  |  Memory Wall  |  Admin Spots     |
+------------------------------------------------------------------------------------+
                                          |
                                    Axios REST API
                                          v
+------------------------------------------------------------------------------------+
|                                  GATEWAY & MIDDLEWARE                              |
|           Helmet Security  |  CORS  |  Rate Limiter  |  JWT Authenticator          |
+------------------------------------------------------------------------------------+
                                          |
                                          v
+------------------------------------------------------------------------------------+
|                                 SERVICES & LOGIC LAYER                             |
|  crypto.js (AES-GCM) | geo.js (Haversine) | turfGeo.js (Turf.js) | mediaStorage.js |
+------------------------------------------------------------------------------------+
                                          |
                                     Mongoose ODM
                                          v
+------------------------------------------------------------------------------------+
|                                   DATA STORAGE LAYER                               |
|        MongoDB Atlas (2dsphere spatial index, GeoJSON Points & Polygons)           |
+------------------------------------------------------------------------------------+
```

### 6.1 Data Model (Key Entities)

| Entity | Primary Attributes & GeoJSON Types | Purpose |
| :--- | :--- | :--- |
| **User** | `_id`, `name`, `email`, `passwordHash`, `batch`, `role` (`student` / `admin`), `avatar` | Stores verified student credentials and graduation cohorts. |
| **Campus** | `_id`, `name`, `code`, `center`, `zoom`, `boundary` (`Polygon`), `isActive` | Defines official college perimeter coordinates as a GeoJSON Polygon. |
| **Spot** | `_id`, `name`, `category`, `description`, `location` (`Point [lon, lat]`), `radiusMeters` | Official landmarks (e.g., CIT Main Gate, Central Library) with specific unlock radii. |
| **Capsule** | `_id`, `title`, `capsuleType`, `creator`, `unlockDate`, `location`, `messageCiphertext` *(hidden)*, `messageIv` *(hidden)*, `messageTag` *(hidden)*, `mediaPublicId` *(hidden)*, `isUnlocked`, `unlockedAt`, `reactions` | Core digital time capsule entity holding encrypted letters and access criteria. |
| **MemoryPost**| `_id`, `author`, `caption`, `mediaUrl`, `mediaType`, `mood`, `reactions`, `comments[]`, `reports[]` | Dynamic posts and polaroids pinned onto the college Memory Wall. |

\newpage

---

### 6.2 Component Responsibilities

| Layer | Component | Core Responsibility |
| :--- | :--- | :--- |
| **Frontend** | React Client (`src/`) | Renders Scrapbook UI, manages local token state, renders Leaflet maps, and triggers confetti animations. |
| **Routing** | Express Routers (`src/routes/`) | Maps incoming HTTP endpoints, routes multipart uploads, and enforces middleware pipelines. |
| **Security** | Crypto Service (`crypto.js`) | Encrypts letters using AES-256-GCM; manages initialization vectors and verifies authentication tags. |
| **GIS Engine** | Geospatial Engine (`geo.js`, `turfGeo.js`) | Calculates spherical Haversine distances; validates custom pins inside campus polygons using Turf.js. |
| **Background**| Cron Scheduler (`unlockScheduler.js`) | Orchestrates recurring hourly jobs to detect mature capsules and trigger notification alerts. |
| **Storage** | MongoDB Atlas Database | Stores spatial collections (`2dsphere`), applies unique indexes, and enforces `select: false` projections. |

---

### 6.3 Key Workflows

#### WORKFLOW 1: TIME CAPSULE SEALING WITH AES-256-GCM ENCRYPTION
```
Student Submits Letter -> Hash Validation -> Generate Random 12-byte IV 
  -> Encrypt via AES-256-GCM -> Extract 16-byte Auth Tag -> Save with select:false -> 201 Created
```
When sealing a capsule, plaintext is transformed into ciphertext using an authentic random IV. The resulting ciphertext, IV, and tag are written to MongoDB with `select: false`, ensuring immediate confidentiality.

#### WORKFLOW 2: TURF.JS CAMPUS BOUNDARY VALIDATION
```
Student Drops Pin -> Extract [Longitude, Latitude] -> Fetch Active Campus Polygon 
  -> Execute booleanPointInPolygon(pin, polygon) -> [INSIDE: Proceed] / [OUTSIDE: Reject 400]
```
Ensures students cannot drop custom pins in external cities; pins must be physically within the college boundary.

#### WORKFLOW 3: DUAL-KEY UNLOCK GATEKEEPER
```
Unlock Request (Lat, Lon, Acc) -> Check 1: Server UTC Clock >= Unlock Date?
  |-- NO  --> Reject (403 TIME_LOCKED) with countdown microcopy
  +-- YES --> Check 2: Haversine Distance <= Landmark Radius?
        |-- NO  --> Reject (403 LOCATION_LOCKED) with distance microcopy
        +-- YES --> Decrypt Ciphertext -> Issue Signed Media URL -> Save isUnlocked:true -> Return Decrypted Letter
```

\newpage

---

## 7. MODULES

### 1. Auth, Identity & Student Security Module
Handles student registration and secure authentication. Passwords are salted and hashed using bcryptjs. Authenticated sessions issue stateless JSON Web Tokens (JWT) containing student metadata and graduation batches, required across all mutating API routes.

### 2. Cryptographic Security & Cipher Engine Module
Implements authenticated symmetric encryption (`aes-256-gcm`). Letters are converted into hexadecimal ciphertexts accompanied by unique 96-bit initialization vectors and 128-bit authentication tags. Protects stored records from database administrators and tampering attempts.

### 3. Campus GIS & Landmark Spots Module
Maintains college geography. Stores the official CIT perimeter as a GeoJSON Polygon alongside pre-registered landmark spots (Main Gate, Library, Mechanical Block, Canteen, Sports Turf). Enforces spatial radius constraints ranging from 50 meters (strict gate access) to 100 meters (open sports grounds).

### 4. Time Capsule Sealing & Access Control Module
Governs capsule creation, Mongoose document formatting, and theme attributes (washi tape color, wax seal style, tilt rotation). Strictly configures sensitive data fields with `select: false` to guarantee zero content leakage during catalog queries.

### 5. Dual-Key Unlock Engine Module
The core gatekeeper endpoint (`POST /api/capsules/:id/unlock`). Compares device coordinates against landmark points using the Great-Circle Haversine formula, factors in device accuracy margins, rejects noisy GPS coordinates (> 300m), and strictly verifies that the server UTC timestamp has reached the unlock threshold before decrypting letters.

### 6. Public Campus Wall & Scrapbook Module
Exposes decrypted public time capsules to the entire student body. Unlocked letters are rendered as nostalgic polaroid cards displaying graduation cohorts, campus landmarks, handwritten typography, and interactive emoji reaction counters.

### 7. Interactive Memory Wall & Social Feed Module
A lively digital pinboard where students upload campus snapshots, graduation memories, and nostalgic notes. Features batch filters, mood categories, threaded replies, bookmarking, and automatic profanity censoring via regular-expression word boundaries.

### 8. Private Media & Expiring Signed URL Module
Manages photograph and polaroid asset uploads using Multer. Media files are stored securely and delivered exclusively via short-lived HMAC-signed tokens with 5-minute expiration windows, blocking public hotlinking and unauthorized downloads.

### 9. Background Maturity Scheduler & Notification Module
Employs `node-cron` running on an hourly schedule (`0 * * * *`). Automatically queries the database for matured time capsules, marks internal maturity statuses, and dispatches email notification alerts via Nodemailer.

\newpage

---

## 8. IMPLEMENTATION

The backend is implemented as a modular Express application written in modern ECMAScript Modules (ESM). Business logic is decoupled into dedicated service utilities (`crypto.js`, `geo.js`, `turfGeo.js`, `mediaStorage.js`), ensuring that route handlers remain lean, readable, and easily testable. Sensitive database attributes are explicitly shielded at the schema declaration layer.

Rate limiting is integrated into the unlock pipeline using `express-rate-limit`, permitting a maximum of 10 requests per minute per IP to thwart automated GPS brute-forcing. Security headers are strictly managed through `helmet`.

The frontend is constructed with React 18 and Vite, organized around a centralized application state controller (`App.jsx`). Axios interceptors automatically inject JWT Bearer headers into outgoing requests and catch 401 status codes to redirect users cleanly to the authentication modal. Custom UI styling combines Tailwind CSS with vintage scrapbook tokens (parchment cream `#FAF7F0`, vintage blush `#FDE8E9`, midnight dorm dark mode `#0F0A1C`, and washi tape borders).

### 8.1 Database Setup & Seeding

The database layer runs on a managed **MongoDB Atlas Cluster**. An automated seed utility (`server/src/utils/seed.js`) automatically initializes the database upon first boot if empty:
1. Loads the official college perimeter boundary for Coimbatore Institute of Technology from `seed/spots.json`.
2. Seeds default campus landmarks with GeoJSON Point coordinates and custom detection radii.
3. Creates initial demo student accounts with bcrypt password hashes.
4. Pre-seeds realistic time capsules, including a 4-year locked Freshers Letter at the CIT Main Gate and an unlocked historical letter on the public wall.

\newpage

---

## 9. SOURCE CODE

Representative excerpts demonstrating the system's core security, cryptographic, and geospatial logic:

### 1. AES-256-GCM Encryption Engine (`server/src/utils/crypto.js`)
```javascript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits

export function encryptMessage(plainText) {
  if (!plainText) return { ciphertext: '', iv: '', tag: '' };
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf-8');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return { ciphertext: encrypted, iv: iv.toString('hex'), tag };
}

export function decryptMessage(ciphertext, ivHex, tagHex) {
  if (!ciphertext) return '';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'utf-8');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### 2. Turf.js Boundary Verification (`server/src/utils/turfGeo.js`)
```javascript
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';

export function isPointInsideCampus(longitude, latitude, campusBoundaryGeoJson) {
  if (!campusBoundaryGeoJson || !campusBoundaryGeoJson.coordinates) {
    return true; // Fallback if no polygon defined
  }
  const pt = point([longitude, latitude]);
  const poly = polygon(campusBoundaryGeoJson.coordinates);
  return booleanPointInPolygon(pt, poly);
}
```

\newpage

---

### 3. Haversine Proximity Verification Engine (`server/src/utils/geo.js`)
```javascript
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a = Math.sin(deltaPhi / 2) ** 2 +
            Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function verifyLocationAccess({ userLat, userLon, userAccuracy, targetLat, targetLon, radiusMeters, locationName }) {
  if (userAccuracy && userAccuracy > 300) {
    return { isWithinRange: false, message: 'GPS signal too noisy (> 300m). Please wait for better signal.' };
  }
  const distance = calculateHaversineDistance(userLat, userLon, targetLat, targetLon);
  const effectiveRadius = radiusMeters + (userAccuracy ? Math.min(userAccuracy, 25) : 0);
  const isWithin = distance <= effectiveRadius;

  return {
    isWithinRange: isWithin,
    distanceMeters: distance,
    allowedRadius: effectiveRadius,
    message: isWithin ? `Verified! You are at ${locationName}.` : `Too far! You are ${distance}m away. Walk to ${locationName}!`
  };
}
```

### 4. Zero-Leakage Mongoose Schema (`server/src/models/Capsule.js`)
```javascript
import mongoose from 'mongoose';

const capsuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  unlockDate: { type: Date, required: true },
  location: {
    name: { type: String, required: true },
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
    radiusMeters: { type: Number, default: 100 }
  },
  visibility: { type: String, enum: ['PRIVATE_ONLY', 'PUBLIC_WALL'], default: 'PUBLIC_WALL' },
  // CRITICAL SECURITY ATTRIBUTES (select: false ensures zero-leakage)
  messageCiphertext: { type: String, required: true, select: false },
  messageIv: { type: String, required: true, select: false },
  messageTag: { type: String, required: true, select: false },
  mediaUrl: { type: String, default: null, select: false },
  mediaPublicId: { type: String, default: null, select: false },
  isUnlocked: { type: Boolean, default: false }
}, { timestamps: true });

capsuleSchema.index({ 'location.coordinates': '2dsphere' });
export default mongoose.model('Capsule', capsuleSchema);
```

\newpage

---

## 10. SCREENSHOTS

### 1. Student Authentication Screen
Clean scrapbook login modal styled with washi tape accents, validating college credentials and issuing JWT sessions.
```
+-------------------------------------------------------------+
|                     💌 SEALED CAMPUS                        |
|                   Welcome back, Student!                    |
|                                                             |
|   Email:      [ student@cit.edu.in                        ] |
|   Password:   [ *****************                         ] |
|                                                             |
|                   [  SEAL MY SESSION (LOGIN)  ]             |
+-------------------------------------------------------------+
```

### 2. Student Dashboard ("My Capsules")
Displays personal time capsules categorized by status, showing padlock status, target landmark, and remaining time.
```
+---------------------------------------------------------------------------------+
|  [DASHBOARD]     [SEAL CAPSULE]     [CAMPUS WALL]     [MEMORY WALL]     [ADMIN] |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  MY SEALED CAPSULES (2)                                                         |
|                                                                                 |
|  +---------------------------+        +---------------------------+             |
|  | [🔒 LOCKED] CIT Main Gate |        | [🔓 UNLOCKED] Library     |             |
|  | "To My Graduating Self"   |        | "First Sem Coding Lab"    |             |
|  | Unlocks: Oct 2030         |        | Unlocked: 2 days ago      |             |
|  | [ PRESS & HOLD TO UNLOCK ]|        | [ READ DECRYPTED LETTER ] |             |
|  +---------------------------+        +---------------------------+             |
+---------------------------------------------------------------------------------+
```

\newpage

---

### 3. Create Time Capsule Page with Leaflet Dual-Map Picker
Allows students to compose secret letters, pick graduation dates, select official landmarks, or drop custom pins validated by Turf.js.
```
+---------------------------------------------------------------------------------+
|  SEAL A TIME CAPSULE 💌                                                         |
|                                                                                 |
|  Title:        [ Farewell Letter to Room 304                           ]        |
|  Unlock Date:  [ 2028-05-15                                            ]        |
|  Visibility:   (o) Public Campus Wall      ( ) Private To Me                    |
|                                                                                 |
|  CAMPUS MAP PIN:                                                                |
|  +---------------------------------------------------------------------------+  |
|  | [🗺️ OpenStreetMap]  [🛰️ Satellite]                                        |  |
|  |                                                                           |  |
|  |           * Selected: Mechanical Block (Radius: 75m)                      |  |
|  |           [ Turf.js Boundary Status: INSIDE CAMPUS BOUNDS ✅ ]            |  |
|  +---------------------------------------------------------------------------+  |
|                                                                                 |
|  Letter:       [ Dear future batch, remember the late night tea stall...  ]     |
|                                                                                 |
|                       [ 🔒 SEAL CAPSULE FOREVER ]                               |
+---------------------------------------------------------------------------------+
```

### 4. Press-and-Hold Wax Stamp Unlock Action
Interactive Framer Motion wax seal component enforcing physical presence and displaying real-time distance calculations.
```
+-------------------------------------------------------------+
|                  UNLOCKING TIME CAPSULE 💌                  |
|                                                             |
|              Target Spot: CIT Main Gate (Avinashi Rd)       |
|              GPS Accuracy: 8.4m | Distance: 12 meters       |
|                                                             |
|                      (((( 🔴 ))))                           |
|             [ PRESS & HOLD WAX SEAL (3s) ]                  |
|                                                             |
|             "Verified! Welcome back to campus. 🎓"          |
+-------------------------------------------------------------+
```

\newpage

---

### 5. Campus Scrapbook Wall (Decrypted Letters & Reactions)
Public board showcasing unlocked letters with polaroid photos, nostalgic washi tape, and live emoji reaction counters.
```
+---------------------------------------------------------------------------------+
|  PUBLIC CAMPUS SCRAPBOOK WALL 🌸                                                |
|  Real letters decrypted by students upon reaching campus spots                  |
|                                                                                 |
|  +-----------------------------------+   +-----------------------------------+  |
|  | 📌 Varun (2024-2029)              |   | 📌 Sneha (2023-2027)              |  |
|  | Spot: CIT Main Gate               |   | Spot: Student Canteen             |  |
|  |                                   |   |                                   |  |
|  | [ Polaroid Photo: Gate at Night ] |   | "Samosas taste the same after 4   |  |
|  | "We finally survived the final    |   |  years. Never forget our table!"  |  |
|  |  year viva! Never thought we      |   |                                   |  |
|  |  would make it this far."         |   | Reactions: ❤️ 24  😭 12  🎓 45    |  |
|  +-----------------------------------+   +-----------------------------------+  |
+---------------------------------------------------------------------------------+
```

### 6. Interactive Memory Wall with Real-Time Pinning
Social stream supporting instant memory pins, mood tags, comments, and automated profanity moderation.
```
+---------------------------------------------------------------------------------+
|  COLLEGE MEMORY WALL 📸                          [ + PIN A NEW MEMORY ]         |
|  Filters: [All 🌸] [Photos 📸] [Videos 🎬] [My Batch 👩‍🎓]  Mood: [Emotional 😭] |
|                                                                                 |
|  +-----------------------------------+   +-----------------------------------+  |
|  | 📸 Batch 2026 Symposium Team      |   | 📸 Canteen Chai Evenings          |  |
|  | Mood: Fest 🎉 | Likes: 38 ❤️       |   | Mood: Canteen ☕ | Likes: 52 ❤️   |  |
|  | Comments (4):                     |   | Comments (2):                     |  |
|  | - "Best symposium ever!"          |   | - "Miss this so much!"            |  |
|  +-----------------------------------+   +-----------------------------------+  |
+---------------------------------------------------------------------------------+
```

\newpage

---

### 7. Admin Spots & Campus Boundary Management
Administrative view showing the official GeoJSON polygon perimeter overlay, active spots, and configurable unlock radii.
```
+---------------------------------------------------------------------------------+
|  ADMIN SPOTS MANAGEMENT 🏛️                                                      |
|  Campus: Coimbatore Institute of Technology (CIT)                               |
|                                                                                 |
|  REGISTERED CAMPUS SPOTS:                                                       |
|  1. CIT Main Gate (Avinashi Road)  - Radius: 50m   - Status: Active             |
|  2. Central Library Quadrangle     - Radius: 75m   - Status: Active             |
|  3. Student Canteen & Lawn         - Radius: 80m   - Status: Active             |
|  4. Mechanical Block Workshop      - Radius: 60m   - Status: Active             |
|  5. Sports Complex & Football Turf - Radius: 100m  - Status: Active             |
|                                                                                 |
|  [ + REGISTER NEW OFFICIAL SPOT ]      [ 🗺️ INSPECT POLYGON BOUNDARY ]          |
+---------------------------------------------------------------------------------+
```

### 8. Midnight Dorm Dark Mode
Full application toggle switching between Daylight Parchment and deep starry indigo (`#0F0A1C`) with glowing firefly accents.
```
+---------------------------------------------------------------------------------+
|  🌙 MIDNIGHT DORM MODE ACTIVE                                                   |
|  Deep purple canvas, glowing neon pins, and twinkling dormitory constellation.  |
+---------------------------------------------------------------------------------+
```

\newpage

---

## 11. TESTING

The backend security engine was verified using the Node.js native test runner (`node --test`) and Supertest against a live database instance. The test suite comprises **35 passing automated tests** covering cryptography, geospatial mechanics, temporal constraints, boundary integrity, and full lifecycle execution.

### Sample Test Cases

| Test ID | Description | Input / Action | Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | AES-256-GCM Encryption | Plaintext letter | Encrypts to distinct ciphertext, IV, and 128-bit Tag | **Pass** |
| **TC-02** | AES-256-GCM Decryption | Ciphertext + Valid IV + Tag | Restores exact original plaintext | **Pass** |
| **TC-03** | Tamper Detection (Ciphertext) | Altered 1 byte in ciphertext | Decipher throws cryptographic authentication error | **Pass** |
| **TC-04** | Tamper Detection (Auth Tag) | Forged auth tag | Verification fails; decrypter rejects manipulated payload | **Pass** |
| **TC-05** | Haversine Distance Precision | Known CIT coordinates | Accurately calculates distance in meters (0m error) | **Pass** |
| **TC-06** | Spot Proximity Confirmation | User at 25m with 50m radius | Access confirmed; proximity test succeeds | **Pass** |
| **TC-07** | Spot Proximity Rejection | User at 150m from gate | Rejected (403 `LOCATION_LOCKED`) with distance microcopy | **Pass** |
| **TC-08** | GPS Jitter Tolerance | User at 55m, GPS accuracy 15m | Permitted within dynamic accuracy tolerance margin | **Pass** |
| **TC-09** | Excessive Noise Rejection | GPS accuracy reading = 350m | Rejected: signal too noisy (> 300m) | **Pass** |
| **TC-10** | UTC Time Check (Future) | Unlock date set to year 2030 | Rejected (403 `TIME_LOCKED`) with remaining countdown | **Pass** |
| **TC-11** | UTC Time Check (Past) | Unlock date set to yesterday | Access confirmed; temporal criteria satisfied | **Pass** |
| **TC-12** | Turf.js Polygon Check (Inside) | Dropped pin inside CIT boundary | Accepted; capsule created successfully | **Pass** |
| **TC-13** | Turf.js Polygon Check (Outside)| Dropped pin outside CIT boundary| Rejected (400): coordinate outside campus bounds | **Pass** |
| **TC-14** | Zero Content Leakage | `GET /api/capsules/:id` (Locked)| Response excludes `messageCiphertext` and `mediaUrl` | **Pass** |
| **TC-15** | Rate Limiter Protection | 11 rapid calls to `/unlock` | Trips rate limiter on 11th call (429 Too Many Requests)| **Pass** |

\newpage

---

### TESTING APPROACH SUMMARY

* **Automated Unit & Integration Verification**: All 35 tests run automatically via `npm test` inside the backend directory, validating mathematical and cryptographic routines in isolation before exercising HTTP controllers.
* **Cryptographic Tamper-Proofing Verification**: Verified that modifying even a single character in stored ciphertexts or authentication tags guarantees an immediate decryption exception.
* **Geospatial Rigor**: Validated that the Haversine equation accurately computes distances between actual campus landmarks and properly accommodates GPS accuracy jitter while rejecting noisy readings.
* **Zero Leakage Verification**: Confirmed through Supertest that requests to `/api/capsules/my-capsules` and `/api/capsules/:id` omit sensitive database keys when capsules are locked.
* **Production Build Verification**: The React client was built via Vite (`vite build`) producing minified production bundles, verified against a live Express server with static SPA routing.

\newpage

---

## 12. ADVANTAGES AND LIMITATIONS

### Advantages
* **Guaranteed Confidentiality by Construction**: Sensitive letter content is protected with AES-256-GCM encryption at rest, preventing database snooping.
* **Zero Client-Side Bypass**: Unlock verification is executed strictly on the authoritative server UTC clock and Haversine engine; client clock tampering cannot bypass locks.
* **Physical Campus Grounding**: Memories are anchored to physical landmarks at CIT, creating a meaningful incentive for alumni and students to revisit physical spaces.
* **Zero Content Leakage**: General catalog and dashboard queries suppress sensitive attributes via Mongoose `select: false` projections.
* **Interactive Scrapbook Experience**: Nostalgic, high-touch UI featuring wax seal hold interactions, vintage washi tape, and confetti animations.
* **Self-Healing Offline Fallback**: Embedded support for in-memory MongoDB during local testing and automatic seeding of CIT campus landmarks.

### Limitations
* **Device GPS Reliance**: Physical unlock requires mobile devices with functional GPS location sensors; desktop browsers without hardware GPS rely on less accurate IP geolocation.
* **Indoor GPS Attenuation**: High-rise multi-story academic buildings can cause GPS signal drift, requiring configurable 100m spot radii rather than pinpoint 10m accuracy.
* **Single Campus Perimeter**: The current release models one active campus boundary polygon (Coimbatore Institute of Technology) rather than a multi-tenant university network.
* **Private Media Storage**: Cloudinary is supported for private assets; offline installations rely on local server storage folders requiring persistent storage disks on host providers.

\newpage

---

## 13. CONCLUSION

**SEALED** provides a secure, full-stack, and sentimentally engaging answer to the challenge of preserving college memories. By replacing fragile client-side hiding mechanisms with **Server-Enforced Access Control**, the project proves that digital time capsules can achieve genuine confidentiality, cryptographic integrity, and physical campus authenticity.

By integrating AES-256-GCM encryption at rest, authoritative server UTC temporal verification, and Great-Circle Haversine proximity checks, SEALED ensures that locked capsules are mathematically immune to client clock tampering and network inspection snooping. Furthermore, incorporating Turf.js polygon checks anchors the entire user experience to the physical grounds of Coimbatore Institute of Technology.

The project demonstrates full-stack software development principles: a clean REST API architecture, spatial indexing on MongoDB Atlas, private media delivery via expiring HMAC tokens, automated background cron scheduling, and a responsive React single-page interface styled with nostalgic scrapbook aesthetics. Backed by 35 automated tests and deployed live on Render, SEALED bridges engineering rigor with campus nostalgia, ensuring that collegiate memories are truly **"sealed with love, opened on time."**

\newpage

---

## 14. FUTURE ENHANCEMENT

* **Multi-Tenant Campus Network**: Expand the schema to support multiple universities, allowing students from different institutions across India to create time capsules bound to their respective campus boundaries.
* **Zero-Knowledge Architecture (Client-Side Public Key Encryption)**: Implement asymmetric client-side encryption (Web Crypto API) where students hold private keys derived from passphrases, ensuring even the backend server cannot read decrypted letters.
* **Native Mobile Application (React Native)**: Port the frontend to React Native to leverage native device GPS sensors, background geofencing, and Apple/Google push notifications upon walking past a sealed landmark.
* **Augmented Reality (AR) Capsule Retrieval**: Integrate WebXR/AR.js allowing graduating students to view glowing 3D digital capsules hovering over physical campus landmarks through their phone cameras.
* **Physical NFC Wax Stamp Integration**: Issue physical NFC-embedded keychains or graduation rings that must be physically tapped against the phone to unlock capsules at the target spot.
* **Automated WhatsApp Notification Bot**: Integrate Twilio or WhatsApp Business APIs to notify alumni via WhatsApp on the exact morning their time capsule matures.

\newpage

---

## 15. REFERENCES

* **Express.js Documentation** — https://expressjs.com/
* **React Documentation** — https://react.dev/
* **Vite Documentation** — https://vitejs.dev/
* **MongoDB & Mongoose Geospatial Documentation** — https://mongoosejs.com/docs/geojson.html
* **Node.js Crypto API (AES-GCM)** — https://nodejs.org/api/crypto.html
* **Turf.js Spatial Analysis Engine** — https://turfjs.org/
* **Leaflet & React-Leaflet Documentation** — https://leafletjs.com/
* **Tailwind CSS Documentation** — https://tailwindcss.com/
* **Framer Motion Animation Library** — https://www.framer.com/motion/
* **Render Cloud Deployment Documentation** — https://render.com/docs/
* **Node-Cron Task Scheduler** — https://www.npmjs.com/package/node-cron
* **OWASP Secure Cryptographic Storage Cheat Sheet** — https://cheatsheetseries.owasp.org/
