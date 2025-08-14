// Utility: clamp and format
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// Set year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.getElementById('nav-links');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

// ===== BMI Calculator =====
const bmiForm = document.getElementById('bmiForm');
const bmiUnitSystem = document.getElementById('bmiUnitSystem');
const bmiHeight = document.getElementById('bmiHeight');
const bmiWeight = document.getElementById('bmiWeight');
const bmiResult = document.getElementById('bmiResult');
const bmiError = document.getElementById('bmiError');
const bmiResetBtn = document.getElementById('bmiReset');
const unitHeightSpans = document.querySelectorAll('[data-unit-height]');
const unitWeightSpans = document.querySelectorAll('[data-unit-weight]');

// Update unit labels dynamically
function updateBMIUnitLabels() {
  const isMetric = bmiUnitSystem.value === 'metric';
  unitHeightSpans.forEach(el => el.textContent = isMetric ? '(cm)' : '(in)');
  unitWeightSpans.forEach(el => el.textContent = isMetric ? '(kg)' : '(lb)');
  // Optional: convert current values when switching units
  const hVal = parseFloat(bmiHeight.value);
  const wVal = parseFloat(bmiWeight.value);
  if (!isNaN(hVal) && !isNaN(wVal)) {
    if (isMetric) {
      // in -> cm, lb -> kg
      bmiHeight.value = (hVal * 2.54).toFixed(1);
      bmiWeight.value = (wVal / 2.2046226218).toFixed(1);
    } else {
      // cm -> in, kg -> lb
      bmiHeight.value = (hVal / 2.54).toFixed(1);
      bmiWeight.value = (wVal * 2.2046226218).toFixed(1);
    }
  }
}
bmiUnitSystem.addEventListener('change', updateBMIUnitLabels);

// Calculate BMI
bmiForm.addEventListener('submit', (e) => {
  e.preventDefault();
  bmiError.textContent = '';
  bmiResult.style.display = 'none';

  const system = bmiUnitSystem.value;
  let h = parseFloat(bmiHeight.value);
  let w = parseFloat(bmiWeight.value);

  if (!h || !w || h <= 0 || w <= 0) {
    bmiError.textContent = 'Please provide valid height and weight.';
    return;
  }

  // Convert to metric for calculation
  if (system === 'imperial') {
    h = h * 2.54;          // in -> cm
    w = w / 2.2046226218;  // lb -> kg
  }

  const m = h / 100; // cm -> m
  const bmi = (w / (m * m));
  const bmiRounded = Math.round(bmi * 10) / 10;

  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  bmiResult.innerHTML = `
    <strong>BMI:</strong> ${bmiRounded} &nbsp; <em>${category}</em>
  `;
  bmiResult.style.display = 'block';
});

bmiResetBtn.addEventListener('click', () => {
  bmiForm.reset();
  bmiError.textContent = '';
  bmiResult.style.display = 'none';
  updateBMIUnitLabels();
});

// Initialize unit labels
updateBMIUnitLabels();

// ===== Calorie Needs (Mifflin-St Jeor) =====
const calorieForm = document.getElementById('calorieForm');
const calorieError = document.getElementById('calorieError');
const calorieResult = document.getElementById('calorieResult');
const calorieResetBtn = document.getElementById('calorieReset');

calorieForm.addEventListener('submit', (e) => {
  e.preventDefault();
  calorieError.textContent = '';
  calorieResult.style.display = 'none';

  const age = parseInt(document.getElementById('age').value, 10);
  const gender = document.getElementById('gender').value;
  const height = parseFloat(document.getElementById('calHeight').value);  // cm
  const weight = parseFloat(document.getElementById('calWeight').value);  // kg
  const activity = parseFloat(document.getElementById('activity').value);
  const goal = document.getElementById('goal').value;

  if (!age || !gender || !height || !weight || !activity || !goal) {
    calorieError.textContent = 'Please complete all fields correctly.';
    return;
  }
  if (age < 12 || age > 100) {
    calorieError.textContent = 'Age must be between 12 and 100.';
    return;
  }

  // Mifflin-St Jeor BMR
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  let calories = bmr * activity;

  // Goal adjustment (simple heuristic)
  if (goal === 'lose') calories -= 500;
  if (goal === 'gain') calories += 500;

  // Safety clamp
  calories = clamp(calories, 800, 6000);

  calorieResult.innerHTML = `
    <strong>Estimated Daily Calories:</strong> ${Math.round(calories).toLocaleString()} kcal
  `;
  calorieResult.style.display = 'block';
});

calorieResetBtn.addEventListener('click', () => {
  calorieForm.reset();
  calorieError.textContent = '';
  calorieResult.style.display = 'none';
});

// ===== Macro Calculator =====
const macroForm = document.getElementById('macroForm');
const macroError = document.getElementById('macroError');
const macroResult = document.getElementById('macroResult');
const macroResetBtn = document.getElementById('macroReset');

macroForm.addEventListener('submit', (e) => {
  e.preventDefault();
  macroError.textContent = '';
  macroResult.style.display = 'none';

  const cal = parseFloat(document.getElementById('macroCalories').value);
  const goal = document.getElementById('macroGoal').value;

  if (!cal || cal <= 0 || !goal) {
    macroError.textContent = 'Enter a valid daily calorie number and select a goal.';
    return;
  }

  // Standard macro splits:
  // lose: 40P / 40C / 20F
  // maintain: 30P / 50C / 20F
  // gain: 25P / 55C / 20F
  let p = 0.3, c = 0.5, f = 0.2;
  if (goal === 'lose') { p = 0.4; c = 0.4; f = 0.2; }
  if (goal === 'gain') { p = 0.25; c = 0.55; f = 0.2; }

  const gramsProtein = Math.round((cal * p) / 4);
  const gramsCarb   = Math.round((cal * c) / 4);
  const gramsFat    = Math.round((cal * f) / 9);

  macroResult.innerHTML = `
    <div class="macro-grid">
      <div><strong>Protein</strong><br>${gramsProtein} g</div>
      <div><strong>Carbs</strong><br>${gramsCarb} g</div>
      <div><strong>Fats</strong><br>${gramsFat} g</div>
    </div>
    <p class="muted small">Note: These are general guidelines and not medical advice.</p>
  `;
  macroResult.style.display = 'block';
});

macroResetBtn.addEventListener('click', () => {
  macroForm.reset();
  macroError.textContent = '';
  macroResult.style.display = 'none';
});

// Small style helper
const style = document.createElement('style');
style.textContent = `
  .macro-grid { display:grid; grid-template-columns: repeat(3,1fr); gap:.5rem; text-align:center; }
  .small { font-size: .9rem; }
`;
document.head.appendChild(style);
