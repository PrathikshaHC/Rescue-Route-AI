# Product Requirement Document (PRD)
## Project Name: RescuRoute AI – Closed-Loop Emergency Obstruction Response System

---

## 1. Executive Summary & Vision

### 1.1 Overview
In critical medical emergencies, response times are directly tied to mortality rates. Standard navigation systems passively inform drivers of heavy traffic or closed roads, leaving ambulance operators to navigate congestion reactively. 

**RescuRoute AI** introduces a **Closed-Loop Emergency Obstruction Response Agent** that actively intervenes in the physical traffic ecosystem. Beyond routing, the system automatically detects road blockages, classifies incidents, identifies nearest authorized traffic responders (e.g., tow trucks, traffic police), dispatches clearance requests, tracks clearance verification, and automatically escalates or reroutes the ambulance if clearance SLA windows are breached.

### 1.2 Key Differentiator: Closed-Loop AI vs Passive Navigation
| Feature | Traditional Navigation Apps | RescuRoute AI Closed-Loop System |
| :--- | :--- | :--- |
| **Obstruction Handling** | Passive alert / suggestion to reroute | Active dispatch of clearance teams + automated verification |
| **Response Window** | Driver decides alternate route after encountering traffic | Predictive clearance ETA vs alternate route ETA engine |
| **Multi-Agency Link** | None | Real-time link between Ambulance Operator & Traffic Control |
| **Failure Protocol** | Reroutes deeper into side-street gridlock | Automated multi-tier escalation + priority route green-lighting |

---

## 2. Target User Personas & System Roles

### 2.1 Ambulance Operator (Field Driver & Paramedic)
* **Goal**: Reach patient or hospital in the shortest time with minimum manual distraction.
* **Key Needs**:
  * Clean, high-contrast HUD/Map interface displaying route, live ETA, and real-time obstruction alerts.
  * Turn-by-turn guidance optimized for emergency vehicle dynamics.
  * Clear visual indicators showing AI agent actions (e.g., *"Tow Truck 4 Dispatched - Clearing Junction 4 (ETA 2 min)"*).
  * Instant one-tap decision prompts if automated rerouting requires manual driver confirmation.

### 2.2 Traffic & Response Dashboard Operator (City Control Room / Dispatcher)
* **Goal**: Monitor all active emergency runs across the city, manage field responders, and resolve road blockages.
* **Key Needs**:
  * Multi-vehicle live tracking telemetry map.
  * Automated Incident Cards triggered by AI detection (Location, Type, Severity, Assigned Responder).
  * Override controls to manually verify, escalate, or assign clearance tasks.

### 2.3 Closed-Loop AI Response Agent (Autonomous System Persona)
* **Goal**: Continually monitor active ambulance vectors, detect obstructions along the planned path, orchestrate clearance workflows, and enforce tight SLAs.
* **Responsibilities**:
  1. Incident Detection & Classification.
  2. Authorized Responder Selection & Request Generation.
  3. Verification Monitoring.
  4. SLA Enforcement & Escalation / Rerouting Logic.

---

## 3. System Architecture & End-to-End Workflow

```
 +------------------------+      +-------------------------+
 |   Ambulance Operator   |      | Traffic/Response Admin  |
 |  (Origin -> Destination)|      |       Dashboard         |
 +-----------+------------+      +------------+------------+
             |                                |
             +---------------+----------------+
                             |
                             v
             +---------------+----------------+
             |  RescuRoute Core Telemetry &   |
             |       GIS Route Engine         |
             +---------------+----------------+
                             |
                             v
             +---------------+----------------+
             |   Closed-Loop AI Response      |
             |        Agent Engine            |
             +---------------+----------------+
                             |
     +-----------------------+-----------------------+
     |                       |                       |
     v                       v                       v
[Detect & Classify]  [Dispatch Responder]   [Verify & SLA Check]
  - Broken Vehicle     - Traffic Police       - Sensor / Camera
  - Accident/Debris    - Tow Truck            - Responder Input
  - Gridlock           - Municipal Unit              |
     |                       |                       |
     +-----------------------+-----------------------+
                             |
                             v
             +---------------+----------------+
             | Is Obstruction Cleared < SLA?  |
             +---------------+----------------+
                    /                 \
                 YES                   NO
                 /                       \
                v                         v
     [Maintain Optimal Route]   [Auto-Escalate Responder &]
                                [Recalculate Alternate Route]
```

