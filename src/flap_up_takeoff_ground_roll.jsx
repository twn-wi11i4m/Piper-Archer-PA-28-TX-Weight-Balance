// Press Alt equations (by OAT)
const eqPressAlt0 = (x) =>
  0.0330692756758942 * x * x + 9.8471113711289 * x + 912.042832087932;
const eqPressAlt2000 = (x) =>
  0.0324076685189817 * x * x + 11.902895609729242 * x + 1085.7019513933892;
const eqPressAlt4000 = (x) =>
  0.04298561593113897 * x * x + 14.09436746021615 * x + 1297.326587107538;
const eqPressAlt6000 = (x) =>
  0.05850346145713719 * x * x + 16.62545995670221 * x + 1555.4394968372392;
const eqPressAlt8000 = (x) =>
  0.05787552177830788 * x * x + 20.226723010930215 * x + 1869.0199140746677;

// Weight correction equations (by raw altitude reference points)
const eqWeight800 = (x) =>
  5.5672886419903995e-5 * Math.pow(x - 2550, 2) +
  0.6644870467624763 * (x - 2550) +
  800;
const eqWeight1000 = (x) =>
  7.546198994278266e-5 * Math.pow(x - 2550, 2) +
  0.8335167460278118 * (x - 2550) +
  1000;
const eqWeight1200 = (x) =>
  0.00010255163610158264 * Math.pow(x - 2550, 2) +
  1.0054241054793194 * (x - 2550) +
  1200;
const eqWeight1400 = (x) =>
  0.00010578367766045011 * Math.pow(x - 2550, 2) +
  1.1661261062111625 * (x - 2550) +
  1400;
const eqWeight1600 = (x) =>
  0.00014178579054699116 * Math.pow(x - 2550, 2) +
  1.3425186678753855 * (x - 2550) +
  1600;
const eqWeight1800 = (x) =>
  0.0001452550820473124 * Math.pow(x - 2550, 2) +
  1.5035588867210046 * (x - 2550) +
  1800;
const eqWeight2000 = (x) =>
  0.00016335196816122198 * Math.pow(x - 2550, 2) +
  1.6712484526137354 * (x - 2550) +
  2000;
const eqWeight2200 = (x) =>
  0.00020685245812820762 * Math.pow(x - 2550, 2) +
  1.8509264609084202 * (x - 2550) +
  2200;
const eqWeight2400 = (x) =>
  0.00020308832091018046 * Math.pow(x - 2550, 2) +
  2.0115947440885376 * (x - 2550) +
  2400;
const eqWeight2600 = (x) =>
  0.00026607711189237994 * Math.pow(x - 2550, 2) +
  2.1985375194571777 * (x - 2550) +
  2600;

// Headwind equations
const eqHw600 = (x) => -8.205096454154402 * x + 600;
const eqHw800 = (x) => -10.888785524660515 * x + 800;
const eqHw1000 = (x) => -13.573553576001991 * x + 1000;
const eqHw1200 = (x) => -16.346779938677678 * x + 1200;
const eqHw1400 = (x) => -19.124716846735552 * x + 1400;
const eqHw1600 = (x) => -21.75876336484711 * x + 1600;
const eqHw1800 = (x) => -24.339215520157726 * x + 1800;
const eqHw2000 = (x) => -26.96093559757666 * x + 2000;
const eqHw2200 = (x) => -29.721335086875644 * x + 2200;
const eqHw2400 = (x) => -32.37879570551428 * x + 2400;
const eqHw2600 = (x) => -35.72308587610041 * x + 2600;

// Tailwind equations
const eqTw600 = (x) => -27.322719356663264 * x + 600;
const eqTw800 = (x) => -35.60236478787245 * x + 800;
const eqTw1000 = (x) => -45.19779223541904 * x + 1000;
const eqTw1200 = (x) => -52.99168898606515 * x + 1200;
const eqTw1400 = (x) => -62.05114626487023 * x + 1400;
const eqTw1600 = (x) => -69.81677014914823 * x + 1600;
const eqTw1800 = (x) => -79.98301484245192 * x + 1800;
const eqTw2000 = (x) => -90.03496862809273 * x + 2000;
const eqTw2200 = (x) => -97.30787386309846 * x + 2200;

function linearInterpolate(x, x0, x1, y0, y1) {
  if (x1 === x0) return y0;
  const t = (x - x0) / (x1 - x0);
  return y0 + t * (y1 - y0);
}

export function calculateIsaTemp(pressureAltitude) {
  return 15 - (2 / 1000) * pressureAltitude;
}

