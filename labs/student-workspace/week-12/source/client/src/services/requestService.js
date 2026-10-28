/**
 * requestService.js — ชั้นเรียก REST API (แทน localStorage เดิมของ week-05)
 * หน้า (pages) เรียกแต่ไฟล์นี้ ไม่เรียก fetch เองโดยตรง
 *
 * ใช้ path แบบ relative ('/api/...'): ตอน dev ให้ Vite proxy ไปที่ server, ตอน production Express เสิร์ฟทั้งสองอย่างที่ origin เดียว
 */

const API_BASE = import.meta.env?.VITE_API_BASE ?? '';
const LAB_DELAY_MS = 150;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const waitForLabDelay = () => delay(globalThis.__ENGSE203_SKIP_DELAY__ ? 0 : LAB_DELAY_MS);

/** แปลง error response ของ API ({ error: { message, details } }) เป็น Error ที่ผู้ใช้อ่านเข้าใจ */
async function toError(response) {
  const body = await response.json().catch(() => ({}));
  const message = body.error?.message ?? `เซิร์ฟเวอร์ตอบกลับผิดพลาด (${response.status})`;
  const details = Array.isArray(body.error?.details)
    ? body.error.details.map((item) => `${item.field}: ${item.message}`).join(', ')
    : '';
  const error = new Error(details ? `${message} — ${details}` : message);
  error.status = response.status;
  return error;
}

async function callApi(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch {
    throw new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ตรวจว่า API เปิดอยู่');
  }
  if (!response.ok) throw await toError(response);
  return response.status === 204 ? null : response.json();
}

export async function getRequests(options = {}) {
  await waitForLabDelay();
  // scenario ใช้จำลองสถานะ error/empty ของ UI ตอนทดสอบเท่านั้น
  if (options.scenario === 'error') throw new Error('LAB scenario: จำลองการโหลดข้อมูลไม่สำเร็จ');
  if (options.scenario === 'empty') return [];
  return callApi('/api/requests?limit=100');
}

/** คืน null เมื่อไม่พบ (404) แต่ error อื่นยังโยนต่อ */
export async function getRequestById(requestId) {
  await waitForLabDelay();
  try {
    return await callApi(`/api/requests/${encodeURIComponent(requestId)}`);
  } catch (error) {
    if (error.status === 404 || error.status === 400) return null;
    throw error;
  }
}

export async function addRequest(requestInput) {
  await waitForLabDelay();
  return callApi('/api/requests', { method: 'POST', body: JSON.stringify(requestInput) });
}

/** ลบแล้วคืนรายการล่าสุดจากเซิร์ฟเวอร์ */
export async function deleteRequest(requestId) {
  await waitForLabDelay();
  await callApi(`/api/requests/${encodeURIComponent(requestId)}`, { method: 'DELETE' });
  return callApi('/api/requests?limit=100');
}

export async function resetRequests() {
  await waitForLabDelay();
  await callApi('/api/demo/reset', { method: 'POST' });
  return callApi('/api/requests?limit=100');
}
