const form = document.getElementById('bmi-form');
const unitToggle = document.getElementById('unit-toggle');
const weightInput = document.getElementById('weight');
const bodyfatInput = document.getElementById('bodyfat');

const heightMetricDiv = document.getElementById('height-metric');
const heightMetricSelect = document.getElementById('height-metric-select');
const heightImperialDiv = document.getElementById('height-imperial');
const heightFeetSelect = document.getElementById('height-feet');
const heightInchesSelect = document.getElementById('height-inches');

const unitLabelMetric = document.getElementById('unit-label-metric');
const unitLabelImperial = document.getElementById('unit-label-imperial');
const toggleThumb = document.getElementById('toggle-thumb');

const resultContainers = [
  document.getElementById('result-top-left'),
  document.getElementById('result-top-right'),
  document.getElementById('result-bottom-left'),
  document.getElementById('result-bottom-center'),
  document.getElementById('result-bottom-right'),
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// height (cm) and weight (kg) are verified stats at time of filming/competition;
// bmi is derived from them below rather than hardcoded, so it never drifts out of sync.
// bodyfat uses corrected estimates, not the marketing figures actors/trainers publicize —
// those are near-physiologically-impossible for a full shoot (Arnold's is the one genuine
// contest-prep figure, from a professional bodybuilder rather than an actor).
const physiques = [
  { name: "Brad Pitt", movie: "Fight Club", height: 180, weight: 70.3, age: 34, image: "brad-pitt.jpg", bodyfat: 8 },
  { name: "Christian Bale", movie: "American Psycho", height: 183, weight: 81.2, age: 26, image: "bale.jpg", bodyfat: 10 },
  { name: "Ryan Reynolds", movie: "Blade Trinity", height: 188, weight: 86.2, age: 27, image: "ryan-reynolds.jpg", bodyfat: 9 },
  { name: "Jake Gyllenhaal", movie: "Road House", height: 183, weight: 83.5, age: 41, image: "jake.jpg", bodyfat: 8 },
  { name: "Arnold Schwarzenegger", movie: "At his prime", height: 188, weight: 106.6, age: 28, image: "arnold.jpg", bodyfat: 7 },
];
physiques.forEach(p => { p.bmi = p.weight / ((p.height / 100) ** 2); });

// Populate metric dropdown (130–220 cm, centered on 177 cm)
for (let cm = 130; cm <= 220; cm++) {
  const opt = document.createElement('option');
  opt.value = cm;
  opt.textContent = `${cm} cm`;
  if (cm === 177) opt.selected = true;
  heightMetricSelect.appendChild(opt);
}

// Populate feet dropdown (4–7 ft)
for (let ft = 4; ft <= 7; ft++) {
  const opt = document.createElement('option');
  opt.value = ft;
  opt.textContent = `${ft} ft`;
  if (ft === 5) opt.selected = true;
  heightFeetSelect.appendChild(opt);
}
// Populate inches dropdown (0–11 in)
for (let inch = 0; inch < 12; inch++) {
  const opt = document.createElement('option');
  opt.value = inch;
  opt.textContent = `${inch} in`;
  if (inch === 10) opt.selected = true; // 5'10" is common
  heightInchesSelect.appendChild(opt);
}

function formatHeight(cm, imperial) {
  if (!imperial) return `${Math.round(cm)}cm`;
  const totalInches = cm / 2.54;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return `${feet}'${inches}"`;
}

function formatWeight(kg, imperial) {
  return imperial ? `${Math.round(kg / 0.453592)}lbs` : `${Math.round(kg)}kg`;
}

function physiqueSubtitle(p, imperial) {
  return `${p.movie}, ${formatHeight(p.height, imperial)}, ${formatWeight(p.weight, imperial)}, ${p.age}yo`;
}

function updateToggleVisuals() {
  if (unitToggle.checked) {
    toggleThumb.style.transform = 'translateX(1.25rem)';
    unitLabelMetric.classList.remove('text-white', 'font-medium');
    unitLabelMetric.classList.add('text-gray-500');
    unitLabelImperial.classList.remove('text-gray-500');
    unitLabelImperial.classList.add('text-white', 'font-medium');
  } else {
    toggleThumb.style.transform = 'translateX(0)';
    unitLabelImperial.classList.remove('text-white', 'font-medium');
    unitLabelImperial.classList.add('text-gray-500');
    unitLabelMetric.classList.remove('text-gray-500');
    unitLabelMetric.classList.add('text-white', 'font-medium');
  }
}

// Toggle height input fields and unit label emphasis
unitToggle.addEventListener('change', () => {
  if (unitToggle.checked) {
    heightMetricDiv.classList.add('hidden');
    heightImperialDiv.classList.remove('hidden');
    weightInput.placeholder = "Weight in lbs";
    weightInput.value = '';
  } else {
    heightMetricDiv.classList.remove('hidden');
    heightImperialDiv.classList.add('hidden');
    weightInput.placeholder = "Weight in kg";
    weightInput.value = '';
  }
  updateToggleVisuals();
  renderPreview();
});

function renderPreviewCard(p) {
  return `
    <div class="bg-gray-800 p-4 rounded shadow text-center h-full flex flex-col">
      <img src="images/${p.image}" alt="${p.name}" class="w-full h-64 object-cover rounded mb-2 grayscale opacity-50">
      <h2 class="text-xl font-semibold">${p.name}</h2>
      <div class="text-sm text-gray-400 mb-2">(${physiqueSubtitle(p, unitToggle.checked)})</div>
      <p class="text-sm">Target BMI: ${p.bmi.toFixed(1)}</p>
      <p class="text-sm text-gray-500 mt-auto">Enter your stats to compare.</p>
    </div>
  `;
}

function renderResultCard(p, headline, bodyfatSection, totalChangeLine) {
  return `
    <div class="bg-gray-800 p-4 rounded shadow text-center h-full flex flex-col transition-shadow hover:shadow-lg">
      <img src="images/${p.image}" alt="${p.name}" class="w-full h-64 object-cover rounded mb-2">
      <h2 class="text-xl font-semibold">${p.name}</h2>
      <div class="text-sm text-gray-400 mb-2">(${physiqueSubtitle(p, unitToggle.checked)})</div>
      <p class="text-sm">Target BMI: ${p.bmi.toFixed(1)}</p>
      <div class="mt-2">
        <div class="text-2xl font-bold text-blue-400">${headline}</div>
        <div class="text-xs text-gray-400 uppercase tracking-wide">to match this BMI</div>
      </div>
      ${bodyfatSection}
      ${totalChangeLine}
    </div>
  `;
}

function renderPreview() {
  physiques.forEach((p, i) => {
    resultContainers[i].innerHTML = renderPreviewCard(p);
  });
}

function revealResults() {
  if (prefersReducedMotion) return;
  resultContainers.forEach((container, i) => {
    const card = container.firstElementChild;
    if (!card) return;
    card.classList.add('opacity-0', 'translate-y-2');
    card.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
    setTimeout(() => {
      card.classList.remove('opacity-0', 'translate-y-2');
    }, i * 60 + 20);
  });
}

updateToggleVisuals();
renderPreview();

form.addEventListener('submit', function (e) {
  e.preventDefault();
  let heightM, weight = parseFloat(weightInput.value);

  if (unitToggle.checked) {
    // Imperial: get feet and inches, convert to meters
    const feet = parseInt(heightFeetSelect.value, 10);
    const inches = parseInt(heightInchesSelect.value, 10);
    const totalInches = feet * 12 + inches;
    heightM = totalInches * 0.0254;
    weight = weight * 0.453592;
  } else {
    // Metric: get cm, convert to meters
    const cm = parseInt(heightMetricSelect.value, 10);
    heightM = cm / 100;
  }

  const userBodyfat = parseFloat(bodyfatInput.value);
  const displayUnit = unitToggle.checked ? "lbs" : "kg";

  physiques.forEach((p, i) => {
    const targetWeight = p.bmi * heightM * heightM;
    const change = targetWeight - weight;
    const direction = change > 0 ? "gain" : "lose";
    const displayChange = (unitToggle.checked
      ? Math.abs(change / 0.453592)
      : Math.abs(change)
    ).toFixed(1);

    const headline = `${change > 0 ? '+' : '−'}${displayChange} ${displayUnit}`;

    let bodyfatSection = '';
    let totalChangeLine = `<p class="text-sm mt-auto">You need to <strong>${direction} ${displayChange} ${displayUnit}</strong> to match this physique's BMI.</p>`;

    if (!isNaN(userBodyfat)) {
      // Calculate user's fat mass and lean mass
      const userFatMass = weight * (userBodyfat / 100);
      const userLeanMass = weight - userFatMass;

      // Target fat mass and lean mass for this physique
      const targetFatMass = targetWeight * (p.bodyfat / 100);
      const targetLeanMass = targetWeight - targetFatMass;

      // Fat to lose (if positive) or gain (if negative)
      const fatToLose = userFatMass - targetFatMass;
      // Muscle to gain (if positive) or lose (if negative)
      const muscleToGain = targetLeanMass - userLeanMass;

      const unit = unitToggle.checked ? "lbs" : "kg";
      const fatToLoseDisplay = (unitToggle.checked
        ? Math.abs(fatToLose / 0.453592)
        : Math.abs(fatToLose)
      ).toFixed(1);
      const muscleToGainDisplay = (unitToggle.checked
        ? Math.abs(muscleToGain / 0.453592)
        : Math.abs(muscleToGain)
      ).toFixed(1);

      bodyfatSection = `
        <p class="text-sm text-gray-400">Target Bodyfat: ${p.bodyfat}%</p>
        <p class="text-sm">
          You need to <strong>${fatToLose > 0 ? "lose" : "gain"} ${fatToLoseDisplay} ${unit} fat</strong>
          and <strong>${muscleToGain > 0 ? "gain" : "lose"} ${muscleToGainDisplay} ${unit} muscle</strong> to match this physique.
        </p>
      `;
      totalChangeLine = `
        <p class="text-xs text-gray-400 mt-1">
          (If not accounting for bodyfat percentage, you need to <strong>${direction} ${displayChange} ${displayUnit}</strong> in total body weight to match this physique's BMI.)
        </p>
      `;
    }

    resultContainers[i].innerHTML = renderResultCard(p, headline, bodyfatSection, totalChangeLine);
  });

  revealResults();
});
