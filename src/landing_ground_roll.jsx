// Press Alt equations (by OAT)
const eqPressAlt0 = (x) => 3.409838965749832 * x + 866.7221983763392;
const eqPressAlt1000 = (x) => 3.3024536378658764 * x + 902.2013961854;
const eqPressAlt2000 = (x) => 3.319999985515433 * x + 929.8741774142312;
const eqPressAlt3000 = (x) => 3.590784181667018 * x + 956.6618976106503;
const eqPressAlt4000 = (x) => 3.693280858931948 * x + 996.6627346169271;
const eqPressAlt5000 = (x) => 4.004793615726017 * x + 1030.6426225010716;
const eqPressAlt6000 = (x) => 4.165343228751089 * x + 1076.2127393732853;
const eqPressAlt7000 = (x) => 4.19316067734104 * x + 1125.603389633535;

// Weight correction equations (by raw altitude reference points)
const eqWeight86022685048054065 = (x) =>
  0.34482166426223926 * x - 19.02673906330366;
const eqWeight92524358464342 = (x) =>
  0.34650014099848225 * x + 41.66822509729029;
const eqWeight9966015678193736 = (x) =>
  0.3571847586023128 * x + 85.78043338347597;
const eqWeight1071866489424929 = (x) =>
  0.38400781109120546 * x + 92.64657114235483;
const eqWeight11420023521557948 = (x) =>
  0.4018987461586985 * x + 117.1605494511137;
const eqWeight12113623794663683 = (x) =>
  0.4214859666853569 * x + 136.57316441870813;
const eqWeight12897760356190513 = (x) =>
  0.4637428522875058 * x + 107.23176228591164;

// Headwind equations
const eqHw700 = (x) => -13.638150711067007 * x + 700;
const eqHw800 = (x) => -14.457607394692396 * x + 800;
const eqHw900 = (x) => -14.981533812075643 * x + 900;
const eqHw1000 = (x) => -15.747378034631973 * x + 1000;
const eqHw1100 = (x) => -16.365615715391403 * x + 1100;
const eqHw1200 = (x) => -17.124365367646117 * x + 1200;
const eqHw1300 = (x) => -17.94007732345423 * x + 1300;

// Tailwind equations
const eqTw700 = (x) => -39.762560310375044 * x + 700;
const eqTw800 = (x) => -44.29740475740342 * x + 800;
const eqTw900 = (x) => -46.649270809175235 * x + 900;
const eqTw1000 = (x) => -50.491949715779725 * x + 1000;
const eqTw1100 = (x) => -52.2992757114057 * x + 1100;

function linearInterpolate(x, x0, x1, y0, y1) {
  if (x1 === x0) return y0;
  const t = (x - x0) / (x1 - x0);
  return y0 + t * (y1 - y0);
}

export function calculateIsaTemp(pressureAltitude) {
  return 15 - (2 / 1000) * pressureAltitude;
}

