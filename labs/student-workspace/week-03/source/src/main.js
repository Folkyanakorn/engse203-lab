import './style.css';

const form = document.querySelector('#request-form');
const statusEl = document.querySelector('#form-status');
const requestList = document.querySelector('#request-list');
const preview = {
  name: document.querySelector('#preview-name'),
  type: document.querySelector('#preview-type'),
  details: document.querySelector('#preview-details'),
};
const errorEls = {
  name: document.querySelector('#requester-name-error'),
  type: document.querySelector('#request-type-error'),
  details: document.querySelector('#request-details-error'),
};
const inputEls = {
  name: document.querySelector('#requester-name'),
  type: document.querySelector('#request-type'),
  details: document.querySelector('#request-details'),
};

const PLACEHOLDERS = {
  name: 'ยังไม่ระบุชื่อ',
  type: 'ยังไม่เลือกประเภท',
  details: 'ยังไม่มีรายละเอียด',
};

function readForm() {
  const data = new FormData(form);
  return {
    name: String(data.get('requesterName') ?? '').trim(),
    type: String(data.get('requestType') ?? ''),
    details: String(data.get('details') ?? '').trim(),
  };
}

function renderPreview({ name, type, details }) {
  preview.name.textContent = name || PLACEHOLDERS.name;
  preview.type.textContent = type || PLACEHOLDERS.type;
  preview.details.textContent = details || PLACEHOLDERS.details;
}

function validate({ name, type, details }) {
  const errors = {};
  if (name.length < 2) errors.name = 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร';
  if (!type) errors.type = 'กรุณาเลือกประเภทคำขอ';
  if (details.length < 10) errors.details = 'กรุณาอธิบายรายละเอียดอย่างน้อย 10 ตัวอักษร';
  return errors;
}

function renderErrors(errors) {
  for (const key of Object.keys(errorEls)) {
    const message = errors[key] ?? '';
    errorEls[key].textContent = message;
    inputEls[key].setAttribute('aria-invalid', message ? 'true' : 'false');
  }
}

function addRequestToList({ name, type, details }) {
  const item = document.createElement('li');
  const title = document.createElement('strong');
  title.textContent = `${type} — ${name}`;
  const body = document.createElement('p');
  body.textContent = details;
  item.append(title, body);
  requestList.prepend(item);
}

form.addEventListener('input', () => {
  renderPreview(readForm());
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = readForm();
  const errors = validate(data);
  renderErrors(errors);

  if (Object.keys(errors).length > 0) {
    statusEl.textContent = 'กรุณาแก้ไขข้อมูลที่ไม่ถูกต้อง';
    statusEl.className = 'status status-error';
    inputEls[Object.keys(errors)[0]].focus();
    return;
  }

  addRequestToList(data);
  form.reset();
  renderPreview(readForm());
  statusEl.textContent = 'ส่งคำขอเรียบร้อยแล้ว';
  statusEl.className = 'status status-success';
});
