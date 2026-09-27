/**
 * RescuRoute AI - Main Application Coordinator (3-Dashboard Hackathon MVP)
 * Full Bengaluru Emergency Grid Integration (14+ Origins & 12+ Hospitals)
 */

document.addEventListener("DOMContentLoaded", () => {
  const threeScene = new ThreeSceneEngine("webgl-canvas");
  const mapEngine = new MapboxEngine("leaflet-map-container");
  const simEngine = new ClosedLoopSimulationEngine();

  // Voice Alert Settings
  let isVoiceEnabled = true;

  // DOM Views & Navbar Buttons
  const tabAmbulance = document.getElementById("tab-ambulance");
  const tabResponder = document.getElementById("tab-responder");
  const tabAdmin = document.getElementById("tab-admin");

  const viewAmbulance = document.getElementById("view-ambulance");
  const viewResponder = document.getElementById("view-responder");
  const viewAdmin = document.getElementById("view-admin");

  const btnToggleMap = document.getElementById("btn-toggle-map");
  const mapToggleText = document.getElementById("map-toggle-text");
  const mapContainer = document.getElementById("leaflet-map-container");

  const btnToggleVoice = document.getElementById("btn-toggle-voice");
  const voiceToggleText = document.getElementById("voice-toggle-text");

  const selectFrom = document.getElementById("select-from");
  const selectTo = document.getElementById("select-to");

  let isMapModeActive = true; // Active by default like Google Maps!

  // Ambulance Elements
  const ambAlertCard = document.getElementById("amb-alert-card");
  const ambLogFeed = document.getElementById("amb-log-feed");
  const ambSlaVal = document.getElementById("amb-sla");
  const ambSlaFill = document.getElementById("amb-sla-fill");
  const ambRouteBadge = document.getElementById("amb-route-badge");

  // Responder Elements
  const respAcceptRejectBox = document.getElementById("resp-accept-reject-box");
  const respTaskBadge = document.getElementById("resp-task-badge");
  const respBtnAccept = document.getElementById("resp-btn-accept");
  const respBtnReject = document.getElementById("resp-btn-reject");
  const respBtnNextStage = document.getElementById("resp-btn-next-stage");
  const respLogFeed = document.getElementById("resp-log-feed");

  // Admin Elements
  const adminLoopBadge = document.getElementById("admin-loop-badge");
  const adminLoopState = document.getElementById("admin-loop-state");
  const adminSlaVal = document.getElementById("admin-sla-val");
  const adminTow07Status = document.getElementById("admin-tow07-status");
  const adminLogFeed = document.getElementById("admin-log-feed");

  // --------------------------------------------------------------------------
  // Location Dropdown Change Listeners (Bengaluru Grid)
  // --------------------------------------------------------------------------
  const handleLocationChange = () => {
    const fromVal = selectFrom.value;
    const toVal = selectTo.value;
    mapEngine.updateVector(fromVal, toVal);
    const origName = BLR_LOCATIONS[fromVal] ? BLR_LOCATIONS[fromVal].name : fromVal;
    const destName = BLR_LOCATIONS[toVal] ? BLR_LOCATIONS[toVal].name : toVal;
    simEngine.addLog("INFO", `Vector updated: ${origName} ➔ ${destName}.`);
  };

  selectFrom.addEventListener("change", handleLocationChange);
  selectTo.addEventListener("change", handleLocationChange);

  // --------------------------------------------------------------------------
  // 3-Dashboard Tab Switcher
  // --------------------------------------------------------------------------
  const switchView = (activeTab, activeView, viewName) => {
    [tabAmbulance, tabResponder, tabAdmin].forEach(t => t.classList.remove("active"));
    [viewAmbulance, viewResponder, viewAdmin].forEach(v => v.classList.remove("active-view"));

    activeTab.classList.add("active");
    activeView.classList.add("active-view");

    simEngine.addLog("INFO", `Switched active dashboard to ${viewName}.`);
  };

  tabAmbulance.addEventListener("click", () => switchView(tabAmbulance, viewAmbulance, "Ambulance Operator HUD"));
  tabResponder.addEventListener("click", () => switchView(tabResponder, viewResponder, "Responder Dashboard"));
  tabAdmin.addEventListener("click", () => switchView(tabAdmin, viewAdmin, "Command Admin Control Room"));

  // Toggle Map Visibility
  btnToggleMap.addEventListener("click", () => {
    isMapModeActive = !isMapModeActive;
    if (isMapModeActive) {
      mapContainer.classList.remove("hidden-map");
      mapToggleText.textContent = "🏢 Switch to 3D Canvas";
      simEngine.addLog("INFO", "Layer switched to Google Maps Navigation View.");
    } else {
      mapContainer.classList.add("hidden-map");
      mapToggleText.textContent = "🗺️ Switch to Google Maps";
      simEngine.addLog("INFO", "Layer switched to Pure 3D Background Canvas.");
    }
  });

  // Toggle Voice Alerts
  btnToggleVoice.addEventListener("click", () => {
    isVoiceEnabled = !isVoiceEnabled;
    voiceToggleText.textContent = isVoiceEnabled ? "🔊 Voice Alert: ON" : "🔇 Voice Alert: OFF";
    if (isVoiceEnabled) speakVoiceAlert("ElevenLabs emergency voice alert active.");
  });

  // Speech Synthesizer
  const speakVoiceAlert = (text) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // --------------------------------------------------------------------------
  // Simulation Controls & Event Handlers
  // --------------------------------------------------------------------------
  document.getElementById("btn-start-sim").addEventListener("click", () => {
    const fromVal = selectFrom.value;
    const toVal = selectTo.value;
    const origName = BLR_LOCATIONS[fromVal] ? BLR_LOCATIONS[fromVal].name : fromVal;
    const destName = BLR_LOCATIONS[toVal] ? BLR_LOCATIONS[toVal].name : toVal;

    simEngine.startSimulation(origName, destName);
    speakVoiceAlert(`Ambulance AMB-04 dispatched from ${origName} to ${destName}.`);
  });

  document.getElementById("btn-trigger-obs").addEventListener("click", () => {
    simEngine.triggerObstructionAtJunction4();
  });

  document.getElementById("btn-reset-sim").addEventListener("click", () => {
    simEngine.resetSimulation();
    ambAlertCard.style.display = "none";
    respAcceptRejectBox.style.display = "flex";
    respBtnNextStage.disabled = true;
    respTaskBadge.className = "status-badge badge-warning";
    respTaskBadge.textContent = "PENDING YOUR ACTION";
    adminTow07Status.className = "status-badge badge-warning";
    adminTow07Status.textContent = "STANDBY";
    resetLifecycleUI();
    speakVoiceAlert("Simulation reset to dispatch standby.");
  });

  // Responder Actions: Accept / Reject
  respBtnAccept.addEventListener("click", () => {
    simEngine.responderAccepts();
    respAcceptRejectBox.style.display = "none";
    respBtnNextStage.disabled = false;
    respTaskBadge.className = "status-badge badge-clear";
    respTaskBadge.textContent = "TASK ACCEPTED";
    updateLifecycleUI(1);
    speakVoiceAlert("Tow Unit 07 accepted clearance request. Moving to site.");
  });

  respBtnReject.addEventListener("click", () => {
    simEngine.responderRejects();
    respAcceptRejectBox.style.display = "none";
    respTaskBadge.className = "status-badge badge-danger";
    respTaskBadge.textContent = "TASK REJECTED";
    speakVoiceAlert("Warning: Tow Unit 07 rejected request. AI triggering dynamic escalation and reroute.");
  });

  // Advance 5-Stage Lifecycle
  respBtnNextStage.addEventListener("click", () => {
    simEngine.advanceResponderLifecycle();
    const stage = simEngine.currentResponderStage;
    updateLifecycleUI(stage);

    if (stage === 5) {
      respBtnNextStage.disabled = true;
      speakVoiceAlert("Road clearance verified. Junction 4 cleared.");
    }
  });

  // Ambulance Accept AI Reroute
  document.getElementById("amb-btn-accept-reroute").addEventListener("click", () => {
    simEngine.addLog("SUCCESS", "Paramedic Accepted AI Dynamic Reroute via Avenue 6.");
    ambAlertCard.style.display = "none";
    speakVoiceAlert("AI dynamic reroute accepted. Route updated via Avenue 6.");
  });

  // --------------------------------------------------------------------------
  // Closed-Loop Engine Event Subscriptions
  // --------------------------------------------------------------------------
  simEngine.subscribe("onStateChange", (state) => {
    adminLoopState.textContent = state;

    if (state === "EN_ROUTE") {
      ambRouteBadge.className = "status-badge badge-clear";
      ambRouteBadge.textContent = "EN ROUTE";
      adminLoopBadge.className = "status-badge badge-clear";
      adminLoopBadge.textContent = "ACTIVE VECTOR";
      mapEngine.setRouteColor("#1a73e8");
    }
    else if (state === "OBSTRUCTION_DETECTED") {
      ambAlertCard.style.display = "block";
      ambRouteBadge.className = "status-badge badge-danger";
      ambRouteBadge.textContent = "OBSTRUCTION";
      adminLoopBadge.className = "status-badge badge-danger";
      adminLoopBadge.textContent = "OBSTRUCTION ALERT";
      mapEngine.setRouteColor("#ea4335");
      speakVoiceAlert("Emergency Alert: Obstruction detected at Junction 4 MG Road. Broken down vehicle blocking vector.");
    }
    else if (state === "N8N_DISPATCHED") {
      adminTow07Status.className = "status-badge badge-danger";
      adminTow07Status.textContent = "DISPATCHED (n8n)";
      mapEngine.dispatchTowTruckAnimation();
      speakVoiceAlert("n8n automated workflow assigned clearance task to Tow Unit 07.");
    }
    else if (state === "RESPONDER_ACCEPTED") {
      adminTow07Status.className = "status-badge badge-warning";
      adminTow07Status.textContent = "ACCEPTED & EN ROUTE";
    }
    else if (state === "CLEARANCE_SUCCESS") {
      ambAlertCard.style.display = "none";
      ambRouteBadge.className = "status-badge badge-clear";
      ambRouteBadge.textContent = "CLEARED";
      adminLoopBadge.className = "status-badge badge-clear";
      adminLoopBadge.textContent = "RESOLVED";
      adminTow07Status.className = "status-badge badge-clear";
      adminTow07Status.textContent = "CLEARED SITE";
      mapEngine.setRouteColor("#34a853");
    }
    else if (state === "SLA_BREACH_ESCALATED") {
      ambRouteBadge.className = "status-badge badge-warning";
      ambRouteBadge.textContent = "REROUTED";
      adminLoopBadge.className = "status-badge badge-warning";
      adminLoopBadge.textContent = "AUTO-ESCALATED";
      adminTow07Status.className = "status-badge badge-danger";
      adminTow07Status.textContent = "UNAVAILABLE";
      mapEngine.showAlternateReroute();
    }
  });

  simEngine.subscribe("onSlaTick", (seconds) => {
    ambSlaVal.textContent = `${seconds}s`;
    adminSlaVal.textContent = `${seconds}s`;
    const pct = (seconds / 90) * 100;
    ambSlaFill.style.width = `${pct}%`;
  });

  simEngine.subscribe("onLogEntry", (log) => {
    [ambLogFeed, respLogFeed, adminLogFeed].forEach(container => {
      if (!container) return;
      const entryDiv = document.createElement("div");
      let logClass = "";
      if (log.type === "ALERT") logClass = "log-alert";
      if (log.type === "ACTION") logClass = "log-action";
      if (log.type === "SUCCESS") logClass = "log-success";

      entryDiv.className = `log-entry ${logClass}`;
      entryDiv.innerHTML = `
        <div class="log-time">${log.timestamp}</div>
        <div>${log.message}</div>
      `;
      container.prepend(entryDiv);
    });
  });

  const updateLifecycleUI = (stageNum) => {
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`stage-${i}`);
      if (!el) continue;
      el.classList.remove("active", "completed");
      if (i < stageNum) el.classList.add("completed");
      if (i === stageNum) el.classList.add("active");
    }
  };

  const resetLifecycleUI = () => {
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`stage-${i}`);
      if (el) el.classList.remove("active", "completed");
    }
  };
});