export function calculateRawAltitudeByOatPressureAlt(oat, pressureAltitude) {
  // Check the pressure altitude range
  if (pressureAltitude > 7000) {
    throw new Error("Pressure altitude must be 7000 feet or less.");
  }
  if (pressureAltitude < 0) {
    console.warn("Pressure altitude is negative. Setting to Sea Level.");
    pressureAltitude = 0;
  }

  // Check the OAT range — clamp rather than throwing so UI still shows a result
  const isaTempAtPressureAlt = calculateIsaTemp(pressureAltitude);
  const minOat = isaTempAtPressureAlt - 15;
  const maxOat = isaTempAtPressureAlt + 30;
  if (oat < minOat) {
    console.warn(`OAT ${oat}°C below chart range; clamping to ${minOat}°C`);
    oat = minOat;
  } else if (oat > maxOat) {
    console.warn(`OAT ${oat}°C above chart range; clamping to ${maxOat}°C`);
    oat = maxOat;
  }

  // Calculate the raw altitude by different intervals
  if (0 <= pressureAltitude && pressureAltitude < 1000) {
    return linearInterpolate(
      pressureAltitude,
      0,
      1000,
      eqPressAlt0(oat),
      eqPressAlt1000(oat),
    );
  } else if (1000 <= pressureAltitude && pressureAltitude < 2000) {
    return linearInterpolate(
      pressureAltitude,
      1000,
      2000,
      eqPressAlt1000(oat),
      eqPressAlt2000(oat),
    );
  } else if (2000 <= pressureAltitude && pressureAltitude < 3000) {
    return linearInterpolate(
      pressureAltitude,
      2000,
      3000,
      eqPressAlt2000(oat),
      eqPressAlt3000(oat),
    );
  } else if (3000 <= pressureAltitude && pressureAltitude < 4000) {
    return linearInterpolate(
      pressureAltitude,
      3000,
      4000,
      eqPressAlt3000(oat),
      eqPressAlt4000(oat),
    );
  } else if (4000 <= pressureAltitude && pressureAltitude < 5000) {
    return linearInterpolate(
      pressureAltitude,
      4000,
      5000,
      eqPressAlt4000(oat),
      eqPressAlt5000(oat),
    );
  } else if (5000 <= pressureAltitude && pressureAltitude < 6000) {
    return linearInterpolate(
      pressureAltitude,
      5000,
      6000,
      eqPressAlt5000(oat),
      eqPressAlt6000(oat),
    );
  } else if (6000 <= pressureAltitude && pressureAltitude < 7000) {
    return linearInterpolate(
      pressureAltitude,
      6000,
      7000,
      eqPressAlt6000(oat),
      eqPressAlt7000(oat),
    );
  }
  return 0;
}

