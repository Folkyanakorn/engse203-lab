import { describe, expect, it } from 'vitest';
import { AppError } from '../src/errors/AppError.js';
import { parseCreate, parseListQuery, parsePatch, parseReplace } from '../src/validators/requestValidator.js';
import { errorHandler, notFound } from '../src/middleware/errorHandler.js';
import { validateId } from '../src/middleware/validateId.js';

const valid = {
  requesterName: '  ญาณากร ',
  requestType: 'แจ้งซ่อม',
  location: ' ห้อง 301 ',
  details: ' โปรเจกเตอร์เปิดไม่ติด ',
  priority: 'normal',
};

const catchError = (fn) => {
  try { fn(); } catch (error) { return error; }
  return null;
};

describe('parseCreate', () => {
  it('trim และคืนเฉพาะ field ที่รู้จัก (ตัด field แปลกปลอม/status/id)', () => {
    const data = parseCreate({ ...valid, status: 'completed', id: 'REQ-X', isAdmin: true });
    expect(data).toEqual({
      requesterName: 'ญาณากร', requestType: 'แจ้งซ่อม', location: 'ห้อง 301', details: 'โปรเจกเตอร์เปิดไม่ติด', priority: 'normal',
    });
  });

  it.each([null, undefined, 'text', 42, []])('body %j -> 400', (body) => {
    const error = catchError(() => parseCreate(body));
    expect(error).toBeInstanceOf(AppError);
    expect(error.status).toBe(400);
  });

  it('ขาดทุก field -> 422 พร้อมรายการครบ 5 ช่อง', () => {
    const error = catchError(() => parseCreate({}));
    expect(error.status).toBe(422);
    expect(error.details.map((d) => d.field)).toEqual(['requesterName', 'requestType', 'location', 'details', 'priority']);
  });

  it('ชนิดข้อมูลผิด (ตัวเลข/object แทน string) ไม่ทำให้ระบบพัง', () => {
    const error = catchError(() => parseCreate({ ...valid, requesterName: 123, location: { a: 1 }, details: ['x'] }));
    expect(error.status).toBe(422);
  });

  it('ขอบเขตของความยาว: ชื่อ 1 ตัวไม่ผ่าน 2 ตัวผ่าน, details 9 ไม่ผ่าน 10 ผ่าน', () => {
    expect(catchError(() => parseCreate({ ...valid, requesterName: 'ก' })).status).toBe(422);
    expect(catchError(() => parseCreate({ ...valid, requesterName: 'กข' }))).toBeNull();
    expect(catchError(() => parseCreate({ ...valid, details: 'x'.repeat(9) })).status).toBe(422);
    expect(catchError(() => parseCreate({ ...valid, details: 'x'.repeat(10) }))).toBeNull();
  });

  it('ช่องว่างล้วนถือว่าว่าง', () => {
    expect(catchError(() => parseCreate({ ...valid, location: '    ' })).status).toBe(422);
  });
});

describe('parseReplace / parsePatch', () => {
  it('replace ต้องมี status ด้วย', () => {
    expect(catchError(() => parseReplace(valid)).details.map((d) => d.field)).toEqual(['status']);
    expect(parseReplace({ ...valid, status: 'completed' }).status).toBe('completed');
  });

  it('patch รับบาง field, ปฏิเสธ body ว่าง/ค่าผิด และไม่รับ field แปลก', () => {
    expect(parsePatch({ status: 'in-progress' })).toEqual({ status: 'in-progress' });
    expect(catchError(() => parsePatch({})).status).toBe(400);
    expect(catchError(() => parsePatch({ unknown: 1 })).status).toBe(400);
    expect(catchError(() => parsePatch({ priority: 'extreme' })).status).toBe(422);
  });
});

describe('parseListQuery', () => {
  it('ค่าเริ่มต้น', () => {
    expect(parseListQuery({})).toEqual({ status: undefined, priority: undefined, q: undefined, limit: 50, offset: 0 });
  });

  it('q ถูก trim และเป็นตัวพิมพ์เล็ก', () => {
    expect(parseListQuery({ q: '  ห้อง ABC ' }).q).toBe('ห้อง abc');
  });

  it.each([['limit', '0'], ['limit', '101'], ['limit', 'abc'], ['limit', '1.5'], ['offset', '-1'], ['status', 'x'], ['priority', 'x']])(
    '%s=%s -> 422',
    (key, value) => {
      expect(catchError(() => parseListQuery({ [key]: value })).status).toBe(422);
    },
  );

  it('query แบบ array (?status=a&status=b) ถูกปฏิเสธ ไม่ทำให้พัง', () => {
    expect(catchError(() => parseListQuery({ status: ['pending', 'completed'] })).status).toBe(422);
  });
});

describe('middleware', () => {
  const makeRes = () => {
    const res = { statusCode: 0, body: null };
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (body) => { res.body = body; return res; };
    return res;
  };

  it('errorHandler: error ที่ไม่รู้จัก -> 500 และไม่เปิดเผยข้อความภายใน', () => {
    const res = makeRes();
    const original = console.error;
    console.error = () => {};
    errorHandler(new Error('SECRET: db password=abc'), {}, res, () => {});
    console.error = original;
    expect(res.statusCode).toBe(500);
    expect(JSON.stringify(res.body)).not.toMatch(/SECRET|password/);
  });

  it('notFound ระบุ method และ path', () => {
    const res = makeRes();
    notFound({ method: 'GET', originalUrl: '/x' }, res);
    expect(res.body.error.message).toContain('GET /x');
  });

  it('validateId ปฏิเสธรหัสที่ผิดรูปแบบ (เช่น path traversal / SQL)', () => {
    for (const bad of ['../etc/passwd', "REQ-1' OR '1'='1", 'req-001', '']) {
      let received;
      validateId({}, {}, (error) => { received = error; }, bad);
      expect(received?.status, bad).toBe(400);
    }
    let ok = 'unset';
    validateId({}, {}, (error) => { ok = error; }, 'REQ-001');
    expect(ok).toBeUndefined();
  });
});
