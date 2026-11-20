import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Thermometer, Snowflake, Activity, Droplets, Zap, Server,
  Play, Pause, RotateCcw, CheckCircle2, Gauge, Wind, Info,
  DollarSign, ShieldCheck, Building2, Wrench, Cpu, Sliders,
  Maximize2, CloudSun, Check, ChevronRight
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  COOLING PROFILES — Basic Foundational & Advanced Hybrid           */
/* ------------------------------------------------------------------ */
const COOLING_PROFILES = {
  // === 7-8 BASIC / CONVENTIONAL TECHNOLOGIES ===
  crac: {
    category: "Basic / Foundational",
    label: "1. CRAC — Refrigerant-Based Air Cooling",
    short: "CRAC (Refrigerant DX)",
    capacity: 35,
    energyPerUnit: 1.05,
    targetTemp: 24,
    maxDensity: 15,
    ambientSens: 0.035,
    capex: "Low",
    opex: "High",
    recommendedFor: "Legacy enterprise facilities; low upfront investment with standardized DX units."
  },
  crah: {
    category: "Basic / Foundational",
    label: "2. CRAH — Chilled-Water Air Cooling",
    short: "CRAH (Chilled-Water)",
    capacity: 50,
    energyPerUnit: 0.85,
    targetTemp: 23,
    maxDensity: 25,
    ambientSens: 0.025,
    capex: "Medium",
    opex: "Medium",
    recommendedFor: "Medium-to-large facilities with central chiller plant infrastructure."
  },
  economizer: {
    category: "Basic / Foundational",
    label: "3. Economizer Cooling — Free Cooling (Air/Water-Side)",
    short: "Free Economizer",
    capacity: 45,
    energyPerUnit: 0.40,
    targetTemp: 23,
    maxDensity: 20,
    ambientSens: 0.030,
    capex: "Medium",
    opex: "Very Low",
    recommendedFor: "Regions with cool, dry climates seeking minimum operating electricity costs."
  },
  rdhx: {
    category: "Basic / Foundational",
    label: "4. Rear-Door Heat Exchanger (RDHx) Cooling",
    short: "Rear-Door (RDHx)",
    capacity: 75,
    energyPerUnit: 0.65,
    targetTemp: 22,
    maxDensity: 50,
    ambientSens: 0.016,
    capex: "Medium",
    opex: "Moderate",
    recommendedFor: "High-density rack clusters without requiring complete room air ducting overhauls."
  },
  d2c: {
    category: "Basic / Foundational",
    label: "5. Direct-to-Chip Liquid Cooling",
    short: "Direct-to-Chip (D2C)",
    capacity: 150,
    energyPerUnit: 0.42,
    targetTemp: 21,
    maxDensity: 140,
    ambientSens: 0.008,
    capex: "High",
    opex: "Low",
    recommendedFor: "High-performance compute (HPC), AI training, and TDP > 500W processor stability."
  },
  immersion_1p: {
    category: "Basic / Foundational",
    label: "6. Single-Phase Immersion Cooling",
    short: "1-Phase Immersion",
    capacity: 200,
    energyPerUnit: 0.32,
    targetTemp: 24,
    maxDensity: 220,
    ambientSens: 0.005,
    capex: "High",
    opex: "Very Low",
    recommendedFor: "Extreme density compute tanks using hydrocarbon dielectric fluid."
  },
  immersion_2p: {
    category: "Basic / Foundational",
    label: "7. Two-Phase Immersion Cooling",
    short: "2-Phase Immersion",
    capacity: 250,
    energyPerUnit: 0.25,
    targetTemp: 25,
    maxDensity: 300,
    ambientSens: 0.003,
    capex: "Very High",
    opex: "Very Low",
    recommendedFor: "Next-gen ultra-dense AI supercomputing using phase-change fluorochemicals."
  },

  // === 5 HYBRID UPGRADES ===
  h1: {
    category: "Hybrid Architecture",
    label: "H1: CRAC + Aisle Containment + Adaptive Controls",
    short: "H1 (CRAC Hybrid)",
    capacity: 55,
    energyPerUnit: 0.78,
    targetTemp: 23,
    maxDensity: 25,
    ambientSens: 0.024,
    capex: "Low-Med",
    opex: "Medium",
    recommendedFor: "Cost-effective retrofit for existing CRAC sites; prevents hot/cold air mixing."
  },
  h2: {
    category: "Hybrid Architecture",
    label: "H2: CRAH + Aisle Containment + Variable-Flow Control",
    short: "H2 (CRAH Hybrid)",
    capacity: 70,
    energyPerUnit: 0.68,
    targetTemp: 23,
    maxDensity: 35,
    ambientSens: 0.019,
    capex: "Medium",
    opex: "Medium-Low",
    recommendedFor: "Existing CRAH sites looking to dynamically regulate chilled-water flow rates."
  },
  h3: {
    category: "Hybrid Architecture",
    label: "H3: Air Cooling + Economizer + Mechanical Backup",
    short: "H3 (Economizer Hybrid)",
    capacity: 65,
    energyPerUnit: 0.52,
    targetTemp: 22,
    maxDensity: 30,
    ambientSens: 0.014,
    capex: "Medium-High",
    opex: "Low",
    recommendedFor: "Climate-supported regions balancing free ambient cooling with automatic backup."
  },
  h4: {
    category: "Hybrid Architecture",
    label: "H4: Air Cooling + Rear-Door Heat Exchangers",
    short: "H4 (Air + RDHx)",
    capacity: 90,
    energyPerUnit: 0.56,
    targetTemp: 22,
    maxDensity: 65,
    ambientSens: 0.011,
    capex: "Medium-High",
    opex: "Low",
    recommendedFor: "Economical retrofit for neutralizing isolated hot racks within standard air rooms."
  },
  h5: {
    category: "Hybrid Architecture",
    label: "H5: Air Cooling + Direct-to-Chip Liquid Cooling",
    short: "H5 (Air + D2C)",
    capacity: 160,
    energyPerUnit: 0.38,
    targetTemp: 21,
    maxDensity: 160,
    ambientSens: 0.007,
    capex: "High",
    opex: "Low",
    recommendedFor: "Demanding AI training facilities with mixed standard and GPU compute densities."
  },
};