export function calculateRawAltitudeByOatPressureAlt(oat, pressureAltitude) {
  if (pressureAltitude > 8000) {
    throw new RangeError("Pressure altitude must be 8000 feet or less.");
  }
  if (pressureAltitude < 0) {
    console.warn("Pressure altitude is negative. Setting to Sea Level.");
    pressureAltitude = 0;
  }

  if (0 <= pressureAltitude && pressureAltitude < 2000) {
    return linearInterpolate(
      pressureAltitude,
      0,
      2000,
      eqPressAlt0(oat),
      eqPressAlt2000(oat),
    );
  } else if (2000 <= pressureAltitude && pressureAltitude < 4000) {
    return linearInterpolate(
      pressureAltitude,
      2000,
      4000,
      eqPressAlt2000(oat),
      eqPressAlt4000(oat),
    );
  } else if (4000 <= pressureAltitude && pressureAltitude < 6000) {
    return linearInterpolate(
      pressureAltitude,
      4000,
      6000,
      eqPressAlt4000(oat),
      eqPressAlt6000(oat),
    );
  } else if (6000 <= pressureAltitude && pressureAltitude <= 8000) {
    return linearInterpolate(
      pressureAltitude,
      6000,
      8000,
      eqPressAlt6000(oat),
      eqPressAlt8000(oat),
    );
  }
  return 0;
}

export function calculateRawAltitudeByWeight(weight, rawAltitude) {
  if (weight > 2550) {
    throw new RangeError("overweight");
  }
  if (weight < 2000) {
    throw new RangeError("underweight");
  }

  if (rawAltitude < 800) {
    const diff = 800 - rawAltitude;
    return eqWeight800(weight) - diff;
  } else if (800 <= rawAltitude && rawAltitude < 1000) {
    return linearInterpolate(
      rawAltitude,
      800,
      1000,
      eqWeight800(weight),
      eqWeight1000(weight),
    );
  } else if (1000 <= rawAltitude && rawAltitude < 1200) {
    return linearInterpolate(
      rawAltitude,
      1000,
      1200,
      eqWeight1000(weight),
      eqWeight1200(weight),
    );
  } else if (1200 <= rawAltitude && rawAltitude < 1400) {
    return linearInterpolate(
      rawAltitude,
      1200,
      1400,
      eqWeight1200(weight),
      eqWeight1400(weight),
    );
  } else if (1400 <= rawAltitude && rawAltitude < 1600) {
    return linearInterpolate(
      rawAltitude,
      1400,
      1600,
      eqWeight1400(weight),
      eqWeight1600(weight),
    );
  } else if (1600 <= rawAltitude && rawAltitude < 1800) {
    return linearInterpolate(
      rawAltitude,
      1600,
      1800,
      eqWeight1600(weight),
      eqWeight1800(weight),
    );
  } else if (1800 <= rawAltitude && rawAltitude < 2000) {
    return linearInterpolate(
      rawAltitude,
      1800,
      2000,
      eqWeight1800(weight),
      eqWeight2000(weight),
    );
  } else if (2000 <= rawAltitude && rawAltitude < 2200) {
    return linearInterpolate(
      rawAltitude,
      2000,
      2200,
      eqWeight2000(weight),
      eqWeight2200(weight),
    );
  } else if (2200 <= rawAltitude && rawAltitude < 2400) {
    return linearInterpolate(
      rawAltitude,
      2200,
      2400,
      eqWeight2200(weight),
      eqWeight2400(weight),
    );
  } else if (2400 <= rawAltitude && rawAltitude <= 2600) {
    return linearInterpolate(
      rawAltitude,
      2400,
      2600,
      eqWeight2400(weight),
      eqWeight2600(weight),
    );
  } else if (2600 < rawAltitude) {
    const diff = rawAltitude - 2600;
    return eqWeight2600(weight) + diff;
  }
  return rawAltitude;
}