### 3.1 Step-by-Step Data & Operational Flow
1. **Trip Initialization**: Ambulance Operator selects Origin (`From`) and Destination (`To`). System generates optimal emergency route and initiates live GPS tracking.
2. **Obstruction Detection**: Continuous stream monitoring (CCTV feeds, dashcams, crowdsourced telemetry, IoT sensors) detects an anomaly along the active vector (e.g., *Junction 4: Broken-down vehicle, ETA impact +4 mins*).
3. **AI Classification & Responder Assignment**: Agent classifies problem severity and searches proximity index for available authorized responders (e.g., *Traffic Unit 7* or *Municipal Heavy Tow #4*).
4. **Clearance Request Dispatch**: Agent transmits priority dispatch request containing coordinates, vehicle type required, and ambulance arrival countdown (ETA 3 min).
5. **Closed-Loop Verification Loop**:
   * **Verification Check**: Agent monitors location sensor/camera feed or responder acknowledgement.
   * **SLA Threshold Check**: If clearance is not verified within threshold \(T_{\text{SLA}}\) (e.g. 90 seconds):
     * *Escalation*: Triggers secondary responder squad alert.
     * *Dynamic Reroute*: Evaluates if alternate path ETA < (Current Path ETA + Clearance ETA). If yes, issues dynamic reroute command to Ambulance Operator.

---

## 4. Detailed Feature Specifications

### 4.1 Module 1: Ambulance Operator Interface
* **Navigation & Map Display**:
  * 3D vector map with custom dark mode glassmorphism theme for high visibility day/night.
  * Active route line highlighted with glowing dynamic status colors (Cyan = Clear, Yellow = Clearance in Progress, Red = Blocked).
* **Live Telemetry Bar**:
  * Destination Name, Distance Remaining (km), Live ETA (mm:ss), Speed (km/h).
* **Obstruction Alert Overlay**:
  * Warning Card popup when an obstruction is detected along the route.
  * Fields: Junction/Location, Incident Type badge, AI Action status tag (*"Request Sent to Tow Unit #3"*), Countdown timer to clearance.
* **Manual Override & Reroute Prompt**:
  * Clear action buttons: `[Accept AI Reroute]`, `[Maintain Current Route]`, `[Voice Contact Dispatch]`.

### 4.2 Module 2: Traffic & Response Dashboard
* **City-Wide Control Hub**:
  * Multi-layer map showing all active ambulance corridors, traffic signal status, and field units.
* **Incident Alert Feed**:
  * Live cards displaying active emergency requests:
    * *Example*: `🚨 Emergency Request | Location: Junction 4 | Problem: Broken-down vehicle | Ambulance ETA: 3 min | Status: Responder Dispatched`.
* **Responder Dispatch Matrix**:
  * Real-time table of available units (Police, Towing, Highway Patrol, EMS) with status indicators (`Available`, `En Route`, `Busy`).
* **Closed-Loop Oversight Controls**:
  * Ability for control room operators to manually confirm clearance, reassign responders, or trigger green-wave signal overrides.

### 4.3 Module 3: AI Closed-Loop Response Agent Engine
* **Incident Classifier Engine**:
  * Categorizes obstruction type into standard ontology: `VEHICLE_BREAKDOWN`, `ACCIDENT_MAJOR`, `ACCIDENT_MINOR`, `ROAD_DEBRIS`, `ILLEGAL_PARKING`, `SIGNAL_FAILURE`.
* **Automated Clearance Dispatcher**:
  * Integrates via SMS, Webhook, REST API, or Push notification to send actionable clearance requests with geo-fence anchors.
* **SLA & Escalation State Machine**:
  * State lifecycle: `DETECTED` -> `REQUESTED` -> `ACKNOWLEDGED` -> `IN_PROGRESS` -> `VERIFIED_CLEARED` OR `ESCALATED` / `REROUTED`.
* **Comparative ETA Evaluation Model**:
  * Calculates \( \text{ETA}_{\text{current\_route\_cleared}} = t_{\text{travel}} + t_{\text{clearance\_est}} \).
  * Calculates \( \text{ETA}_{\text{alternate\_route}} = t_{\text{travel\_alt}} + t_{\text{delay\_alt}} \).
  * If \( \text{ETA}_{\text{alternate\_route}} < \text{ETA}_{\text{current\_route\_cleared}} - \Delta_{\text{threshold}} \), triggers mandatory reroute recommendation.

---

## 5. UI/UX Design System & Aesthetics

To ensure a modern, state-of-the-art impression that wows users:

* **Theme**: Deep Cybernetic Dark Mode (`#0B0F19` background, `#111827` panels).
* **Color Palette**:
  * Primary Emergency Red: `#EF4444` (Live Alerts, Critical Blockages)
  * Action Amber/Yellow: `#F59E0B` (Clearance In Progress, Pending SLA)
  * Dynamic Cyan/Blue: `#06B6D4` / `#3B82F6` (Active Route, Ambulance Indicator)
  * Success Emerald: `#10B981` (Verified Cleared Route)
  * Accent Purple/Violet: `#8B5CF6` (AI Agent Activity Badges)
* **Typography**: Clean, tech-forward sans-serif (Inter / Outfit / Plus Jakarta Sans).
* **Visual Styling**: Glassmorphism (`backdrop-filter: blur(12px)`), subtle neon glow drop-shadows on status badges, responsive micro-animations for live ping indicators and countdown timers.

---

## 6. Technical Architecture & Tech Stack

### 6.1 Recommended Tech Stack
* **Frontend**: React / Next.js (TypeScript) or Vite + HTML5/CSS3.
* **Mapping Engine**: Mapbox GL JS / Leaflet.js with custom vector tiles and dynamic polyline animation.
* **Backend Services**: Node.js (Express/FastAPI) + WebSockets (Socket.io) for real-time bidirectional telemetry streaming.
* **State & Data Store**: Redis for live geolocation geospatial indexes + PostgreSQL / MongoDB for trip logs and incident histories.
* **AI & Logic Layer**: Python / Node-based State Machine microservice handling SLA countdown timers and escalation rules.

### 6.2 Data Schemas (JSON Specification)

#### Telemetry Event Schema
```json
{
  "trip_id": "TRIP-2026-8849",
  "ambulance_id": "AMB-04",
  "current_location": {
    "lat": 12.9716,
    "lng": 77.5946,
    "heading": 85.4,
    "speed_kmh": 62
  },
  "destination": {
    "name": "St. Jude Hospital",
    "lat": 12.9352,
    "lng": 77.6245
  },
  "eta_seconds": 340,
  "timestamp": "2026-09-25T21:58:00Z"
}
```

#### Incident & AI Response Schema
```json
{
  "incident_id": "INC-4920",
  "trip_id": "TRIP-2026-8849",
  "location_name": "Junction 4",
  "coordinates": { "lat": 12.9550, "lng": 77.6080 },
  "problem_type": "Broken-down vehicle",
  "severity": "HIGH",
  "ambulance_eta_to_junction_min": 3,
  "assigned_responder": {
    "responder_id": "TOW-UNIT-07",
    "type": "Authorized Tow Truck",
    "status": "DISPATCHED",
    "eta_to_site_min": 1.5
  },
  "closed_loop_status": "REQUEST_SENT",
  "sla_seconds_remaining": 90,
  "fallback_action": "REROUTE_VIA_AVENUE_6"
}
```

---

## 7. Non-Functional Requirements & Performance SLAs

1. **Real-time Latency**:
   * Telemetry update frequency: \(\le 1.0 \text{ sec}\).
   * WebSocket message propagation: \(\le 200 \text{ ms}\).
2. **Reliability & Availability**:
   * System Uptime: \(99.99\%\) operational availability.
   * Auto-reconnection logic on mobile network dropouts with local route caching.
3. **Security & Compliance**:
   * TLS 1.3 encryption in transit for all location streams.
   * Role-Based Access Control (RBAC) separating Ambulance Operators, Responders, and Admin Dispatchers.

---

## 8. Success Metrics & Key Performance Indicators (KPIs)

* **Mean Time to Clear (MTTC)**: Average time from AI detection to verified road clearance. Target: \(< 3 \text{ minutes}\).
* **Ambulance Response Time Reduction**: Percentage reduction in overall emergency travel time compared to traditional GPS. Target: \(18\% - 25\%\).
* **Escalation Accuracy**: Ratio of timely automated escalations vs unnecessary reroutes. Target: \(> 95\%\).
* **Operator Satisfaction (CSAT)**: System usability rating from paramedics and traffic dispatchers. Target: \(> 4.7 / 5.0\).

---

## 9. Phased Delivery Roadmap

* **Phase 1: Interactive Web Prototype & Simulation Agent (Current Phase)**
  * Dual-dashboard interactive web webapp.
  * Live interactive map simulation with From/To route selection.
  * Real-time incident trigger modal ("Junction 4 Broken Vehicle").
  * Visual closed-loop AI agent simulation showing clearance request dispatch, countdown SLA timer, verification check, and escalation/reroute options.
* **Phase 2: Live IoT & Camera Vision Integration**
  * Connect actual traffic camera computer vision streams and GPS hardware feeds.
* **Phase 3: Smart City Infrastructure Interoperability**
  * Automated traffic signal green-wave integration and municipal emergency responder dispatch network.

---
<!-- Last Updated: 2026-09-27 (Twilio REST API & Auto-SOS Dispatch Grid) -->