const RACK_COUNT = 4;

function initRacks(profileKey) {
  const p = COOLING_PROFILES[profileKey];
  const ratedLoad = Math.round(p.maxDensity * 0.6);
  return Array.from({ length: RACK_COUNT }, (_, i) => ({
    id: i + 1,
    ratedLoad: Math.round(ratedLoad * (0.8 + Math.random() * 0.4)),
    workload: 55 + Math.random() * 25,
    temp: p.targetTemp + Math.random() * 1.8,
    coolingPower: 50,
  }));
}

function Phase1() {
  const [profileKey, setProfileKey] = useState("crac");
  const [running, setRunning] = useState(true);
  const [ambient, setAmbient] = useState(30);
  const [racks, setRacks] = useState(() => initRacks("crac"));
  const [history, setHistory] = useState([]);
  const [selectedRackId, setSelectedRackId] = useState(1);
  const profile = COOLING_PROFILES[profileKey];

  const reset = (key = profileKey) => {
    setRacks(initRacks(key));
    setHistory([]);
  };

  useEffect(() => { reset(profileKey); }, [profileKey]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRacks((prev) => {
        const next = prev.map((r) => {
          const drift = (Math.random() - 0.5) * 8;
          const workload = Math.min(100, Math.max(25, r.workload + drift * 0.35));
          const heat = r.ratedLoad * (workload / 100);
          const capacityPerRack = profile.capacity;
          const coolingRemoved = capacityPerRack * (r.coolingPower / 100);
          const deltaHeat = heat - coolingRemoved;
          let temp = r.temp + deltaHeat * 0.02 + (ambient - 24) * profile.ambientSens;
          temp = Math.min(48, Math.max(16, temp));
          const error = temp - profile.targetTemp;
          const coolingPower = Math.min(100, Math.max(5, r.coolingPower + error * 3));
          return { ...r, workload, temp, coolingPower, heat, coolingRemoved };
        });

        const totalHeat = next.reduce((s, r) => s + r.heat, 0);
        const optimizedEnergy = next.reduce(
          (s, r) => s + profile.capacity * (r.coolingPower / 100) * profile.energyPerUnit, 0
        );
        const baselineEnergy = next.reduce(
          (s) => s + profile.capacity * 0.85 * profile.energyPerUnit, 0
        );
        const pue = (totalHeat + optimizedEnergy) / Math.max(totalHeat, 1);
        const savings = ((baselineEnergy - optimizedEnergy) / baselineEnergy) * 100;
        const avgTemp = next.reduce((s, r) => s + r.temp, 0) / next.length;

        setHistory((h) => {
          const point = { avgTemp, pue, optimizedEnergy, savings };
          return [...h, point].slice(-1);
        });

        return next;
      });
    }, 1100);
    return () => clearInterval(id);
  }, [running, profile, ambient]);

  const latest = history[history.length - 1];

  const kpis = [
    { label: "Current PUE", value: latest ? latest.pue.toFixed(2) : "—" },
    { label: "Avg Rack Temp", value: latest ? `${latest.avgTemp.toFixed(1)}°C` : "—" },
    { label: "Cooling Energy", value: latest ? `${latest.optimizedEnergy.toFixed(0)} kWu` : "—" },
    { label: "Energy Saved", value: latest ? `${Math.max(0, latest.savings).toFixed(1)}%` : "—" },
  ];

  const selectedRack = racks.find(r => r.id === selectedRackId);

  return (
    <div className="space-y-6 text-gray-800">
      {/* Config Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[320px]">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Select Cooling Strategy
            </label>
            <select
              value={profileKey}
              onChange={(e) => setProfileKey(e.target.value)}
              className="w-full border border-gray-300 bg-white text-gray-800 text-sm font-medium rounded-md px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <optgroup label="Conventional / Basic Cooling Strategies">
                <option value="crac">1. CRAC — Refrigerant-Based Air Cooling</option>
                <option value="crah">2. CRAH — Chilled-Water Air Cooling</option>
                <option value="economizer">3. Economizer Cooling — Free Cooling (Air/Water-Side)</option>
                <option value="rdhx">4. Rear-Door Heat Exchanger Cooling</option>
                <option value="d2c">5. Direct-to-Chip Liquid Cooling</option>
                <option value="immersion_1p">6. Single-Phase Immersion Cooling</option>
                <option value="immersion_2p">7. Two-Phase Immersion Cooling</option>
              </optgroup>
              <optgroup label="Hybrid Approaches (Moderate to High Investment)">
                <option value="h1">H1: CRAC + Aisle Containment + Adaptive Controls</option>
                <option value="h2">H2: CRAH + Aisle Containment + Variable-Flow Control</option>
                <option value="h3">H3: Air Cooling + Economizer + Automatic Mechanical Backup</option>
                <option value="h4">H4: Air Cooling + Rear-Door Heat Exchangers</option>
                <option value="h5">H5: Air Cooling + Direct-to-Chip Liquid Cooling</option>
              </optgroup>
            </select>
          </div>

          {/* Locked-width Ambient Temperature Slider */}
          <div className="flex flex-col w-56">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              <span className="flex items-center gap-1">
                <Wind size={14} /> Ambient Temp
              </span>
              <span className="font-mono text-gray-800 text-sm w-12 text-right tabular-nums">
                {ambient}°C
              </span>
            </div>
            <input
              type="range" min={-10} max={45} value={ambient}
              onChange={(e) => setAmbient(+e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 self-end">
            <button
              onClick={() => setRunning((r) => !r)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md px-4 py-2.5 transition-colors shadow-sm"
            >
              {running ? <Pause size={16} /> : <Play size={16} />}
              {running ? "Pause" : "Resume"}
            </button>
            <button
              onClick={() => reset()}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 text-sm font-medium rounded-md px-4 py-2.5 transition-colors shadow-sm"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        {/* Economic & Practical Deployment Banner */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-gray-800">Deployment Context: </span>
              <span className="text-gray-600">{profile.recommendedFor}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0 font-medium text-gray-600 border-t sm:border-t-0 sm:border-l border-gray-200 pt-2 sm:pt-0 sm:pl-4">
            <span className="flex items-center gap-1">
              <DollarSign size={14} className="text-gray-500" /> Capex: <strong>{profile.capex}</strong>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-gray-500" /> Opex: <strong>{profile.opex}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-900">{k.value}</div>
            <div className="text-sm text-gray-500 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Rack Monitoring Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-5 border-b border-gray-100 pb-3 flex items-center gap-2">
          <Server size={20} className="text-blue-600" /> Rack Monitoring &amp; Lookup
        </h3>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Rack Selector Buttons */}
          <div className="flex flex-col gap-3 md:w-1/3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Select Rack
            </span>
            {racks.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRackId(r.id)}
                className={`flex justify-between items-center px-4 py-3.5 rounded-lg border text-left transition-all ${
                  selectedRackId === r.id
                    ? "bg-blue-50 border-blue-500 text-blue-900 font-semibold shadow-sm"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Server size={18} className={selectedRackId === r.id ? "text-blue-600" : "text-gray-400"} />
                  <span className="text-base">Rack {r.id}</span>
                </div>
                {selectedRackId === r.id ? (
                  <CheckCircle2 size={18} className="text-blue-600" />
                ) : (
                  <span className="text-xs font-medium text-gray-400">{r.temp.toFixed(1)}°C</span>
                )}
              </button>
            ))}
          </div>

          {/* Selected Rack Telemetry */}
          {selectedRack && (
            <div className="md:w-2/3 bg-gray-50 rounded-lg border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-5">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      Live Telemetry — Rack {selectedRack.id}
                    </h4>
                    <span className="text-xs text-gray-500">Real-time thermal and load parameters</span>
                  </div>
                  <span className="text-xs font-medium text-blue-800 bg-blue-100 px-3 py-1.5 rounded-full border border-blue-200">
                    {profile.short}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1.5 mb-2">
                      <Thermometer size={16} className="text-amber-500" /> Temperature
                    </div>
                    <div className="text-4xl font-bold text-gray-900">
                      {selectedRack.temp.toFixed(1)} <span className="text-lg text-gray-500 font-normal">°C</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Setpoint Target: {profile.targetTemp}°C
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <div className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1.5 mb-2">
                      <Activity size={16} className="text-purple-500" /> Compute Workload
                    </div>
                    <div className="text-4xl font-bold text-gray-900">
                      {selectedRack.workload.toFixed(0)} <span className="text-lg text-gray-500 font-normal">%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${selectedRack.workload}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1.5">
                      <Zap size={16} className="text-blue-500" /> Cooling Power Draw
                    </div>
                    <span className="text-sm font-bold text-blue-700">
                      {selectedRack.coolingPower.toFixed(1)}% Capacity
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${selectedRack.coolingPower}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-gray-400 mt-2">
                    Dynamic control adjusts based on workload heat generation and ambient temperature.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PHASE 2 — Multi-Factor Predictor & Feasibility Engine              */
/* ------------------------------------------------------------------ */
const ADVISOR_METHODS = {
  // === Basic Technologies ===
  crac: {
    label: "1. CRAC (Refrigerant DX Air)",
    category: "Basic",
    pue: 1.65,
    wue: 1.8,
    capexCost: 1, // lowest capex
    requiredSkills: "basic",
    infrastructureAffinity: ["none", "crac"],
    waterReq: "none", // needs 0 water
    spaceReq: "moderate",
    roomType: ["raised_floor", "standard"],
    outdoorSuitability: ["all"],
    powerImpact: "high", // high electricity consumption
    bmsComplexity: "basic",
    summary: "Lowest initial capital cost. Ideal for legacy small/medium rooms with existing DX units, standard floors, and basic in-house facility staff."
  },
  crah: {
    label: "2. CRAH (Chilled-Water Air)",
    category: "Basic",
    pue: 1.45,
    wue: 1.5,
    capexCost: 2,
    requiredSkills: "hvac",
    infrastructureAffinity: ["crah", "liquid_ready"],
    waterReq: "chilled_water",
    spaceReq: "moderate",
    roomType: ["raised_floor", "high_bay"],
    outdoorSuitability: ["temperate", "cold_dry", "hot_humid"],
    powerImpact: "moderate",
    bmsComplexity: "bms",
    summary: "Cost-effective if central chiller plant exists. Requires HVAC technician skills and access to chilled water piping loops."
  },
  economizer: {
    label: "3. Air/Water-Side Economizer",
    category: "Basic",
    pue: 1.25,
    wue: 0.9,
    capexCost: 2,
    requiredSkills: "hvac",
    infrastructureAffinity: ["economizer", "crah", "none"],
    waterReq: "optional",
    spaceReq: "ample",
    roomType: ["high_bay", "raised_floor"],
    outdoorSuitability: ["cold_dry", "temperate"],
    powerImpact: "very_low",
    bmsComplexity: "bms",
    summary: "Drastically cuts electricity bills in cool/dry climates using outside free air. Not viable in consistently hot/humid outdoor conditions."
  },
  rdhx: {
    label: "4. Rear-Door Heat Exchanger (RDHx)",
    category: "Basic",
    pue: 1.35,
    wue: 1.1,
    capexCost: 3,
    requiredSkills: "hvac",
    infrastructureAffinity: ["crah", "liquid_ready", "crac"],
    waterReq: "chilled_water",
    spaceReq: "tight",
    roomType: ["low_ceiling", "raised_floor", "standard"],
    outdoorSuitability: ["all"],
    powerImpact: "low",
    bmsComplexity: "bms",
    summary: "Neutralizes heat directly at the back door of racks. Perfect for tight whitespace and low ceiling heights without requiring raised floors."
  },
  d2c: {
    label: "5. Direct-to-Chip Liquid Cooling",
    category: "Basic",
    pue: 1.18,
    wue: 0.6,
    capexCost: 4,
    requiredSkills: "specialized",
    infrastructureAffinity: ["liquid_ready", "crah"],
    waterReq: "closed_coolant",
    spaceReq: "tight",
    roomType: ["all"],
    outdoorSuitability: ["all"],
    powerImpact: "very_low",
    bmsComplexity: "ai_adaptive",
    summary: "High plumbing investment, but essential for AI chips exceeding 400W TDP. Unlocks maximum compute density in compact spaces."
  },
  immersion_1p: {
    label: "6. Single-Phase Immersion Cooling",
    category: "Basic",
    pue: 1.12,
    wue: 0.2,
    capexCost: 4,
    requiredSkills: "specialized",
    infrastructureAffinity: ["none", "liquid_ready"],
    waterReq: "none",
    spaceReq: "tight",
    roomType: ["slab_floor", "high_bay"],
    outdoorSuitability: ["all"],
    powerImpact: "very_low",
    bmsComplexity: "bms",
    summary: "Eliminates room air chillers by submerging chassis into hydrocarbon dielectric bath. Requires heavy slab floor loading and specialized fluid maintenance."
  },
  immersion_2p: {
    label: "7. Two-Phase Immersion Cooling",
    category: "Basic",
    pue: 1.05,
    wue: 0.1,
    capexCost: 5,
    requiredSkills: "specialized",
    infrastructureAffinity: ["none", "liquid_ready"],
    waterReq: "none",
    spaceReq: "tight",
    roomType: ["slab_floor", "high_bay"],
    outdoorSuitability: ["all"],
    powerImpact: "minimal",
    bmsComplexity: "ai_adaptive",
    summary: "Premium capital investment with phase-changing dielectric fluids. The pinnacle of thermal density and lowest possible PUE for extreme supercomputing."
  },

  // === Hybrid Upgrades ===
  h1: {
    label: "H1: CRAC + Aisle Containment + Adaptive Controls",
    category: "Hybrid",
    pue: 1.42,
    wue: 1.5,
    capexCost: 2,
    requiredSkills: "basic",
    infrastructureAffinity: ["crac"],
    waterReq: "none",
    spaceReq: "moderate",
    roomType: ["raised_floor", "standard"],
    outdoorSuitability: ["all"],
    powerImpact: "moderate",
    bmsComplexity: "bms",
    summary: "The highest ROI retrofit for existing CRAC rooms. Adds physical aisle containment curtains and variable fan control without replacing core machinery."
  },
  h2: {
    label: "H2: CRAH + Aisle Containment + Variable-Flow",
    category: "Hybrid",
    pue: 1.32,
    wue: 1.2,
    capexCost: 3,
    requiredSkills: "hvac",
    infrastructureAffinity: ["crah"],
    waterReq: "chilled_water",
    spaceReq: "moderate",
    roomType: ["raised_floor", "high_bay"],
    outdoorSuitability: ["all"],
    powerImpact: "low",
    bmsComplexity: "ai_adaptive",
    summary: "Ideal upgrade for existing CRAH facilities. Balances chilled-water valve modulation with aisle containment to avoid fan and pumping waste."
  },
  h3: {
    label: "H3: Air Cooling + Economizer + Mechanical Backup",
    category: "Hybrid",
    pue: 1.22,
    wue: 0.8,
    capexCost: 3,
    requiredSkills: "hvac",
    infrastructureAffinity: ["economizer", "crac", "crah"],
    waterReq: "optional",
    spaceReq: "ample",
    roomType: ["high_bay", "raised_floor"],
    outdoorSuitability: ["cold_dry", "temperate"],
    powerImpact: "very_low",
    bmsComplexity: "bms",
    summary: "Combines weather-dependent free cooling with an automatic DX backup loop. Keeps OPEX minimal while ensuring 100% operational uptime."
  },
  h4: {
    label: "H4: Air Cooling + Rear-Door Heat Exchangers",
    category: "Hybrid",
    pue: 1.28,
    wue: 0.8,
    capexCost: 3,
    requiredSkills: "hvac",
    infrastructureAffinity: ["crac", "crah"],
    waterReq: "chilled_water",
    spaceReq: "tight",
    roomType: ["low_ceiling", "standard", "raised_floor"],
    outdoorSuitability: ["all"],
    powerImpact: "low",
    bmsComplexity: "bms",
    summary: "Highly practical hybrid: retains existing room air cooling for 80% standard racks while deploying RDHx on isolated hot high-density rows."
  },
  h5: {
    label: "H5: Air Cooling + Direct-to-Chip Liquid Cooling",
    category: "Hybrid",
    pue: 1.15,
    wue: 0.5,
    capexCost: 4,
    requiredSkills: "specialized",
    infrastructureAffinity: ["liquid_ready", "crah", "crac"],
    waterReq: "closed_coolant",
    spaceReq: "moderate",
    roomType: ["all"],
    outdoorSuitability: ["all"],
    powerImpact: "very_low",
    bmsComplexity: "ai_adaptive",
    summary: "The definitive AI enterprise hybrid. Retains perimeter room air for low-power memory/storage while pumping closed liquid loops directly over GPUs."
  },
};

/* ------------------------------------------------------------------ */
/*  Predictor Scoring Algorithm based on the 9 Parameters             */
/* ------------------------------------------------------------------ */
function computeStrategyPrediction(params) {
  const {
    infrastructure, // none, crac, crah, economizer, liquid_ready
    electricity,    // cheap_abundant, moderate, constrained_high_cost
    waterCoolant,   // scarce, limited, abundant_chilled, closed_dielectric
    outdoor,        // cold_dry, temperate, hot_humid, extreme
    space,          // tight, moderate, ample
    maintenance,    // basic, hvac, specialized
    monitoring,     // basic, bms, ai_adaptive
    budget,         // minimal, moderate, high
    roomDimension   // raised_floor, low_ceiling, slab_floor, high_bay
  } = params;

  return Object.entries(ADVISOR_METHODS).map(([key, method]) => {
    let score = 50; // base score

    // 1. Existing Cooling Infrastructure Matching
    if (method.infrastructureAffinity.includes(infrastructure)) {
      if (infrastructure !== "none") score += 24; // strong reuse of existing investment!
      else score += 10;
    } else {
      score -= 14; // penalty for having to rip-and-replace
    }

    // 2. Electricity Constraint vs Power Consumption
    if (electricity === "constrained_high_cost") {
      // Must reward low PUE / low power draw
      if (method.powerImpact === "very_low" || method.powerImpact === "minimal") score += 18;
      else if (method.powerImpact === "high") score -= 22; // pure CRAC is punished heavily
    } else if (electricity === "cheap_abundant") {
      // High electricity availability lowers penalty on air systems
      if (method.powerImpact === "high") score += 8;
    }

    // 3. Water / Coolant Availability
    if (waterCoolant === "scarce") {
      if (method.waterReq === "none") score += 16;
      else if (method.waterReq === "chilled_water") score -= 25; // impossible without water
    } else if (waterCoolant === "abundant_chilled") {
      if (method.waterReq === "chilled_water") score += 14;
    } else if (waterCoolant === "closed_dielectric") {
      if (method.waterReq === "closed_coolant" || method.waterReq === "none") score += 14;
    }

    // 4. Outdoor Conditions (Climate)
    if (outdoor === "cold_dry") {
      if (key === "economizer" || key === "h3") score += 26; // free cooling goldmine
    } else if (outdoor === "hot_humid" || outdoor === "extreme") {
      if (key === "economizer" || key === "h3") score -= 28; // economizer cannot work
    }

    // 5. Installation Space Constraints
    if (space === "tight") {
      if (method.spaceReq === "tight") score += 14;
      else if (method.spaceReq === "ample") score -= 18;
    } else if (space === "ample") {
      if (method.spaceReq === "ample") score += 8;
    }

    // 6. Maintenance Support / Skills
    if (maintenance === "basic") {
      if (method.requiredSkills === "basic") score += 16;
      else if (method.requiredSkills === "specialized") score -= 24; // skills mismatch!
    } else if (maintenance === "specialized") {
      if (method.requiredSkills === "specialized") score += 16;
    }

    // 7. Monitoring & Controls Maturity
    if (monitoring === "basic") {
      if (method.bmsComplexity === "basic") score += 12;
      else if (method.bmsComplexity === "ai_adaptive") score -= 16; // cannot run adaptive loop without sensors
    } else if (monitoring === "ai_adaptive") {
      if (method.bmsComplexity === "ai_adaptive") score += 15;
    }

    // 8. Affordable Budget (CAPEX)
    if (budget === "minimal") {
      if (method.capexCost === 1) score += 26; // single basic cheap tech
      else if (method.capexCost === 2) score += 14;
      else if (method.capexCost >= 4) score -= 30; // unaffordable
    } else if (budget === "moderate") {
      if (method.capexCost === 2 || method.capexCost === 3) score += 18; // sweet spot for hybrid retrofits
      else if (method.capexCost === 5) score -= 18;
    } else if (budget === "high") {
      if (method.capexCost >= 3) score += 14; // investment available for liquid/immersion
    }

    // 9. Room Dimension & Ceiling/Floor Type
    if (method.roomType.includes(roomDimension) || method.roomType.includes("all")) {
      score += 10;
    } else {
      score -= 15; // physical architectural barrier (e.g., no raised floor for underfloor CRAC)
    }

    // Normalizing clamp between 12 and 98
    const finalScore = Math.min(98, Math.max(12, Math.round(score)));
    return {
      key,
      ...method,
      score: finalScore
    };
  }).sort((a, b) => b.score - a.score);
}

function Phase2() {
  const [params, setParams] = useState({
    infrastructure: "crac",
    electricity: "moderate",
    waterCoolant: "limited",
    outdoor: "temperate",
    space: "moderate",
    maintenance: "basic",
    monitoring: "bms",
    budget: "minimal",
    roomDimension: "raised_floor",
  });

  const results = useMemo(() => computeStrategyPrediction(params), [params]);
  const top = results[0];

  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const selectStyle = "w-full border border-gray-300 bg-white text-gray-800 text-xs rounded-md px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm";

  return (
    <div className="space-y-6">
      {/* Overview Intro */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Sliders size={18} className="text-blue-600" /> Multi-Factor Feasibility &amp; Cooling Predictor
        </h3>
        <p className="text-gray-500 text-xs">
          Input your organization's 9 real-world constraints below. The engine evaluates what you already own, 
          infrastructure availability, floor dimensions, and affordable budget to rank the most practical cooling strategy.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Form Inputs: 9 Decision Parameters */}
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
            9 Organizational &amp; Physical Parameters
          </h4>

          {/* 1. Existing Cooling Infrastructure */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Building2 size={13} className="text-blue-600" /> 1. Existing Cooling Infrastructure
            </label>
            <select
              className={selectStyle}
              value={params.infrastructure}
              onChange={(e) => updateParam("infrastructure", e.target.value)}
            >
              <option value="none">Greenfield / None (Starting Fresh)</option>
              <option value="crac">Existing CRAC (Refrigerant DX Air Units)</option>
              <option value="crah">Existing CRAH (Central Chilled-Water Loop)</option>
              <option value="economizer">Existing Economizer (Air Ducts / Free Cooling)</option>
              <option value="liquid_ready">Liquid-Ready (CDU / Plumbing Manifolds)</option>
            </select>
          </div>

          {/* 2. Electricity Availability & Cost */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Zap size={13} className="text-amber-500" /> 2. Electricity &amp; Power Grid
            </label>
            <select
              className={selectStyle}
              value={params.electricity}
              onChange={(e) => updateParam("electricity", e.target.value)}
            >
              <option value="cheap_abundant">Abundant Capacity / Low Electricity Cost</option>
              <option value="moderate">Moderate Grid Capacity (Standard Tariff)</option>
              <option value="constrained_high_cost">Constrained Power / High Electricity Cost</option>
            </select>
          </div>

          {/* 3. Water or Coolant Availability */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Droplets size={13} className="text-cyan-500" /> 3. Water or Coolant Availability
            </label>
            <select
              className={selectStyle}
              value={params.waterCoolant}
              onChange={(e) => updateParam("waterCoolant", e.target.value)}
            >
              <option value="scarce">Scarce / Zero Water Access (Air/Dielectric Only)</option>
              <option value="limited">Limited Water (Evaporative Restrictions)</option>
              <option value="abundant_chilled">Abundant Water / Chiller Towers Permitted</option>
              <option value="closed_dielectric">Closed-Loop Dielectric Coolant Allowed</option>
            </select>
          </div>

          {/* 4. Outdoor Conditions */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <CloudSun size={13} className="text-orange-500" /> 4. Outdoor Conditions (Climate)
            </label>
            <select
              className={selectStyle}
              value={params.outdoor}
              onChange={(e) => updateParam("outdoor", e.target.value)}
            >
              <option value="cold_dry">Cool &amp; Dry (Ideal for Free-Cooling Economizers)</option>
              <option value="temperate">Moderate / Temperate (Seasonal Free Cooling)</option>
              <option value="hot_humid">Hot &amp; Humid (Free Air Ineffective)</option>
              <option value="extreme">Extreme Heat / Desert Environment</option>
            </select>
          </div>

          {/* 5. Installation Space */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Maximize2 size={13} className="text-purple-500" /> 5. Installation Space (Whitespace)
            </label>
            <select
              className={selectStyle}
              value={params.space}
              onChange={(e) => updateParam("space", e.target.value)}
            >
              <option value="tight">Tight Footprint (Needs High kW Density per m²)</option>
              <option value="moderate">Moderate Whitespace (Standard Row Spacing)</option>
              <option value="ample">Ample Whitespace (Expansive Floor Plan)</option>
            </select>
          </div>

          {/* 6. Maintenance Support */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Wrench size={13} className="text-gray-600" /> 6. Maintenance Support (Facility Skill)
            </label>
            <select
              className={selectStyle}
              value={params.maintenance}
              onChange={(e) => updateParam("maintenance", e.target.value)}
            >
              <option value="basic">In-House General IT / Facility Staff</option>
              <option value="hvac">Contracted Certified HVAC / Chiller Techs</option>
              <option value="specialized">Specialized Liquid &amp; Chemical Handling Certified</option>
            </select>
          </div>

          {/* 7. Monitoring and Controls */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Sliders size={13} className="text-indigo-500" /> 7. Monitoring &amp; Controls Maturity
            </label>
            <select
              className={selectStyle}
              value={params.monitoring}
              onChange={(e) => updateParam("monitoring", e.target.value)}
            >
              <option value="basic">Basic Manual / Standalone Thermostats</option>
              <option value="bms">Standard Centralized BMS Automation</option>
              <option value="ai_adaptive">Advanced Sensor Telemetry &amp; Adaptive AI Controls</option>
            </select>
          </div>

          {/* 8. Affordable Budget */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <DollarSign size={13} className="text-green-600" /> 8. Affordable Budget (CAPEX Capacity)
            </label>
            <select
              className={selectStyle}
              value={params.budget}
              onChange={(e) => updateParam("budget", e.target.value)}
            >
              <option value="minimal">Strict Minimal Budget (Prioritize Existing Assets / Basic Tech)</option>
              <option value="moderate">Moderate Budget (Affordable Hybrid Upgrade / Retrofits)</option>
              <option value="high">High Budget (Open to Liquid Manifolds or Immersion Tanks)</option>
            </select>
          </div>

          {/* 9. Room Dimension */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
              <Server size={13} className="text-blue-500" /> 9. Room Dimension &amp; Floor Type
            </label>
            <select
              className={selectStyle}
              value={params.roomDimension}
              onChange={(e) => updateParam("roomDimension", e.target.value)}
            >
              <option value="raised_floor">Standard Raised-Floor (12-14ft ceiling)</option>
              <option value="low_ceiling">Low Ceiling &amp; Hard Floor (No underfloor plenum)</option>
              <option value="slab_floor">Heavy Industrial Solid Slab Floor (Immersion Capable)</option>
              <option value="high_bay">High-Bay Data Hall (&gt;16ft ceiling with containment)</option>
            </select>
          </div>
        </div>

        {/* Prediction Output & Ranked Alternatives */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Recommendation Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={14} className="text-blue-600" /> Top Feasible Strategy
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                top.category === "Basic"
                  ? "bg-white text-gray-700 border-gray-300"
                  : "bg-blue-600 text-white border-blue-600"
              }`}>
                {top.category} Approach
              </span>
            </div>

            <div className="text-2xl font-bold text-gray-900 mb-2">
              {top.label} <span className="text-blue-600 font-semibold text-xl">({top.score}% Feasibility Match)</span>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              {top.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium text-gray-600">
              <div className="bg-white p-2 rounded border border-gray-200 text-center">
                <span className="text-[10px] text-gray-400 block uppercase">PUE</span>
                <span className="font-bold text-gray-900 text-sm">{top.pue}</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200 text-center">
                <span className="text-[10px] text-gray-400 block uppercase">WUE</span>
                <span className="font-bold text-gray-900 text-sm">{top.wue} L/kWh</span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200 text-center">
                <span className="text-[10px] text-gray-400 block uppercase">CAPEX</span>
                <span className="font-bold text-gray-900 text-sm">
                  {["Lowest", "Moderate", "Medium-High", "High", "Very High"][top.capexCost - 1]}
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-gray-200 text-center">
                <span className="text-[10px] text-gray-400 block uppercase">Staff Skill</span>
                <span className="font-bold text-gray-900 text-sm capitalize">{top.requiredSkills}</span>
              </div>
            </div>
          </div>

          {/* Ranking across all 12 options */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Ranked Feasibility Across All 12 Strategies
              </h4>
              <span className="text-[11px] text-gray-400">Scored based on 9 organizational inputs</span>
            </div>

            <div className="space-y-3">
              {results.map((r, idx) => (
                <div key={r.key} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-400 w-4 text-right">#{idx + 1}</span>
                  <div className="w-64 text-xs font-medium text-gray-800 flex items-center gap-1.5 truncate" title={r.label}>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${
                      r.category === "Basic"
                        ? "bg-gray-100 text-gray-600 border-gray-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}>
                      {r.category === "Basic" ? "Basic" : "Hybrid"}
                    </span>
                    <span className="truncate">{r.label}</span>
                  </div>

                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        idx === 0 
                          ? "bg-blue-600" 
                          : r.category === "Basic" 
                            ? "bg-slate-400" 
                            : "bg-indigo-400"
                      }`}
                      style={{ width: `${r.score}%` }}
                    />
                  </div>

                  <span className="w-10 text-right text-xs font-bold text-gray-900">{r.score}%</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded bg-slate-400" /> Basic Technology
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded bg-indigo-400" /> Hybrid Upgrade
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2.5 h-2.5 rounded bg-blue-600" /> Top Predicted Match
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root Component                                                     */
/* ------------------------------------------------------------------ */
export default function App() {
  const [tab, setTab] = useState("phase2");

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-600 p-2.5 rounded-lg text-white shadow-sm">
            <Snowflake size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI Data Center Cooling Optimizer</h1>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Compare foundational single-technology cooling systems against hybrid upgrades with economic and thermal evaluation.
        </p>

        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-[1px]">
          {[
            { key: "phase1", label: "Phase 1: Live Rack Monitoring" },
            { key: "phase2", label: "Phase 2: Feasibility & Strategy Predictor" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-6 py-3 rounded-t-lg text-sm font-semibold transition-colors ${
                tab === t.key 
                  ? "bg-white border-t border-l border-r border-gray-200 text-blue-700 shadow-[0_-2px_4px_rgba(0,0,0,0.02)] mb-[-1px]" 
                  : "text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 border-t border-l border-r border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "phase1" ? <Phase1 /> : <Phase2 />}
      </div>
    </div>
  );
}
