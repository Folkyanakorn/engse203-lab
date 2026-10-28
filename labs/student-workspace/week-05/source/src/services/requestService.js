/**
 * requestService.js — ชั้นเข้าถึงข้อมูล
 */

import { clearStoredRequests, readStoredRequests, writeStoredRequests } from './requestStorage.js';

const LAB_DELAY_MS = 420;

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForLabDelay() {
  await delay(globalThis.__ENGSE203_SKIP_DELAY__ ? 0 : LAB_DELAY_MS);
}

async function fetchSeedRequests() {
  const baseUrl = import.meta.env?.BASE_URL ?? '/';
  const response = await fetch(`${baseUrl}data/initialRequests.json`);
  if (!response.ok) throw new Error('ไม่สามารถโหลดข้อมูลตัวอย่างได้');
  return structuredClone(await response.json());
}

export async function getRequests(options = {}) {
  await waitForLabDelay();

  if (options.scenario === 'error') {
    throw new Error('LAB scenario: จำลองการโหลดข้อมูลไม่สำเร็จ');
  }
  if (options.scenario === 'empty') {
    return [];
  }

  return loadNormalRequests(options.onRecovery);
}

export async function getRequestById(requestId) {
  const requests = await getRequests();
  return requests.find((request) => request.id === requestId) ?? null;
}

async function loadNormalRequests(onRecovery) {
  const stored = readStoredRequests();

  if (stored.status === 'valid') {
    return stored.requests;
  }

  if (stored.status === 'invalid') {
    onRecovery?.('ข้อมูลใน LocalStorage ชำรุด ระบบได้ทำการรีเซ็ตเป็นข้อมูลเริ่มต้นแล้ว');
  }

  const seedRequests = await fetchSeedRequests();
  writeStoredRequests(seedRequests);
  return seedRequests;
}

function readText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateRequestInput(input) {
  if (!input) throw new Error('ข้อมูลคำร้องไม่ถูกต้อง');
  if (readText(input.requesterName).length < 2) throw new Error('ชื่อผู้แจ้งไม่ถูกต้อง');
  if (!readText(input.requestType)) throw new Error('กรุณาเลือกประเภทคำร้อง');
  if (!readText(input.location)) throw new Error('กรุณาระบุสถานที่');
  if (readText(input.details).length < 10) throw new Error('รายละเอียดต้องมีอย่างน้อย 10 ตัวอักษร');
  if (!['normal', 'urgent'].includes(input.priority)) throw new Error('ความเร่งด่วนไม่ถูกต้อง');
}

function createRequestId(requests) {
  let id;
  do {
    const time = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    id = `REQ-${time}-${random}`;
  } while (requests.some((request) => request.id === id));
  return id;
}

export async function addRequest(requestInput) {
  await waitForLabDelay();
  validateRequestInput(requestInput);

  const requests = await getRequests();
  const newRequest = {
    id: createRequestId(requests),
    requesterName: requestInput.requesterName.trim(),
    requestType: requestInput.requestType.trim(),
    location: requestInput.location.trim(),
    details: requestInput.details.trim(),
    priority: requestInput.priority,
    status: 'pending',
  };

  writeStoredRequests([...requests, newRequest]);
  return structuredClone(newRequest);
}

export async function deleteRequest(requestId) {
  await waitForLabDelay();

  const currentRequests = await getRequests();
  const updatedRequests = currentRequests.filter((r) => r.id !== requestId);

  writeStoredRequests(updatedRequests);
  return structuredClone(updatedRequests);
}

export async function resetRequests() {
  await waitForLabDelay();

  clearStoredRequests();
  const seedData = await fetchSeedRequests();
  writeStoredRequests(seedData);

  return seedData;
}