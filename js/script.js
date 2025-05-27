const form = document.getElementById('bmi-form');
const resultsLeft = document.getElementById('results-left');
const resultsRight = document.getElementById('results-right');
const unitToggle = document.getElementById('unit-toggle');
const weightInput = document.getElementById('weight');
const bodyfatInput = document.getElementById('bodyfat');

const heightMetricDiv = document.getElementById('height-metric');
const heightMetricSelect = document.getElementById('height-metric-select');
const heightImperialDiv = document.getElementById('height-imperial');
const heightFeetSelect = document.getElementById('height-feet');
const heightInchesSelect = document.getElementById('height-inches');

const resultTopLeft = document.getElementById('result-top-left');
const resultTopRight = document.getElementById('result-top-right');
const resultBottomLeft = document.getElementById('result-bottom-left');
const resultBottomCenter = document.getElementById('result-bottom-center');
const resultBottomRight = document.getElementById('result-bottom-right');

// Add bodyfat % to each physique (example values, adjust as needed)
const physiques = [
  { name: "Brad Pitt", movie: "Fight Club", bmi: 22.0, image: "brad-pitt.jpg", bodyfat: 8 },
  { name: "Ryan Reynolds", movie: "Blade Trinity", bmi: 24.0, image: "ryan-reynolds.jpg", bodyfat: 8 },
  { name: "Arnold Schwarzenegger", movie: "At his prime", bmi: 30.0, image: "arnold.jpg", bodyfat: 7 },
  { name: "Jake Gyllenhaal", movie: "Roadhouse", bmi: 26.0, image: "jake.jpg", bodyfat: 9 },
  { name: "Christian Bale", movie: "American Psycho", bmi: 25.7, image: "bale.jpg", bodyfat: 9 },
];

// Populate metric dropdown (160–200 cm, centered on 177 cm)
for (let cm = 160; cm <= 200; cm++) {
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

// Toggle height input fields and visually move the toggle
unitToggle.addEventListener('change', () => {
  if (unitToggle.checked) {
    heightMetricDiv.classList.add('hidden');
    heightImperialDiv.classList.remove('hidden');
    weightInput.placeholder = "Weight in lbs";
    weightInput.value = '';
    // Move toggle thumb to right (imperial)
    unitToggle.nextElementSibling.classList.add('peer-checked:bg-blue-600');
    unitToggle.nextElementSibling.firstElementChild.style.transform = 'translateX(1.25rem)';
  } else {
    heightMetricDiv.classList.remove('hidden');
    heightImperialDiv.classList.add('hidden');
    weightInput.placeholder = "Weight in kg";
    weightInput.value = '';
    // Move toggle thumb to left (metric)
    unitToggle.nextElementSibling.classList.remove('peer-checked:bg-blue-600');
    unitToggle.nextElementSibling.firstElementChild.style.transform = 'translateX(0)';
  }
});

// Ensure toggle thumb is correct on page load
window.addEventListener('DOMContentLoaded', () => {
  if (unitToggle.checked) {
    unitToggle.nextElementSibling.firstElementChild.style.transform = 'translateX(1.25rem)';
  } else {
    unitToggle.nextElementSibling.firstElementChild.style.transform = 'translateX(0)';
  }
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  let heightM, weight = parseFloat(weightInput.value), displayUnit = "kg";

  if (unitToggle.checked) {
    // Imperial: get feet and inches, convert to meters
    const feet = parseInt(heightFeetSelect.value, 10);
    const inches = parseInt(heightInchesSelect.value, 10);
    const totalInches = feet * 12 + inches;
    heightM = totalInches * 0.0254;
    weight = weight * 0.453592;
    displayUnit = "lbs";
  } else {
    // Metric: get cm, convert to meters
    const cm = parseInt(heightMetricSelect.value, 10);
    heightM = cm / 100;
    displayUnit = "kg";
  }

  const userBMI = weight / (heightM * heightM);
  const userBodyfat = parseFloat(bodyfatInput.value);

  // Clear previous results
  resultTopLeft.innerHTML = '';
  resultTopRight.innerHTML = '';
  resultBottomLeft.innerHTML = '';
  resultBottomCenter.innerHTML = '';
  resultBottomRight.innerHTML = '';

  physiques.forEach((p, i) => {
    const targetWeight = p.bmi * heightM * heightM;
    let change = targetWeight - weight;
    let direction = change > 0 ? "gain" : "lose";
    let displayChange = Math.abs(change);

    // If imperial, show change in lbs
    if (unitToggle.checked) {
      displayChange = Math.abs(change / 0.453592);
      displayChange = displayChange.toFixed(1);
      displayUnit = "lbs";
    } else {
      displayChange = displayChange.toFixed(1);
      displayUnit = "kg";
    }

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

      // Display in user's preferred units
      let fatToLoseDisplay = fatToLose;
      let muscleToGainDisplay = muscleToGain;
      let unit = "kg";
      if (unitToggle.checked) {
        fatToLoseDisplay = (fatToLose / 0.453592).toFixed(1);
        muscleToGainDisplay = (muscleToGain / 0.453592).toFixed(1);
        unit = "lbs";
      } else {
        fatToLoseDisplay = fatToLose.toFixed(1);
        muscleToGainDisplay = muscleToGain.toFixed(1);
      }

      bodyfatSection = `
        <p class="text-sm text-gray-400">Target Bodyfat: ${p.bodyfat}%</p>
        <p class="text-sm">
          You need to <strong>${fatToLose > 0 ? "lose" : "gain"} ${Math.abs(fatToLoseDisplay)} ${unit} fat</strong>
          and <strong>${muscleToGain > 0 ? "gain" : "lose"} ${Math.abs(muscleToGainDisplay)} ${unit} muscle</strong> to match this physique.
        </p>
      `;
      totalChangeLine = `
        <p class="text-xs text-gray-400 mt-1">
          (If not accounting for bodyfat percentage, you need to <strong>${direction} ${displayChange} ${displayUnit}</strong> in total body weight to match this physique's BMI.)
        </p>
      `;
    }

    const card = `
      <div class="bg-gray-800 p-4 rounded shadow text-center h-full flex flex-col">
        <img src="images/${p.image}" alt="${p.name}" class="w-full h-64 object-cover rounded mb-2">
        <h2 class="text-xl font-semibold">${p.name}</h2>
        <div class="text-sm text-gray-400 mb-2">(${p.movie})</div>
        <p class="text-sm">Target BMI: ${p.bmi}</p>
        ${bodyfatSection}
        ${totalChangeLine}
      </div>
    `;
    // Place cards in grid cells
    if (i === 0) resultTopLeft.innerHTML = card;
    else if (i === 1) resultTopRight.innerHTML = card;
    else if (i === 2) resultBottomLeft.innerHTML = card;
    else if (i === 3) resultBottomCenter.innerHTML = card;
    else if (i === 4) resultBottomRight.innerHTML = card;
  });
});