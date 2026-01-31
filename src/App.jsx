import React, { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";

const FUEL_LB_PER_GAL = 6;
const FUEL_BURN_GAL_PER_HR = 11;
const ARM_MIN = 82;
const ARM_MAX = 93;

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const isArmOutOfRange = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 && (num < ARM_MIN || num > ARM_MAX);
};

const armClassName = (value) =>
  isArmOutOfRange(value) ? "text-rose-600" : "text-slate-900";

function calculateHeadCrossWind(windDir, windSpeed, runwayDir) {
  if (windDir == null || windSpeed == null || runwayDir == null) {
    return { headwind: "0.0", crosswind: "0.0", crosswindDir: "—" };
  }
  const diff = (windDir - runwayDir + 360) % 360;
  const angleDiff = diff > 180 ? 360 - diff : diff;
  const rad = (angleDiff * Math.PI) / 180;
  const headwind = windSpeed * Math.cos(rad);
  const crosswind = Math.abs(windSpeed * Math.sin(rad));
  let crosswindDir = "Center";
  if (angleDiff !== 0 && angleDiff !== 180) {
    crosswindDir = diff > 0 && diff < 180 ? "Right" : "Left";
  }
  return {
    headwind: headwind.toFixed(1),
    crosswind: crosswind.toFixed(1),
    crosswindDir,
  };
}

function calculatePressureAlt(elevation, altimeter) {
  if (!elevation || !altimeter) return 0;
  return elevation + (29.92 - altimeter) * 1000;
}

function calculateISATemp(pressureAlt) {
  return 15 + pressureAlt * -0.002;
}

function calculateDensityAlt(pressureAlt, temp, isaTemp) {
  return pressureAlt + (temp - isaTemp) * 120;
}

const formatFormulaValue = (value, digits = 0) => {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "—";
  return num.toFixed(digits);
};

const formatPressureAltFormula = (label, elevation, altimeter, result) => {
  const elev = formatFormulaValue(elevation, 0);
  const alt = formatFormulaValue(altimeter, 2);
  const res = formatFormulaValue(result, 0);
  if (elev === "—" || alt === "—") {
    return `${label}: Enter elevation + altimeter`;
  }
  return `${label}: ${elev} + (29.92 - ${alt}) * 1000 = ${res} ft`;
};

const formatISATempFormula = (label, pressureAlt, result) => {
  const pAlt = formatFormulaValue(pressureAlt, 0);
  const res = formatFormulaValue(result, 1);
  if (pAlt === "—") {
    return `${label}: Enter pressure altitude`;
  }
  return `${label}: 15 + ${pAlt} * (-2/1000) = ${res} °C`;
};

const formatDensityAltFormula = (label, pressureAlt, temp, isaTemp, result) => {
  const pAlt = formatFormulaValue(pressureAlt, 0);
  const t = formatFormulaValue(temp, 1);
  const isa = formatFormulaValue(isaTemp, 1);
  const res = formatFormulaValue(result, 0);
  if (pAlt === "—" || t === "—" || isa === "—") {
    return `${label}: Enter pressure alt + temp`;
  }
  return `${label}: ${pAlt} + (${t} - ${isa}) * 120 = ${res} ft`;
};

