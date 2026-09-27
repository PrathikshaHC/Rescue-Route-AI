/**
 * RescuRoute AI - Real Google Maps Engine (Bengaluru Emergency Vector Grid)
 * Comprehensive database covering 14+ Pickup Sectors & 12+ Emergency Hospitals across Bengaluru.
 */

// Full Bengaluru Location Coordinates Database [lat, lng]
const BLR_LOCATIONS = {
  // Pickup Sectors (Origins)
  "Majestic": { name: "Majestic KSR Station (Central)", lat: 12.9767, lng: 77.5730 },
  "Airport": { name: "Kempegowda Int'l Airport (North)", lat: 13.1986, lng: 77.7066 },
  "Indiranagar": { name: "Indiranagar 100ft Road (East)", lat: 12.9784, lng: 77.6408 },
  "Koramangala": { name: "Koramangala 5th Block (SE)", lat: 12.9352, lng: 77.6245 },
  "Whitefield": { name: "Whitefield ITPL Tech Park (East)", lat: 12.9850, lng: 77.7260 },
  "Ecity": { name: "Electronic City Phase 1 (South)", lat: 12.8399, lng: 77.6770 },
  "Jayanagar": { name: "Jayanagar 4th Block (South)", lat: 12.9250, lng: 77.5830 },
  "Hebbal": { name: "Hebbal Flyover Junction (North)", lat: 13.0358, lng: 77.5970 },
  "Banashankari": { name: "Banashankari 3rd Stage (SW)", lat: 12.9260, lng: 77.5520 },
  "Rajajinagar": { name: "Rajajinagar Metro Hub (West)", lat: 12.9900, lng: 77.5530 },
  "Marathahalli": { name: "Marathahalli ORR (East)", lat: 12.9560, lng: 77.7010 },
  "Yelahanka": { name: "Yelahanka New Town (North)", lat: 13.0990, lng: 77.5930 },
  "Sarjapur": { name: "Sarjapur Road Wipro Circle (SE)", lat: 12.9100, lng: 77.6830 },
  "Malleshwaram": { name: "Malleshwaram Sampige Road (West)", lat: 13.0030, lng: 77.5700 },

  // Emergency Hospitals (Destinations)
  "Hospital": { name: "Manipal Hospital (Old Airport Rd)", lat: 12.9580, lng: 77.6350 },
  "StJohns": { name: "St. John's Hospital (Koramangala)", lat: 12.9310, lng: 77.6200 },
  "Fortis": { name: "Fortis Hospital (Bannerghatta Rd)", lat: 12.8950, lng: 77.5980 },
  "Narayana": { name: "Narayana Hrudayalaya (Health City)", lat: 12.8120, lng: 77.6940 },
  "Victoria": { name: "Victoria Hospital (KR Market)", lat: 12.9630, lng: 77.5750 },
  "Nimhans": { name: "Nimhans Neuroemergency (Hosur Rd)", lat: 12.9430, lng: 77.5960 },
  "Aster": { name: "Aster CMI Hospital (Hebbal)", lat: 13.0560, lng: 77.5910 },
  "Columbia": { name: "Columbia Asia / Manipal (Hebbal)", lat: 13.0480, lng: 77.5930 },
  "Vydehi": { name: "Vydehi Hospital (Whitefield)", lat: 12.9760, lng: 77.7280 },
  "Apollo": { name: "Apollo Hospital (Jayanagar)", lat: 12.9160, lng: 77.5950 },
  "Sakra": { name: "Sakra World Hospital (Marathahalli)", lat: 12.9280, lng: 77.6840 },
  "BMS": { name: "BMS Hospital (Basavanagudi)", lat: 12.9410, lng: 77.5680 }
};

class MapboxEngine {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.fromMarker = null;
    this.toMarker = null;
    this.ambulanceMarker = null;
    this.obstructionMarker = null;
    this.towTruckMarker = null;
    this.routePolyline = null;
    this.altRoutePolyline = null;

    // Current Active Locations (Default: Majestic -> Manipal)
    this.currentOriginKey = "Majestic";
    this.currentDestKey = "Hospital";

    this.fromCoords = [BLR_LOCATIONS.Majestic.lat, BLR_LOCATIONS.Majestic.lng];
    this.junction4Coords = [12.9730, 77.6080]; // MG Road Junction 4
    this.toCoords = [BLR_LOCATIONS.Hospital.lat, BLR_LOCATIONS.Hospital.lng];

