import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { jsonResponse, sampleRequests } from '../test/fixtures.js';
import { addRequest, deleteRequest, getRequestById, getRequests, resetRequests } from './requestService.js';

let fetchMock;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe('getRequests', () => {
  it('เรียก GET /api/requests และคืนรายการ', async () => {
    fetchMock.mockResolvedValue(jsonResponse(sampleRequests));
    expect(await getRequests()).toHaveLength(3);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/requests?limit=100');
  });

  it("scenario 'error' โยน error และ 'empty' คืน [] โดยไม่เรียกเครือข่าย", async () => {
    await expect(getRequests({ scenario: 'error' })).rejects.toThrow(/จำลอง/);
    expect(await getRequests({ scenario: 'empty' })).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('เครือข่ายล่ม -> ข้อความที่ผู้ใช้เข้าใจ', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(getRequests()).rejects.toThrow('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
  });

  it('server 500 -> ใช้ message จาก error format ของ API', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { code: 'INTERNAL_ERROR', message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' } }, 500));
    await expect(getRequests()).rejects.toThrow('เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์');
  });

  it('response ที่ไม่ใช่ JSON ก็ไม่ทำให้พัง', async () => {
    fetchMock.mockResolvedValue(new Response('<html>bad gateway</html>', { status: 502 }));
    await expect(getRequests()).rejects.toThrow('502');
  });
});

describe('getRequestById', () => {
  it('คืนรายการเมื่อพบ และ encode id ใน URL', async () => {
    // Response อ่าน body ได้ครั้งเดียว จึงต้องสร้างใหม่ทุกครั้งที่ถูกเรียก
    fetchMock.mockImplementation(async () => jsonResponse(sampleRequests[0]));
    expect(await getRequestById('REQ-001')).toMatchObject({ id: 'REQ-001' });
    await getRequestById('a/b');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/requests/a%2Fb');
  });

  it('404 และ 400 -> null (UI แสดงหน้า "ไม่พบ")', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: { message: 'ไม่พบ' } }, 404));
    fetchMock.mockResolvedValueOnce(jsonResponse({ error: { message: 'id ผิดรูปแบบ' } }, 400));
    expect(await getRequestById('REQ-999')).toBeNull();
    expect(await getRequestById('abc')).toBeNull();
  });

  it('500 ยังโยน error ต่อ ไม่กลืนเป็น null', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { message: 'พัง' } }, 500));
    await expect(getRequestById('REQ-001')).rejects.toThrow('พัง');
  });
});

describe('addRequest', () => {
  const input = { requesterName: 'ญาณากร', requestType: 'แจ้งซ่อม', location: 'ห้อง 301', details: 'โปรเจกเตอร์เปิดไม่ติด', priority: 'normal' };

  it('POST JSON ถูกต้อง', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'REQ-NEW', ...input, status: 'pending' }, 201));
    const created = await addRequest(input);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/requests');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual(input);
    expect(created.id).toBe('REQ-NEW');
  });

  it('422 -> รวม details รายช่องในข้อความ error และเก็บ status', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { message: 'ข้อมูลไม่ผ่านการตรวจสอบ', details: [{ field: 'details', message: 'ต้องมีอย่างน้อย 10 ตัวอักษร' }] } }, 422));
    const error = await addRequest(input).catch((e) => e);
    expect(error.message).toBe('ข้อมูลไม่ผ่านการตรวจสอบ — details: ต้องมีอย่างน้อย 10 ตัวอักษร');
    expect(error.status).toBe(422);
  });
});

describe('deleteRequest / resetRequests', () => {
  it('ลบด้วย DELETE แล้วดึงรายการล่าสุด', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(null, 204)).mockResolvedValueOnce(jsonResponse(sampleRequests.slice(1)));
    const result = await deleteRequest('REQ-001');
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
    expect(result).toHaveLength(2);
  });

  it('ลบรายการที่ไม่มี (404) -> โยน error', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { message: 'ไม่พบคำร้อง' } }, 404));
    await expect(deleteRequest('REQ-999')).rejects.toThrow('ไม่พบคำร้อง');
  });

  it('reset เรียก POST /api/demo/reset แล้วดึงรายการ', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ message: 'reset แล้ว' })).mockResolvedValueOnce(jsonResponse(sampleRequests));
    expect(await resetRequests()).toHaveLength(3);
    expect(fetchMock.mock.calls[0][0]).toBe('/api/demo/reset');
  });

  it('reset ถูกปิดอยู่ (403) -> โยน error ที่อ่านเข้าใจ', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { code: 'FORBIDDEN', message: 'ปิดการรีเซ็ตข้อมูลตัวอย่างอยู่' } }, 403));
    await expect(resetRequests()).rejects.toThrow('ปิดการรีเซ็ต');
  });
});