function App() {
  const exportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  // Weight & Balance States
  const [basicWeight, setBasicWeight] = useState("");
  const [basicArm, setBasicArm] = useState("");
  const [basicMomentInput, setBasicMomentInput] = useState("");
  const [basicLastEdited, setBasicLastEdited] = useState(null);
  const [pilotFrontWeight, setPilotFrontWeight] = useState("");
  const [rearPaxWeight, setRearPaxWeight] = useState("");
  const [fuelGal, setFuelGal] = useState("");
  const [baggageWeight, setBaggageWeight] = useState("");
  const [fuelAllowanceGal, setFuelAllowanceGal] = useState("");
  const [fuelBurnHr, setFuelBurnHr] = useState("");
  const [fuelBurnGal, setFuelBurnGal] = useState("");
  const [fuelBurnSource, setFuelBurnSource] = useState("hr");

  // Performance States
  const [departICAO, setDepartICAO] = useState("");
  const [arriveICAO, setArriveICAO] = useState("");
  const [departTemp, setDepartTemp] = useState("");
  const [arriveTemp, setArriveTemp] = useState("");
  const [departAltimeter, setDepartAltimeter] = useState("");
  const [arriveAltimeter, setArriveAltimeter] = useState("");
  const [departWindDir, setDepartWindDir] = useState("");
  const [departWindSpeed, setDepartWindSpeed] = useState("");
  const [arriveWindDir, setArriveWindDir] = useState("");
  const [arriveWindSpeed, setArriveWindSpeed] = useState("");
  const [departElevation, setDepartElevation] = useState("");
  const [arriveElevation, setArriveElevation] = useState("");
  const [departRunwayDir, setDepartRunwayDir] = useState("");
  const [arriveRunwayDir, setArriveRunwayDir] = useState("");

  // Basic empty weight: fill any two of three fields
  useEffect(() => {
    if (!basicLastEdited) return;
    const weight = toNumber(basicWeight);
    const arm = toNumber(basicArm);
    const moment = toNumber(basicMomentInput);

    if (!weight) return;

    if (basicLastEdited === "moment" && moment) {
      const nextArm = moment / weight;
      if (Number.isFinite(nextArm)) {
        setBasicArm(nextArm ? nextArm.toFixed(2) : "");
      }
    }

    if (basicLastEdited === "arm" && arm) {
      const nextMoment = weight * arm;
      if (Number.isFinite(nextMoment)) {
        setBasicMomentInput(nextMoment ? nextMoment.toFixed(2) : "");
      }
    }

    if (basicLastEdited === "weight") {
      if (basicArm) {
        const nextMoment = weight * arm;
        if (Number.isFinite(nextMoment)) {
          setBasicMomentInput(nextMoment ? nextMoment.toFixed(2) : "");
        }
      } else if (basicMomentInput) {
        const nextArm = moment / weight;
        if (Number.isFinite(nextArm)) {
          setBasicArm(nextArm ? nextArm.toFixed(2) : "");
        }
      }
    }
  }, [basicWeight, basicArm, basicMomentInput, basicLastEdited]);

  // Sync fuel burn inputs (Remark A)
  useEffect(() => {
    if (fuelBurnSource !== "hr") return;
    const hrValue = toNumber(fuelBurnHr);
    if (!hrValue) {
      setFuelBurnGal("");
      return;
    }
    const gal = hrValue * FUEL_BURN_GAL_PER_HR;
    setFuelBurnGal(gal.toFixed(2));
  }, [fuelBurnHr, fuelBurnSource]);

  useEffect(() => {
    if (fuelBurnSource !== "gal") return;
    const galValue = toNumber(fuelBurnGal);
    if (!galValue) {
      setFuelBurnHr("");
      return;
    }
    const hr = galValue / FUEL_BURN_GAL_PER_HR;
    setFuelBurnHr(hr.toFixed(2));
  }, [fuelBurnGal, fuelBurnSource]);

  // Numeric values
  const basicWeightNum = useMemo(() => toNumber(basicWeight), [basicWeight]);
  const basicArmNum = useMemo(() => toNumber(basicArm), [basicArm]);
  const basicMomentNum = useMemo(
    () => toNumber(basicMomentInput),
    [basicMomentInput],
  );
  const pilotFrontWeightNum = useMemo(
    () => toNumber(pilotFrontWeight),
    [pilotFrontWeight],
  );
  const rearPaxWeightNum = useMemo(
    () => toNumber(rearPaxWeight),
    [rearPaxWeight],
  );
  const baggageWeightNum = useMemo(
    () => toNumber(baggageWeight),
    [baggageWeight],
  );

  // Calculations
  const basicMoment = useMemo(() => {
    if (basicWeightNum && basicArmNum) return basicWeightNum * basicArmNum;
    if (basicWeightNum && basicMomentNum) return basicMomentNum;
    return 0;
  }, [basicWeightNum, basicArmNum, basicMomentNum]);
  const pilotFrontMoment = useMemo(
    () => pilotFrontWeightNum * 80.5,
    [pilotFrontWeightNum],
  );
  const rearPaxMoment = useMemo(
    () => rearPaxWeightNum * 118.1,
    [rearPaxWeightNum],
  );
  const fuelWeight = useMemo(
    () => toNumber(fuelGal) * FUEL_LB_PER_GAL,
    [fuelGal],
  );
  const fuelMoment = useMemo(() => fuelWeight * 95, [fuelWeight]);
  const baggageMoment = useMemo(
    () => baggageWeightNum * 142.8,
    [baggageWeightNum],
  );

  const rampWeight = useMemo(() => {
    return (
      basicWeightNum +
      pilotFrontWeightNum +
      rearPaxWeightNum +
      fuelWeight +
      baggageWeightNum
    );
  }, [
    basicWeightNum,
    pilotFrontWeightNum,
    rearPaxWeightNum,
    fuelWeight,
    baggageWeightNum,
  ]);

  const rampMoment = useMemo(
    () =>
      basicMoment +
      pilotFrontMoment +
      rearPaxMoment +
      fuelMoment +
      baggageMoment,
    [basicMoment, pilotFrontMoment, rearPaxMoment, fuelMoment, baggageMoment],
  );

  const rampArmValue = useMemo(
    () => rampMoment / rampWeight || 0,
    [rampMoment, rampWeight],
  );
  const rampArm = useMemo(() => rampArmValue.toFixed(2), [rampArmValue]);

  const fuelAllowanceWeight = useMemo(
    () => toNumber(fuelAllowanceGal) * FUEL_LB_PER_GAL,
    [fuelAllowanceGal],
  );
  const fuelAllowanceMoment = useMemo(
    () => fuelAllowanceWeight * 95,
    [fuelAllowanceWeight],
  );

  const takeoffWeight = useMemo(
    () => rampWeight - fuelAllowanceWeight,
    [rampWeight, fuelAllowanceWeight],
  );
  const takeoffMoment = useMemo(
    () => rampMoment - fuelAllowanceMoment,
    [rampMoment, fuelAllowanceMoment],
  );
  const takeoffArmValue = useMemo(
    () => takeoffMoment / takeoffWeight || 0,
    [takeoffMoment, takeoffWeight],
  );
  const takeoffArm = useMemo(
    () => takeoffArmValue.toFixed(2),
    [takeoffArmValue],
  );

  const fuelBurnWeight = useMemo(
    () => toNumber(fuelBurnGal) * FUEL_LB_PER_GAL,
    [fuelBurnGal],
  );
  const fuelBurnMoment = useMemo(() => fuelBurnWeight * 95, [fuelBurnWeight]);

  const landingWeight = useMemo(
    () => takeoffWeight - fuelBurnWeight,
    [takeoffWeight, fuelBurnWeight],
  );
  const landingMoment = useMemo(
    () => takeoffMoment - fuelBurnMoment,
    [takeoffMoment, fuelBurnMoment],
  );
  const landingArmValue = useMemo(
    () => landingMoment / landingWeight || 0,
    [landingMoment, landingWeight],
  );
  const landingArm = useMemo(
    () => landingArmValue.toFixed(2),
    [landingArmValue],
  );

  // Performance Calculations
  const departPressureAlt = useMemo(
    () =>
      calculatePressureAlt(
        toNumber(departElevation),
        toNumber(departAltimeter),
      ),
    [departElevation, departAltimeter],
  );
  const departISATemp = useMemo(
    () => calculateISATemp(departPressureAlt),
    [departPressureAlt],
  );
  const departDensityAlt = useMemo(
    () =>
      calculateDensityAlt(
        departPressureAlt,
        toNumber(departTemp),
        departISATemp,
      ),
    [departPressureAlt, departTemp, departISATemp],
  );
  const departRunwayDeg = useMemo(() => {
    const runway = parseInt(departRunwayDir, 10);
    return Number.isFinite(runway) ? runway * 10 : null;
  }, [departRunwayDir]);
  const departWinds = useMemo(
    () =>
      calculateHeadCrossWind(
        toNumber(departWindDir) || null,
        toNumber(departWindSpeed) || null,
        departRunwayDeg,
      ),
    [departWindDir, departWindSpeed, departRunwayDeg],
  );

  const arrivePressureAlt = useMemo(
    () =>
      calculatePressureAlt(
        toNumber(arriveElevation),
        toNumber(arriveAltimeter),
      ),
    [arriveElevation, arriveAltimeter],
  );
  const arriveISATemp = useMemo(
    () => calculateISATemp(arrivePressureAlt),
    [arrivePressureAlt],
  );
  const arriveDensityAlt = useMemo(
    () =>
      calculateDensityAlt(
        arrivePressureAlt,
        toNumber(arriveTemp),
        arriveISATemp,
      ),
    [arrivePressureAlt, arriveTemp, arriveISATemp],
  );

  const pressureAltFormulaText = useMemo(() => {
    return [
      formatPressureAltFormula(
        "Depart",
        departElevation,
        departAltimeter,
        departPressureAlt,
      ),
      formatPressureAltFormula(
        "Arrive",
        arriveElevation,
        arriveAltimeter,
        arrivePressureAlt,
      ),
    ].join("\n");
  }, [
    departElevation,
    departAltimeter,
    departPressureAlt,
    arriveElevation,
    arriveAltimeter,
    arrivePressureAlt,
  ]);

  const isaTempFormulaText = useMemo(() => {
    return [
      formatISATempFormula("Depart", departPressureAlt, departISATemp),
      formatISATempFormula("Arrive", arrivePressureAlt, arriveISATemp),
    ].join("\n");
  }, [departPressureAlt, departISATemp, arrivePressureAlt, arriveISATemp]);

  const densityAltFormulaText = useMemo(() => {
    return [
      formatDensityAltFormula(
        "Depart",
        departPressureAlt,
        departTemp,
        departISATemp,
        departDensityAlt,
      ),
      formatDensityAltFormula(
        "Arrive",
        arrivePressureAlt,
        arriveTemp,
        arriveISATemp,
        arriveDensityAlt,
      ),
    ].join("\n");
  }, [
    departPressureAlt,
    departTemp,
    departISATemp,
    departDensityAlt,
    arrivePressureAlt,
    arriveTemp,
    arriveISATemp,
    arriveDensityAlt,
  ]);
  const arriveRunwayDeg = useMemo(() => {
    const runway = parseInt(arriveRunwayDir, 10);
    return Number.isFinite(runway) ? runway * 10 : null;
  }, [arriveRunwayDir]);
  const arriveWinds = useMemo(
    () =>
      calculateHeadCrossWind(
        toNumber(arriveWindDir) || null,
        toNumber(arriveWindSpeed) || null,
        arriveRunwayDeg,
      ),
    [arriveWindDir, arriveWindSpeed, arriveRunwayDeg],
  );

  const clearAll = () => {
    setBasicWeight("");
    setBasicArm("");
    setBasicMomentInput("");
    setBasicLastEdited(null);
    setPilotFrontWeight("");
    setRearPaxWeight("");
    setFuelGal("");
    setBaggageWeight("");
    setFuelAllowanceGal("");
    setFuelBurnHr("");
    setFuelBurnGal("");
    setFuelBurnSource("hr");
    setDepartICAO("");
    setArriveICAO("");
    setDepartTemp("");
    setArriveTemp("");
    setDepartAltimeter("");
    setArriveAltimeter("");
    setDepartWindDir("");
    setDepartWindSpeed("");
    setArriveWindDir("");
    setArriveWindSpeed("");
    setDepartElevation("");
    setArriveElevation("");
    setDepartRunwayDir("");
    setArriveRunwayDir("");
  };

  const handleExportPhoto = async () => {
    if (!exportRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: "#f8fafc",
        scale: 2,
        useCORS: true,
        onclone: (doc) => {
          const view = doc.defaultView;
          doc.querySelectorAll("input, textarea").forEach((el) => {
            const value = el.value ?? "";
            const placeholder = el.getAttribute("placeholder") ?? "";
            const displayValue = value || placeholder;
            if (!view) {
              el.setAttribute("value", displayValue);
              return;
            }

            const style = view.getComputedStyle(el);
            const replacement = doc.createElement("div");
            replacement.textContent = displayValue;
            replacement.style.boxSizing = "border-box";
            replacement.style.width = style.width;
            replacement.style.height = style.height;
            replacement.style.border = style.border;
            replacement.style.borderRadius = style.borderRadius;
            replacement.style.padding = style.padding;
            replacement.style.fontFamily = style.fontFamily;
            replacement.style.fontSize = style.fontSize;
            replacement.style.fontWeight = style.fontWeight;
            replacement.style.lineHeight = style.lineHeight;
            replacement.style.color = style.color;
            replacement.style.backgroundColor = style.backgroundColor;
            replacement.style.display = "flex";
            replacement.style.alignItems = "center";
            replacement.style.justifyContent = "flex-start";
            replacement.style.overflow = "hidden";
            replacement.style.whiteSpace = "nowrap";

            el.replaceWith(replacement);
          });

          doc.querySelectorAll("select").forEach((el) => {
            const selectEl = el;
            if (selectEl.selectedIndex >= 0) {
              const option = selectEl.options[selectEl.selectedIndex];
              if (option) option.setAttribute("selected", "selected");
            }
          });
        },
      });
      const dataUrl = canvas.toDataURL("image/png");
      const fileName = `pa28-weight-balance-${new Date()
        .toISOString()
        .slice(0, 10)}.png`;

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        const newTab = window.open();
        if (newTab) {
          newTab.document.title = "Weight & Balance";
          const img = newTab.document.createElement("img");
          img.src = dataUrl;
          img.style.maxWidth = "100%";
          newTab.document.body.style.margin = "0";
          newTab.document.body.appendChild(img);
        }
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div ref={exportRef} className="mx-auto max-w-5xl space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">
            Piper Archer PA-28-TX Weight & Balance
          </h1>
          <p className="text-sm text-slate-600">
            Fill in the weights below. Moments, arms, and performance data
            update instantly in the background.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Weight &amp; Balance</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="p-3 font-semibold">Item</th>
                  <th className="p-3 font-semibold">Weight (lb)</th>
                  <th className="p-3 font-semibold">
                    Arm aft datum (in)
                    <span className="block text-xs font-normal text-slate-500">
                      Multiply weight by arm
                    </span>
                  </th>
                  <th className="p-3 font-semibold">Moment (lb-in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3">Basic Empty Weight</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={basicWeight}
                      onChange={(e) => {
                        setBasicLastEdited("weight");
                        setBasicWeight(e.target.value);
                      }}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={basicArm}
                      onChange={(e) => {
                        setBasicLastEdited("arm");
                        setBasicArm(e.target.value);
                      }}
                      className={`w-full rounded border border-slate-300 px-2 py-1 ${armClassName(basicArm)}`}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={basicMomentInput}
                      onChange={(e) => {
                        setBasicLastEdited("moment");
                        setBasicMomentInput(e.target.value);
                      }}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                </tr>

                <tr>
                  <td className="p-3">Pilot &amp; Front Pax</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={pilotFrontWeight}
                      onChange={(e) => setPilotFrontWeight(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                  <td className="p-3">80.5</td>
                  <td className="p-3 font-semibold">
                    {pilotFrontMoment.toFixed(2)}
                  </td>
                </tr>

                <tr>
                  <td className="p-3">Rear Pax</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={rearPaxWeight}
                      onChange={(e) => setRearPaxWeight(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                  <td className="p-3">118.1</td>
                  <td className="p-3 font-semibold">
                    {rearPaxMoment.toFixed(2)}
                  </td>
                </tr>

                <tr>
                  <td className="p-3">
                    Fuel
                    <span className="block text-xs text-slate-500">
                      Max usable 48 gal
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        value={fuelGal}
                        onChange={(e) => setFuelGal(e.target.value)}
                        className="w-24 rounded border border-slate-300 px-2 py-1"
                        max="48"
                      />
                      <span className="text-slate-600">
                        Gal = {fuelWeight.toFixed(0)} lb
                      </span>
                    </div>
                  </td>
                  <td className="p-3">95</td>
                  <td className="p-3 font-semibold">{fuelMoment.toFixed(2)}</td>
                </tr>

                <tr>
                  <td className="p-3">
                    Baggage
                    <span className="block text-xs text-slate-500">
                      Max 200 lb
                    </span>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={baggageWeight}
                      onChange={(e) => setBaggageWeight(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                      max="200"
                    />
                  </td>
                  <td className="p-3">142.8</td>
                  <td className="p-3 font-semibold">
                    {baggageMoment.toFixed(2)}
                  </td>
                </tr>

                <tr className="bg-sky-50 font-semibold">
                  <td className="p-3">Ramp Weight</td>
                  <td className="p-3">{rampWeight.toFixed(0)}</td>
                  <td className={`p-3 ${armClassName(rampArmValue)}`}>
                    {rampArm}
                  </td>
                  <td className="p-3">{rampMoment.toFixed(2)}</td>
                </tr>

                <tr>
                  <td className="p-3">Fuel Allowance</td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        value={fuelAllowanceGal}
                        onChange={(e) => setFuelAllowanceGal(e.target.value)}
                        className="w-24 rounded border border-slate-300 px-2 py-1"
                      />
                      <span className="text-slate-600">
                        Gal = {fuelAllowanceWeight.toFixed(0)} lb
                      </span>
                    </div>
                  </td>
                  <td className="p-3">95</td>
                  <td className="p-3 font-semibold">
                    {fuelAllowanceMoment.toFixed(2)}
                  </td>
                </tr>

                <tr className="bg-emerald-50 font-semibold">
                  <td className="p-3">
                    Takeoff Weight
                    <span className="block text-xs font-normal text-slate-500">
                      MTOW 2550 lb • CG 82-93 in
                    </span>
                  </td>
                  <td className="p-3">{takeoffWeight.toFixed(0)}</td>
                  <td className={`p-3 ${armClassName(takeoffArmValue)}`}>
                    {takeoffArm}
                  </td>
                  <td className="p-3">{takeoffMoment.toFixed(2)}</td>
                </tr>

                <tr>
                  <td className="p-3">
                    Fuel Burn
                    <span className="block text-xs text-slate-500">
                      11 gal/hr
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="number"
                        value={fuelBurnHr}
                        onChange={(e) => {
                          setFuelBurnSource("hr");
                          setFuelBurnHr(e.target.value);
                        }}
                        className="w-20 rounded border border-slate-300 px-2 py-1"
                        placeholder="hr"
                      />
                      <span className="text-slate-600">hr =</span>
                      <input
                        type="number"
                        value={fuelBurnGal}
                        onChange={(e) => {
                          setFuelBurnSource("gal");
                          setFuelBurnGal(e.target.value);
                        }}
                        className="w-20 rounded border border-slate-300 px-2 py-1"
                        placeholder="Gal"
                      />
                      <span className="text-slate-600">
                        Gal = {fuelBurnWeight.toFixed(0)} lb
                      </span>
                    </div>
                  </td>
                  <td className="p-3">95</td>
                  <td className="p-3 font-semibold">
                    {fuelBurnMoment.toFixed(2)}
                  </td>
                </tr>

                <tr className="bg-amber-50 font-semibold">
                  <td className="p-3">
                    Landing Weight
                    <span className="block text-xs font-normal text-slate-500">
                      MLW 2550 lb • CG 82-93 in
                    </span>
                  </td>
                  <td className="p-3">{landingWeight.toFixed(0)}</td>
                  <td className={`p-3 ${armClassName(landingArmValue)}`}>
                    {landingArm}
                  </td>
                  <td className="p-3">{landingMoment.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Altitude &amp; Performance</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="p-3 font-semibold">Item</th>
                  <th className="p-3 font-semibold">Depart</th>
                  <th className="p-3 font-semibold">Arrive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3">ICAO Code</td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={departICAO}
                      onChange={(e) =>
                        setDepartICAO(e.target.value.toUpperCase())
                      }
                      className="w-full rounded border border-slate-300 px-2 py-1"
                      placeholder="e.g., KLGB"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={arriveICAO}
                      onChange={(e) =>
                        setArriveICAO(e.target.value.toUpperCase())
                      }
                      className="w-full rounded border border-slate-300 px-2 py-1"
                      placeholder="e.g., KSNA"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3">Temperature (°C)</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={departTemp}
                      onChange={(e) => setDepartTemp(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={arriveTemp}
                      onChange={(e) => setArriveTemp(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3">Altimeter (inHg)</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={departAltimeter}
                      onChange={(e) => setDepartAltimeter(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={arriveAltimeter}
                      onChange={(e) => setArriveAltimeter(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3">Elevation (ft)</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={departElevation}
                      onChange={(e) => setDepartElevation(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={arriveElevation}
                      onChange={(e) => setArriveElevation(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <span
                      className="font-medium"
                      title={pressureAltFormulaText}
                    >
                      Pressure Alt (ft)
                    </span>
                    <div className="mt-1 text-xs text-slate-500 sm:hidden whitespace-pre-line">
                      {pressureAltFormulaText}
                    </div>
                  </td>
                  <td className="p-3">{departPressureAlt.toFixed(0)}</td>
                  <td className="p-3">{arrivePressureAlt.toFixed(0)}</td>
                </tr>
                <tr>
                  <td className="p-3">
                    <span className="font-medium" title={isaTempFormulaText}>
                      ISA Temp (°C)
                    </span>
                    <div className="mt-1 text-xs text-slate-500 sm:hidden whitespace-pre-line">
                      {isaTempFormulaText}
                    </div>
                  </td>
                  <td className="p-3">{departISATemp.toFixed(1)}</td>
                  <td className="p-3">{arriveISATemp.toFixed(1)}</td>
                </tr>
                <tr>
                  <td className="p-3">
                    <span className="font-medium" title={densityAltFormulaText}>
                      Density Alt (ft)
                    </span>
                    <div className="mt-1 text-xs text-slate-500 sm:hidden whitespace-pre-line">
                      {densityAltFormulaText}
                    </div>
                  </td>
                  <td className="p-3">{departDensityAlt.toFixed(0)}</td>
                  <td className="p-3">{arriveDensityAlt.toFixed(0)}</td>
                </tr>
                <tr>
                  <td className="p-3">Runway Direction</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={departRunwayDir}
                      onChange={(e) => setDepartRunwayDir(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                      placeholder="e.g., 18"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={arriveRunwayDir}
                      onChange={(e) => setArriveRunwayDir(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                      placeholder="e.g., 22"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3">Wind Direction (°)</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={departWindDir}
                      onChange={(e) => setDepartWindDir(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                      placeholder="e.g., 240"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={arriveWindDir}
                      onChange={(e) => setArriveWindDir(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                      placeholder="e.g., 180"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3">Wind Speed (kt)</td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={departWindSpeed}
                      onChange={(e) => setDepartWindSpeed(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                      placeholder="e.g., 12"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={arriveWindSpeed}
                      onChange={(e) => setArriveWindSpeed(e.target.value)}
                      className="w-full rounded border border-slate-300 px-2 py-1"
                      placeholder="e.g., 8"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="p-3">Headwind (kt)</td>
                  <td className="p-3">{departWinds.headwind}</td>
                  <td className="p-3">{arriveWinds.headwind}</td>
                </tr>
                <tr>
                  <td className="p-3">Crosswind (kt)</td>
                  <td className="p-3">
                    {departWinds.crosswind} {departWinds.crosswindDir}
                  </td>
                  <td className="p-3">
                    {arriveWinds.crosswind} {arriveWinds.crosswindDir}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleExportPhoto}
            disabled={isExporting}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isExporting ? "Exporting…" : "Export Photo"}
          </button>
          <button
            onClick={clearAll}
            className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
