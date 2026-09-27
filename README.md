# 🚑 RescuRoute AI – Closed-Loop Emergency Obstruction Response Agent

> **AI-Powered Emergency Coordination for Faster Ambulance Obstruction Resolution**  
> *Developed for Emergency Hackathon | Last Updated: 2026-09-27 (Twilio REST API & Auto-SOS Dispatch Grid)*

---

## 📌 Problem Statement

Medical emergency response times are directly tied to patient mortality. Ambulances in dense urban environments like **Bengaluru** frequently lose critical minutes due to road blockages:
* Stalled or broken-down vehicles
* Uncoordinated roadworks and construction
* Accidents and sudden gridlocks
* Illegal parking in emergency lanes

Traditional navigation apps (GPS) only inform drivers of traffic passively. They do **not** physically clear the road. If a traffic responder is unavailable or fails to clear the obstruction, an immediate automated fallback is required.

---

## 💡 Proposed Solution: The Closed Loop

**RescuRoute AI** introduces a **Closed-Loop Emergency Obstruction Response Agent** that actively intervenes in physical traffic operations.

### 🔄 The 7-Step Closed Loop Core Workflow

```
[Detect] ➔ [Classify] ➔ [Assign (n8n)] ➔ [Act (Responder)] ➔ [Verify] ➔ [Escalate / Reroute] ➔ [Continue]
```

1. **Detect**: System tracks ambulance GPS telemetry vector.
2. **Classify**: AI identifies obstruction type (e.g., *Broken-down vehicle at Junction 4 MG Road*).
3. **Assign**: n8n automated workflow matches and dispatches the task to the nearest available responder (e.g., *Tow Unit #07*).
4. **Act**: Responder receives real-time alert with **Accept / Reject** controls.
5. **Verify**: System tracks responder lifecycle progress across 5 stages (`Accepted` ➔ `On Way` ➔ `Reached` ➔ `Clearing` ➔ `Cleared`).
6. **Escalate / Reroute**: If responder rejects or 90s SLA timer breaches, AI auto-escalates to secondary patrol and dynamically reroutes the ambulance via Avenue 6.
7. **Continue**: Journey continues safely with zero wasted gridlock time.

---

## 🖥️ Three Dedicated Browser Dashboards

| Dashboard | Target User | Key Capabilities |
| :--- | :--- | :--- |
| **🚑 Ambulance Dashboard** | Paramedics / Emergency Drivers | From/To Bengaluru route setup, live speed/ETA telemetry, obstruction HUD, 1-tap AI reroute acceptance, ElevenLabs voice alerts. |
| **🚜 Responder Dashboard** | Traffic Police / Tow Truck Units | Dispatch task queue, **Accept / Reject buttons**, and **5-Stage Lifecycle Progress** (`Accepted` ➔ `On Way` ➔ `Reached` ➔ `Clearing` ➔ `Cleared`). |
| **🚔 Command Admin Dashboard** | City Control Room / Dispatchers | City-wide Bengaluru map grid, responder availability matrix, SLA countdown monitor, timestamped n8n audit feed. |

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, Vanilla CSS3 (Glassmorphic design system), JavaScript (ES6).
* **3D Visual Engine**: Three.js (Full-Screen 3D WebGL Image Mesh with mouse parallax depth).
* **Maps & GIS Routing**: Leaflet.js with official Google Maps vector tiles (`mt1.google.com`) + Mapbox GL JS v3 Directions API.
* **Voice Alerts**: ElevenLabs Emergency Voice Alert synthesis.
* **Workflow Automation**: n8n Automated State Machine Engine.
* **SMS SOS Dispatch**: Direct Twilio REST API Integration with automatic FROM selection trigger.

---

## 🚀 How to Run the Project Locally

### Prerequisites
* Any standard modern web browser (**Google Chrome**, **Microsoft Edge**, **Firefox**, or **Safari**).
* Optional: **Python 3** or **Node.js** installed.

---

### Option 1: Using Python Built-in Server (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/PrathikshaHC/Rescue-Route-AI.git
   cd Rescue-Route-AI
   ```

2. Start the local server:
   ```bash
   python -m http.server 8080
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

---

### Option 2: Using Node.js `npx`

1. Clone and navigate to the directory:
   ```bash
   git clone https://github.com/PrathikshaHC/emergend_hackathon.git
   cd emergend_hackathon
   ```

2. Run local static server:
   ```bash
   npx serve .
   ```
   *or*
   ```bash
   npx http-server -p 8080
   ```

3. Open the printed localhost URL in your browser.

---

### Option 3: Opening Directly via Browser

* Simply double-click `index.html` or open `file:///path/to/emergend_hackathon/index.html` directly in your browser.

---

## 🧪 Hackathon Demo Scenario Testing Guide

1. **Start Ambulance Trip**:
   * On the **🚑 Ambulance View**, select origin (*Majestic Station 1*) and destination (*Manipal Hospital*).
   * Click **`▶ Start Ambulance Trip`**.

2. **Trigger Incident at Junction 4**:
   * Click **`🚨 Trigger Junction 4 Incident`**.
   * AI detects obstruction (*Broken-down vehicle at Junction 4 MG Road*), n8n assigns task to *Tow Unit #07*, and ElevenLabs spoken voice alert plays.

3. **Test Responder Dashboard Flow**:
   * Switch to the **`🚜 Responder View`** tab.
   * **Path A (Happy Path)**: Click **`✅ Accept Request`**, then click **`Advance Status ➔`** to progress through all 5 lifecycle stages (`On Way` ➔ `Reached` ➔ `Clearing` ➔ `Cleared`). Notice vector restored to green!
   * **Path B (Rejection / SLA Timeout)**: Click **`❌ Reject Task`** or let the 90s SLA countdown expire. Notice AI automatically escalates to Secondary Patrol and dynamically reroutes the ambulance via Avenue 6!

4. **Monitor Admin Audit Feed**:
   * Switch to the **`🚔 Command Admin`** tab to view real-time timestamped n8n incident logs.

---

## 📜 License

Distributed under the MIT License. Developed for Emergency Systems Hackathon.
