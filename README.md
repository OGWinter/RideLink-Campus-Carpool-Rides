# RideLink — Campus Carpool Connect 🚗⚡ (Bhopal Mobility)

> **A modern campus mobility web platform connecting university students across Bhopal (MANIT, Barkatullah University, RGPV) to share daily commutes, split fuel expenses transparently in Indian Rupees (₹), and reduce campus traffic and carbon emissions.**

Built with **Vanilla HTML5, CSS3, modern JavaScript (ES6+), and GSAP Animations**. Featuring the **Ocean Blue + White** startup design system (`#2563EB`, `#06B6D4`, `#F3F7FC`, `#172554`). Requires zero npm dependencies, build tools, or complex setups. Deployable anywhere as a high-performance static website.

---

## 🌟 Quick Local Execution

### Option 1: Direct Browser Access
Double-click [**`index.html`**](file:///e:/FS-37%20h2/index.html) to open directly in any browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server (Port 8080)
To run via a lightweight local HTTP server:

**Using Python 3:**
```bash
python -m http.server 8080
```
Then visit: [**`http://localhost:8080`**](http://localhost:8080)

**Using Node.js (`npx serve`):**
```bash
npx serve -p 8080 .
```

---

## 🎨 Visual Design System: Ocean Blue + White

- **Color Tokens**:
  - **Background**: Ice White / Light Ocean Tint (`#F3F7FC`)
  - **Cards & Panels**: Pure White (`#FFFFFF`) with subtle slate borders (`#E2E8F0`)
  - **Primary**: Ocean Blue (`#2563EB`) with deep blue hover (`#1D4ED8`)
  - **Accent**: Electric Cyan (`#06B6D4`)
  - **Main Typography**: Deep Navy Charcoal (`#172554`)
  - **Muted Text**: Slate Grey (`#64748B`)
  - **Status Badges**:
    - **Confirmed / Success**: Emerald Green (`#047857` on `#ECFDF5`)
    - **Pending / In Review**: Amber (`#B45309` on `#FFFBEB`)
    - **Declined / Cancelled**: Crimson (`#BE123C` on `#FFF1F2`)
    - **Women-Only Commute**: Cyan / Sky (`#0E7490` on `#ECFEFF`)
- **Fluid Typography**: Interleaved `Plus Jakarta Sans` for crisp UI elements and `Fraunces` serif for editorial brand headings.
- **GSAP Animations**: Restrained staggered entrances for dashboard stats, smooth modal springs, toast notifications, and view transitions. Automatically disables if `prefers-reduced-motion` is active or if CDN is unavailable.

---

## 📍 Bhopal City & Campus Localization

The application is localized for the student transit corridors of **Bhopal, Madhya Pradesh (India)**:
- **Major Colleges**:
  - **MANIT Bhopal** (Maulana Azad National Institute of Technology, Link Road 3)
  - **Barkatullah University (BU)** (Hoshangabad Road Campus)
  - **RGPV Campus** (Airport Road Gate, Gandhi Nagar)
- **City Transit Hubs & Routes**:
  - Rani Kamlapati Railway Station (RKMP Platform 1 Carpool Bay)
  - MP Nagar Zone-1 & DB City Mall
  - New Market (Topkhana / TT Nagar Stadium)
  - Arera Colony (10 No. Market)
  - BHEL Township (Piplani & Kasturba)
  - Kolar Road (Sarvadharma)
  - Bittan Market Haat Ground & Shahpura Lake Circle
  - Lalghati Square & Raja Bhoj Airport link
  - ISBT Bhopal & Bhopal Junction (Platform 6)
- **Currency & Timezone**:
  - All fares formatted in **₹ INR** using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`.
  - Date and time handled accurately in **`Asia/Kolkata` (IST, UTC+05:30)** to prevent timezone shifts on current-day rides.

---

## 👥 Demo Personas (For Judges & Evaluators)

| Persona | Role | Campus Affiliation | Vehicle | Testing Role |
| :--- | :--- | :--- | :--- | :--- |
| **Aarav Sharma** | Driver | Senior • B.Tech CompSci, MANIT Bhopal | Hyundai i20 Silver (`MP-04-AB-4821`) | Manage offered rides, review incoming passenger requests, approve/decline seats. |
| **Priya Patel** | Passenger | Junior • M.Sc Biotech, Barkatullah Univ | Frequent Commuter | Search carpools, filter women-only rides, request seats, cancel bookings. |
| **Rohan Verma** | Hybrid | Graduate • M.Tech Energy, RGPV Bhopal | Maruti Baleno White (`MP-04-CE-7290`) | Test airport carpooling, seat restoration on cancellation, and student bookings. |

Use the **"Switch User"** button in the sidebar or top bar to simulate both passenger seat requests and driver approvals.

---

## 💡 Transparent Fair-Share Fuel Formula

RideLink carpools operate on a non-profit expense reimbursement basis. The formula is:

$$\text{Per-Passenger Contribution (₹)} = \frac{\text{Total Trip Fuel Expense (₹)}}{\text{Offered Passenger Seats} + 1\text{ (Driver)}}$$

- **Clear Traveler Count**: The driver covers their equal share just like each passenger.
- **Example**: A ₹120 commute from MANIT to RKMP offering 3 passenger seats splits 4 ways among 4 travelers (₹120 ÷ 4) = **₹30 per person (estimated)**.
- **Safe Calculation**: Guarded against zero or negative seats (`Math.max(1, seats + 1)`).

---

## ⚙️ Invariant Guarantees & Business Rules

1. **Self-Booking Protection**: A student cannot book a seat on their own offered carpool.
2. **Duplicate Request Guard**: Prevents multiple active (`PENDING` or `APPROVED`) requests by the same passenger on the same ride.
3. **Capacity Enforcers**: Carpool seat buttons automatically display `Carpool Full` once available seats reach 0.
4. **Driver-Exclusive Authority**: Only the verified student who offered the ride can accept or decline requests in demo mode.
5. **Exact Seat Accounting**:
   - **On Approval**: Checks remaining seats > 0, decrements available seats by 1, and marks status as `APPROVED`.
   - **On Rejection**: Leaves seats unchanged, marks status as `REJECTED`.
   - **On Confirmed Cancellation**: Restores seat count (+1) exactly once, strictly bounded by the vehicle's capacity.
   - **On Pending Cancellation**: Cancels request without changing seat inventory.
6. **Route Waypoint Ordering**: Passenger pickup stop index must strictly precede dropoff stop index along the route.
7. **No Past Departures**: Validates that departure date and time cannot be in the past.
8. **Sanitized Text Injection**: All user-provided notes and names pass through `escapeHTML()` to prevent XSS.

---

## 🧪 Step-by-Step Verification Guide for Judges

1. **Verify Dashboard & Metrics**:
   - Open [http://localhost:8080](http://localhost:8080).
   - Observe the Ocean Blue + White layout, personalized greeting, live metrics in ₹, and available Bhopal rides.
2. **Test Passenger Request**:
   - Click **"Switch User"** and select **Priya Patel**.
   - Navigate to **"Find Rides"**, locate the **MANIT Bhopal → RKMP Station** carpool, and click **"Request Seat"**.
   - Select pickup and drop-off points, add an optional note, and submit.
   - Observe the toast confirmation and check **"My Bookings"** (Status: `PENDING`).
3. **Test Driver Approval & Seat Decrement**:
   - Active driver **Aarav Sharma** immediately has 2 pending seat requests waiting right on the dashboard.
   - Click **"Review & Approve Inquiries"** on the dashboard alert or navigate to **"Driver Requests"** in the sidebar.
   - Click **"Approve Request"** on Priya's inquiry.
   - Alternatively, open **"Details"** on Aarav's offered ride (`ride-101`) anywhere in the app to review and approve passenger inquiries directly from the modal!
   - Notice the available seat count decrements from 3 to 2, the card updates to confirmed, and Priya receives an in-app confirmation notification.
4. **Test Booking Cancellation & Seat Restoration**:
   - Switch back to **Priya Patel**.
   - Go to **"My Bookings"** and click **"Cancel Booking"** on the confirmed ride.
   - Confirm the cancellation. Switch back to Aarav or check **"Find Rides"**: the available seat count is restored (+1) to 2.
5. **Test Offer a Ride**:
   - Go to **"Offer a Ride"**, enter route details, and observe the live preview card and fair-share fuel split update dynamically as you type.
   - Click **"Publish Bhopal Ride"** and verify it appears immediately in the ride list.
6. **Reset State**:
   - Click **"Reset"** in the sidebar footer to restore the fresh demo state.

---

## ☁️ Deployment Guide

### Vercel Deployment
The repository includes a ready-to-deploy [`vercel.json`](file:///e:/FS-37%20h2/vercel.json) file with clean URLs and static routing:
1. Push this directory to your GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **Import Project**.
3. Select this repository:
   - **Framework Preset**: `Other`
   - **Build Command**: Leave empty / `None`
   - **Output Directory**: `./` (root)
4. Click **Deploy**. Your site will be live instantly with global CDN caching.

### Alternative: GitHub Pages
1. In your GitHub repository, open **Settings** > **Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Set branch to `main` and folder to `/ (root)`.
4. Click **Save**.

---

## 🔒 Security & Demo Storage Notice
*RideLink is a client-side frontend prototype built for hackathon demonstration. All state is persisted to the browser's `localStorage` under `ridelink_bhopal_v3`. It does not collect sensitive student records or process real financial transactions.*
