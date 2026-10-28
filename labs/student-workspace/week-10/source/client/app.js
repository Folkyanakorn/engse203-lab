// URL ของ API: ใส่ ?api=http://localhost:3000 เพื่อเปลี่ยนได้
const API_BASE = new URLSearchParams(location.search).get('api') ?? 'http://localhost:3000';
document.querySelector('#api-base').textContent = API_BASE;

const els = {
  form: document.querySelector('#request-form'),
  errors: document.querySelector('#form-errors'),
  list: document.querySelector('#list'),
  message: document.querySelector('#message'),
  filter: document.querySelector('#status-filter'),
};

/** ชั้นเรียก API เพียงจุดเดียว: แปลง error รูปแบบ { error: { message, details } } เป็น Error */
async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new Error('เชื่อมต่อ API ไม่ได้ (ตรวจว่าเซิร์ฟเวอร์เปิดอยู่และ CORS_ORIGIN ตรงกับ origin ของหน้านี้)');
  }
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error?.message ?? `เกิดข้อผิดพลาด (${response.status})`);
    error.details = body.error?.details ?? [];
    throw error;
  }
  return body;
}

function setMessage(text, isError = false) {
  els.message.textContent = text;
  els.message.className = isError ? 'error' : '';
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderCard(request) {
  const card = el('article', 'card');
  const body = el('div');
  body.append(
    el('p', 'id', request.id),
    el('h3', '', `${request.requestType} — ${request.location}`),
    el('p', '', request.details),
    el('p', 'meta', `${request.requesterName} · ${request.priority}`),
  );

  const status = el('select', 'status');
  for (const value of ['pending', 'in-progress', 'completed']) {
    const option = el('option', '', value);
    option.value = value;
    option.selected = value === request.status;
    status.append(option);
  }
  status.setAttribute('aria-label', `เปลี่ยนสถานะ ${request.id}`);
  status.addEventListener('change', async () => {
    try {
      await api(`/api/requests/${request.id}`, { method: 'PATCH', body: JSON.stringify({ status: status.value }) });
      setMessage(`อัปเดต ${request.id} แล้ว`);
    } catch (error) {
      setMessage(error.message, true);
      load();
    }
  });

  const remove = el('button', 'danger', 'ลบ');
  remove.type = 'button';
  remove.addEventListener('click', async () => {
    try {
      await api(`/api/requests/${request.id}`, { method: 'DELETE' });
      setMessage(`ลบ ${request.id} แล้ว`);
      load();
    } catch (error) {
      setMessage(error.message, true);
    }
  });

  const actions = el('div', 'actions');
  actions.append(status, remove);
  card.append(body, actions);
  return card;
}

async function load() {
  setMessage('กำลังโหลดข้อมูล…');
  els.list.replaceChildren();
  try {
    const query = els.filter.value ? `?status=${encodeURIComponent(els.filter.value)}` : '';
    const requests = await api(`/api/requests${query}`);
    if (requests.length === 0) {
      setMessage('ไม่มีคำร้องที่ตรงกับเงื่อนไข');
      return;
    }
    els.list.append(...requests.map(renderCard));
    setMessage(`พบ ${requests.length} รายการ`);
  } catch (error) {
    setMessage(error.message, true);
  }
}

els.form.addEventListener('submit', async (event) => {
  event.preventDefault();
  els.errors.replaceChildren();
  const data = Object.fromEntries(new FormData(els.form));
  try {
    await api('/api/requests', { method: 'POST', body: JSON.stringify(data) });
    els.form.reset();
    setMessage('เพิ่มคำร้องแล้ว');
    load();
  } catch (error) {
    // แสดง error รายช่องที่ server ตรวจเจอ
    const items = error.details.length ? error.details.map((d) => `${d.field}: ${d.message}`) : [error.message];
    els.errors.append(...items.map((text) => el('li', '', text)));
  }
});

els.filter.addEventListener('change', load);
load();