export function calculateRawAltitudeByWeight(weight, rawAltitude) {
  if (weight > 2550) {
    throw new RangeError("Overweight");
  }
  if (weight < 2000) {
    throw new RangeError("Underweight");
  }

  if (rawAltitude < 860.2685048054065) {
    const _diff = 860.2685048054065 - rawAltitude;
    return eqWeight86022685048054065(weight) - _diff;
  } else if (
    860.2685048054065 <= rawAltitude &&
    rawAltitude < 925.24358464342
  ) {
    return linearInterpolate(
      rawAltitude,
      860.2685048054065,
      925.24358464342,
      eqWeight86022685048054065(weight),
      eqWeight92524358464342(weight),
    );
  } else if (
    925.24358464342 <= rawAltitude &&
    rawAltitude < 996.6015678193736
  ) {
    return linearInterpolate(
      rawAltitude,
      925.24358464342,
      996.6015678193736,
      eqWeight92524358464342(weight),
      eqWeight9966015678193736(weight),
    );
  } else if (
    996.6015678193736 <= rawAltitude &&
    rawAltitude < 1071.866489424929
  ) {
    return linearInterpolate(
      rawAltitude,
      996.6015678193736,
      1071.866489424929,
      eqWeight9966015678193736(weight),
      eqWeight1071866489424929(weight),
    );
  } else if (
    1071.866489424929 <= rawAltitude &&
    rawAltitude < 1142.0023521557948
  ) {
    return linearInterpolate(
      rawAltitude,
      1071.866489424929,
      1142.0023521557948,
      eqWeight1071866489424929(weight),
      eqWeight11420023521557948(weight),
    );
  } else if (
    1142.0023521557948 <= rawAltitude &&
    rawAltitude < 1211.3623794663683
  ) {
    return linearInterpolate(
      rawAltitude,
      1142.0023521557948,
      1211.3623794663683,
      eqWeight11420023521557948(weight),
      eqWeight12113623794663683(weight),
    );
  } else if (
    1211.3623794663683 <= rawAltitude &&
    rawAltitude < 1289.7760356190513
  ) {
    return linearInterpolate(
      rawAltitude,
      1211.3623794663683,
      1289.7760356190513,
      eqWeight12113623794663683(weight),
      eqWeight12897760356190513(weight),
    );
  } else if (1289.7760356190513 <= rawAltitude) {
    const _diff = rawAltitude - 1289.7760356190513;
    return eqWeight12897760356190513(weight) + _diff;
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
    if (rawAltitude < 700) {
      const _diff = 700 - rawAltitude;
      return eqHw700(windSpeed) - _diff;
    } else if (700 <= rawAltitude && rawAltitude < 800) {
      return linearInterpolate(
        rawAltitude,
        700,
        800,
        eqHw700(windSpeed),
        eqHw800(windSpeed),
      );
    } else if (800 <= rawAltitude && rawAltitude < 900) {
      return linearInterpolate(
        rawAltitude,
        800,
        900,
        eqHw800(windSpeed),
        eqHw900(windSpeed),
      );
    } else if (900 <= rawAltitude && rawAltitude < 1000) {
      return linearInterpolate(
        rawAltitude,
        900,
        1000,
        eqHw900(windSpeed),
        eqHw1000(windSpeed),
      );
    } else if (1000 <= rawAltitude && rawAltitude < 1100) {
      return linearInterpolate(
        rawAltitude,
        1000,
        1100,
        eqHw1000(windSpeed),
        eqHw1100(windSpeed),
      );
    } else if (1100 <= rawAltitude && rawAltitude < 1200) {
      return linearInterpolate(
        rawAltitude,
        1100,
        1200,
        eqHw1100(windSpeed),
        eqHw1200(windSpeed),
      );
    } else if (1200 <= rawAltitude && rawAltitude < 1300) {
      return linearInterpolate(
        rawAltitude,
        1200,
        1300,
        eqHw1200(windSpeed),
        eqHw1300(windSpeed),
      );
    } else if (1300 <= rawAltitude) {
      const _diff = rawAltitude - 1300;
      return eqHw1300(windSpeed) + _diff;
    }
  } else if (windSpeed === 0) {
    return rawAltitude;
  } else {
    // Tailwind
    if (rawAltitude < 700) {
      const _diff = 700 - rawAltitude;
      return eqTw700(windSpeed) + _diff;
    } else if (700 <= rawAltitude && rawAltitude < 800) {
      return linearInterpolate(
        rawAltitude,
        700,
        800,
        eqTw700(windSpeed),
        eqTw800(windSpeed),
      );
    } else if (800 <= rawAltitude && rawAltitude < 900) {
      return linearInterpolate(
        rawAltitude,
        800,
        900,
        eqTw800(windSpeed),
        eqTw900(windSpeed),
      );
    } else if (900 <= rawAltitude && rawAltitude < 1000) {
      return linearInterpolate(
        rawAltitude,
        900,
        1000,
        eqTw900(windSpeed),
        eqTw1000(windSpeed),
      );
    } else if (1000 <= rawAltitude && rawAltitude < 1100) {
      return linearInterpolate(
        rawAltitude,
        1000,
        1100,
        eqTw1000(windSpeed),
        eqTw1100(windSpeed),
      );
    } else if (1100 <= rawAltitude) {
      const _diff = rawAltitude - 1100;
      return eqTw1100(windSpeed) + _diff;
    }
  }
  return rawAltitude;
}

export function findLandingGroundRoll(
  oat,
  pressureAltitude,
  weight,
  windSpeed,
) {
  const MINIMUM_LANDING_GROUND_ROLL = 600; // feet
  const MAXIMUM_LANDING_GROUND_ROLL = 1300; // feet

  // Calculate the equivalent altitude for the given OAT and Pressure Altitude
  const equivalentAltitude = calculateRawAltitudeByOatPressureAlt(
    oat,
    pressureAltitude,
  );

  // Correct the equivalent altitude for the given weight
  const correctedAltitude = calculateRawAltitudeByWeight(
    weight,
    equivalentAltitude,
  );

  // Correct the corrected altitude for the given wind speed
  const finalAltitude = calculateRawAltitudeByWind(
    windSpeed,
    correctedAltitude,
  );

  // Ensure the final altitude is within the valid range
  if (finalAltitude < MINIMUM_LANDING_GROUND_ROLL) {
    console.warn(
      "The calculated landing ground roll is below the minimum from the chart. Using the minimum value.",
    );
    return MINIMUM_LANDING_GROUND_ROLL;
  } else if (finalAltitude > MAXIMUM_LANDING_GROUND_ROLL) {
    console.warn(
      "The calculated landing ground roll is above the maximum from the chart. Using the maximum value.",
    );
    return MAXIMUM_LANDING_GROUND_ROLL;
  }

  return finalAltitude;
}
