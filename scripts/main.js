const calculator = document.querySelector('[data-calculator]');
const result = document.querySelector('[data-calculator-result]');

function yen(value) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(value);
}

function updateCalculator() {
  if (!calculator || !result) return;

  const data = new FormData(calculator);
  const price = Number(data.get('price')) || 0;
  const target = Number(data.get('target')) || 0;
  const rate = Number(data.get('rate')) || 0;
  const fixed = Number(data.get('fixed')) || 0;
  const fee = Math.floor(price * (rate / 100)) + fixed;
  const net = Math.max(0, price - fee);
  const units = net > 0 ? Math.ceil(target / net) : 0;
  const gross = units * price;
  const takeHome = units * net;

  result.innerHTML = `
    <strong>${units.toLocaleString('ja-JP')}本</strong>
    <span>1本あたり手取り ${yen(net)} / 売上 ${yen(gross)} / 概算手取り ${yen(takeHome)}</span>
  `;
}

if (calculator) {
  calculator.addEventListener('input', updateCalculator);
  updateCalculator();
}


const checklist = document.querySelector('[data-ai-checklist]');
const checklistScore = document.querySelector('[data-ai-checklist-score]');
const checklistBar = document.querySelector('[data-ai-checklist-bar]');
const checklistMessage = document.querySelector('[data-ai-checklist-message]');
const copyChecklist = document.querySelector('[data-copy-checklist]');
const resetChecklist = document.querySelector('[data-reset-checklist]');
const checklistStorageKey = 'earnings-ai-release-checklist';

function getChecklistItems() {
  return checklist ? Array.from(checklist.querySelectorAll('input[type="checkbox"]')) : [];
}

function updateChecklist() {
  const items = getChecklistItems();
  if (!items.length || !checklistScore || !checklistBar || !checklistMessage) return;

  const checked = items.filter((item) => item.checked).length;
  const total = items.length;
  const percent = Math.round((checked / total) * 100);
  checklistScore.textContent = `${checked} / ${total}`;
  checklistBar.style.width = `${percent}%`;
  checklistMessage.textContent = checked === total ? '公開前チェックは完了です。' : `${total - checked}項目が未確認です。`;

  const state = Object.fromEntries(items.map((item) => [item.name, item.checked]));
  localStorage.setItem(checklistStorageKey, JSON.stringify(state));
}

function loadChecklist() {
  const items = getChecklistItems();
  if (!items.length) return;

  try {
    const state = JSON.parse(localStorage.getItem(checklistStorageKey) || '{}');
    items.forEach((item) => { item.checked = Boolean(state[item.name]); });
  } catch (error) {
    items.forEach((item) => { item.checked = false; });
  }
  updateChecklist();
}

function checklistSummaryText() {
  const items = getChecklistItems();
  const checked = items.filter((item) => item.checked).length;
  const lines = [`AI公開前チェック: ${checked}/${items.length}`];
  items.forEach((item) => {
    lines.push(`${item.checked ? '[x]' : '[ ]'} ${item.parentElement.textContent.trim()}`);
  });
  return lines.join('\n');
}

if (checklist) {
  checklist.addEventListener('change', updateChecklist);
  loadChecklist();
}

if (copyChecklist) {
  copyChecklist.addEventListener('click', async () => {
    const text = checklistSummaryText();
    try {
      await navigator.clipboard.writeText(text);
      copyChecklist.textContent = 'コピーしました';
      window.setTimeout(() => { copyChecklist.textContent = '結果をコピー'; }, 1600);
    } catch (error) {
      copyChecklist.textContent = 'コピー不可';
      window.setTimeout(() => { copyChecklist.textContent = '結果をコピー'; }, 1600);
    }
  });
}

if (resetChecklist) {
  resetChecklist.addEventListener('click', () => {
    getChecklistItems().forEach((item) => { item.checked = false; });
    updateChecklist();
  });
}
