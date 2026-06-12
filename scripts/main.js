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