export function calculateRawAltitudeByWind(windSpeed, rawAltitude) {
  if (windSpeed < -5) {
    throw new RangeError("Wind speed is exceeded tailwind limit (-5 kts).");
  }
  if (windSpeed > 15) {
    console.warn(
      "Wind speed is exceeded headwind limit (15 kts). Using the 15 kts value for calculations.",
    );
    windSpeed = 15;
  }

  if (windSpeed > 0) {
    if (rawAltitude < 600) {
      const diff = 600 - rawAltitude;
      return eqHw600(windSpeed) - diff;
    } else if (600 <= rawAltitude && rawAltitude < 800) {
      return linearInterpolate(
        rawAltitude,
        600,
        800,
        eqHw600(windSpeed),
        eqHw800(windSpeed),
      );
    } else if (800 <= rawAltitude && rawAltitude < 1000) {
      return linearInterpolate(
        rawAltitude,
        800,
        1000,
        eqHw800(windSpeed),
        eqHw1000(windSpeed),
      );
    } else if (1000 <= rawAltitude && rawAltitude < 1200) {
      return linearInterpolate(
        rawAltitude,
        1000,
        1200,
        eqHw1000(windSpeed),
        eqHw1200(windSpeed),
      );
    } else if (1200 <= rawAltitude && rawAltitude < 1400) {
      return linearInterpolate(
        rawAltitude,
        1200,
        1400,
        eqHw1200(windSpeed),
        eqHw1400(windSpeed),
      );
    } else if (1400 <= rawAltitude && rawAltitude < 1600) {
      return linearInterpolate(
        rawAltitude,
        1400,
        1600,
        eqHw1400(windSpeed),
        eqHw1600(windSpeed),
      );
    } else if (1600 <= rawAltitude && rawAltitude < 1800) {
      return linearInterpolate(
        rawAltitude,
        1600,
        1800,
        eqHw1600(windSpeed),
        eqHw1800(windSpeed),
      );
    } else if (1800 <= rawAltitude && rawAltitude < 2000) {
      return linearInterpolate(
        rawAltitude,
        1800,
        2000,
        eqHw1800(windSpeed),
        eqHw2000(windSpeed),
      );
    } else if (2000 <= rawAltitude && rawAltitude < 2200) {
      return linearInterpolate(
        rawAltitude,
        2000,
        2200,
        eqHw2000(windSpeed),
        eqHw2200(windSpeed),
      );
    } else if (2200 <= rawAltitude && rawAltitude < 2400) {
      return linearInterpolate(
        rawAltitude,
        2200,
        2400,
        eqHw2200(windSpeed),
        eqHw2400(windSpeed),
      );
    } else if (2400 <= rawAltitude && rawAltitude <= 2600) {
      return linearInterpolate(
        rawAltitude,
        2400,
        2600,
        eqHw2400(windSpeed),
        eqHw2600(windSpeed),
      );
    } else if (2600 < rawAltitude) {
      const diff = rawAltitude - 2600;
      return eqHw2600(windSpeed) + diff;
    }
  } else if (windSpeed === 0) {
    return rawAltitude;
  } else {
    // Tailwind
    if (rawAltitude < 600) {
      const diff = 600 - rawAltitude;
      return eqTw600(windSpeed) - diff;
    } else if (600 <= rawAltitude && rawAltitude < 800) {
      return linearInterpolate(
        rawAltitude,
        600,
        800,
        eqTw600(windSpeed),
        eqTw800(windSpeed),
      );
    } else if (800 <= rawAltitude && rawAltitude < 1000) {
      return linearInterpolate(
        rawAltitude,
        800,
        1000,
        eqTw800(windSpeed),
        eqTw1000(windSpeed),
      );
    } else if (1000 <= rawAltitude && rawAltitude < 1200) {
      return linearInterpolate(
        rawAltitude,
        1000,
        1200,
        eqTw1000(windSpeed),
        eqTw1200(windSpeed),
      );
    } else if (1200 <= rawAltitude && rawAltitude < 1400) {
      return linearInterpolate(
        rawAltitude,
        1200,
        1400,
        eqTw1200(windSpeed),
        eqTw1400(windSpeed),
      );
    } else if (1400 <= rawAltitude && rawAltitude < 1600) {
      return linearInterpolate(
        rawAltitude,
        1400,
        1600,
        eqTw1400(windSpeed),
        eqTw1600(windSpeed),
      );
    } else if (1600 <= rawAltitude && rawAltitude < 1800) {
      return linearInterpolate(
        rawAltitude,
        1600,
        1800,
        eqTw1600(windSpeed),
        eqTw1800(windSpeed),
      );
    } else if (1800 <= rawAltitude && rawAltitude < 2000) {
      return linearInterpolate(
        rawAltitude,
        1800,
        2000,
        eqTw1800(windSpeed),
        eqTw2000(windSpeed),
      );
    } else if (2000 <= rawAltitude && rawAltitude <= 2200) {
      return linearInterpolate(
        rawAltitude,
        2000,
        2200,
        eqTw2000(windSpeed),
        eqTw2200(windSpeed),
      );
    } else if (2200 < rawAltitude) {
      const diff = rawAltitude - 2200;
      return eqTw2200(windSpeed) + diff;
    }
  }
  return rawAltitude;
}

export function findTakeoffGroundRoll(
  oat,
  pressureAltitude,
  weight,
  windSpeed,
) {
  const MINIMUM_TAKEOFF_GROUND_ROLL = 400; // feet
  const MAXIMUM_TAKEOFF_GROUND_ROLL = 2800; // feet

  const equivalentAltitude = calculateRawAltitudeByOatPressureAlt(
    oat,
    pressureAltitude,
  );
  const correctedAltitude = calculateRawAltitudeByWeight(
    weight,
    equivalentAltitude,
  );
  const finalAltitude = calculateRawAltitudeByWind(
    windSpeed,
    correctedAltitude,
  );

  if (finalAltitude < MINIMUM_TAKEOFF_GROUND_ROLL) {
    console.warn(
      "The calculated takeoff ground roll is below the minimum from the chart. Using the minimum value.",
    );
    return MINIMUM_TAKEOFF_GROUND_ROLL;
  } else if (finalAltitude > MAXIMUM_TAKEOFF_GROUND_ROLL) {
    console.warn(
      "The calculated takeoff ground roll is above the maximum from the chart. Using the maximum value.",
    );
    return MAXIMUM_TAKEOFF_GROUND_ROLL;
  }

  return finalAltitude;
}