    this.initGoogleMap();
  }

  initGoogleMap() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    container.innerHTML = '';

    // Initialize Leaflet Map centered on Bengaluru
    this.map = L.map(this.containerId, {
      zoomControl: false,
      attributionControl: false
    }).setView(this.junction4Coords, 13);

    // Official Google Maps Standard Base Tile Layer
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(this.map);

    // Official Google Maps Real-Time Live Traffic Flow Layer
    this.trafficLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      opacity: 0.85
    }).addTo(this.map);

    L.control.zoom({ position: 'topright' }).addTo(this.map);

    this.addMarkers();
    this.drawMainPolyline();
  }

  toggleTraffic(enable) {
    if (!this.map || !this.trafficLayer) return;
    if (enable) {
      if (!this.map.hasLayer(this.trafficLayer)) {
        this.trafficLayer.addTo(this.map);
      }
    } else {
      if (this.map.hasLayer(this.trafficLayer)) {
        this.map.removeLayer(this.trafficLayer);
      }
    }
  }

  addMarkers() {
    const createCustomIcon = (className, emoji) => L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="marker-pin ${className}">${emoji}</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const origObj = BLR_LOCATIONS[this.currentOriginKey] || BLR_LOCATIONS.Majestic;
    const destObj = BLR_LOCATIONS[this.currentDestKey] || BLR_LOCATIONS.Hospital;

    // Origin Pin
    this.fromMarker = L.marker([origObj.lat, origObj.lng], { icon: createCustomIcon('marker-from', '🏁') })
      .addTo(this.map)
      .bindPopup(`<b>${origObj.name}</b><br>Ambulance Dispatch Point`);

    // Destination Pin
    this.toMarker = L.marker([destObj.lat, destObj.lng], { icon: createCustomIcon('marker-to', '🏥') })
      .addTo(this.map)
      .bindPopup(`<b>${destObj.name}</b><br>Emergency Hospital Target`);

    // Ambulance Pin
    this.ambulanceMarker = L.marker([origObj.lat, origObj.lng], { icon: createCustomIcon('marker-ambulance', '🚑') })
      .addTo(this.map)
      .bindPopup("<b>Ambulance AMB-04</b><br>Status: EN ROUTE");

    // Obstruction Pin (Junction 4 MG Road)
    this.obstructionMarker = L.marker(this.junction4Coords, { icon: createCustomIcon('marker-obstruction', '🚨') })
      .addTo(this.map)
      .bindPopup("<b>Junction 4 (MG Road, Bengaluru)</b><br>Problem: Broken-down vehicle<br>Ambulance ETA: 3 min");

    // Tow Truck Pin
    this.towTruckMarker = L.marker([12.9650, 77.6150], { icon: createCustomIcon('marker-tow', '🚜') })
      .addTo(this.map)
      .bindPopup("<b>Tow Unit #07</b><br>Authorized Responder");
  }

  async drawMainPolyline() {
    if (this.altRoutePolyline) {
      this.map.removeLayer(this.altRoutePolyline);
      this.altRoutePolyline = null;
    }
    if (this.altRouteOutlinePolyline) {
      this.map.removeLayer(this.altRouteOutlinePolyline);
      this.altRouteOutlinePolyline = null;
    }

    const origObj = BLR_LOCATIONS[this.currentOriginKey] || BLR_LOCATIONS.Majestic;
    const destObj = BLR_LOCATIONS[this.currentDestKey] || BLR_LOCATIONS.Hospital;

    let mainWaypoints = [
      [origObj.lat, origObj.lng],
      [ (origObj.lat * 0.6 + this.junction4Coords[0] * 0.4), (origObj.lng * 0.6 + this.junction4Coords[1] * 0.4) ],
      this.junction4Coords,
      [ (this.junction4Coords[0] * 0.4 + destObj.lat * 0.6), (this.junction4Coords[1] * 0.4 + destObj.lng * 0.6) ],
      [destObj.lat, destObj.lng]
    ];

    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origObj.lng},${origObj.lat};${this.junction4Coords[1]},${this.junction4Coords[0]};${destObj.lng},${destObj.lat}?overview=full&geometries=geojson`;
      const res = await fetch(osrmUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes[0] && data.routes[0].geometry) {
          mainWaypoints = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        }
      }
    } catch (e) {
      console.warn("Using street geometry fallback:", e);
    }

    if (this.routePolyline) this.map.removeLayer(this.routePolyline);

    this.routePolyline = L.polyline(mainWaypoints, {
      color: '#1a73e8', // Google Blue
      weight: 7,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map);

    this.map.fitBounds(this.routePolyline.getBounds(), { padding: [60, 60] });
  }

  // Update Vector dynamically when user picks different Bengaluru origin/destination
  updateVector(originKey, destKey) {
    if (BLR_LOCATIONS[originKey]) this.currentOriginKey = originKey;
    if (BLR_LOCATIONS[destKey]) this.currentDestKey = destKey;

    const origObj = BLR_LOCATIONS[this.currentOriginKey];
    const destObj = BLR_LOCATIONS[this.currentDestKey];

    if (this.fromMarker) this.fromMarker.setLatLng([origObj.lat, origObj.lng]).setPopupContent(`<b>${origObj.name}</b><br>Ambulance Dispatch Point`);
    if (this.toMarker) this.toMarker.setLatLng([destObj.lat, destObj.lng]).setPopupContent(`<b>${destObj.name}</b><br>Emergency Hospital Target`);
    if (this.ambulanceMarker) this.ambulanceMarker.setLatLng([origObj.lat, origObj.lng]);

    this.drawMainPolyline();
  }

  setRouteColor(colorHex) {
    if (this.routePolyline) {
      this.routePolyline.setStyle({ color: colorHex });
    }
  }

  async showAlternateReroute(routeIndex = 1) {
    this.setRouteColor('#ea4335'); // Turn blocked route red

    const origObj = BLR_LOCATIONS[this.currentOriginKey] || BLR_LOCATIONS.Majestic;
    const destObj = BLR_LOCATIONS[this.currentDestKey] || BLR_LOCATIONS.Hospital;

    const midLat = (origObj.lat + destObj.lat) / 2;
    const midLng = (origObj.lng + destObj.lng) / 2;

    const routeOptions = [
      { name: "Avenue 6 North Bypass", latOffset: 0.015, lngOffset: -0.012 },
      { name: "Trinity Circle South Corridor", latOffset: -0.014, lngOffset: 0.015 },
      { name: "Cubbon Park Expressway", latOffset: 0.022, lngOffset: 0.008 }
    ];

    const idx = (Math.max(1, routeIndex) - 1) % routeOptions.length;
    const selectedRoute = routeOptions[idx];

    const altViaLat = midLat + selectedRoute.latOffset;
    const altViaLng = midLng + selectedRoute.lngOffset;

    let initialWaypoints = [
      [origObj.lat, origObj.lng],
      [ (origObj.lat * 0.5 + altViaLat * 0.5), (origObj.lng * 0.5 + altViaLng * 0.5) ],
      [altViaLat, altViaLng],
      [ (altViaLat * 0.5 + destObj.lat * 0.5), (altViaLng * 0.5 + destObj.lng * 0.5) ],
      [destObj.lat, destObj.lng]
    ];

    // INSTANTLY render outline & bright neon green dashed polyline (0ms delay)
    if (this.altRouteOutlinePolyline) this.map.removeLayer(this.altRouteOutlinePolyline);
    if (this.altRoutePolyline) this.map.removeLayer(this.altRoutePolyline);

    // Dark contrast shadow outline
    this.altRouteOutlinePolyline = L.polyline(initialWaypoints, {
      color: '#0f172a',
      weight: 12,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map);

    // Bright Neon Green Dashed Polyline
    this.altRoutePolyline = L.polyline(initialWaypoints, {
      color: '#00e676', // High-visibility Neon Green
      weight: 8,
      dashArray: '12, 12',
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map);

    this.map.fitBounds(this.altRoutePolyline.getBounds(), { padding: [50, 50] });

    // Asynchronously update with detailed OSRM turn-by-turn road geometry
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origObj.lng},${origObj.lat};${altViaLng},${altViaLat};${destObj.lng},${destObj.lat}?overview=full&geometries=geojson`;
      const res = await fetch(osrmUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes[0] && data.routes[0].geometry) {
          const dataCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          if (this.altRouteOutlinePolyline) this.altRouteOutlinePolyline.setLatLngs(dataCoords);
          if (this.altRoutePolyline) this.altRoutePolyline.setLatLngs(dataCoords);
          this.map.fitBounds(this.altRoutePolyline.getBounds(), { padding: [50, 50] });
        }
      }
    } catch (e) {
      console.warn("Using alternate road geometry fallback:", e);
    }

    return selectedRoute;
  }

  dispatchTowTruckAnimation() {
    if (this.towTruckMarker) {
      this.towTruckMarker.setLatLng(this.junction4Coords);
    }
  }
}
