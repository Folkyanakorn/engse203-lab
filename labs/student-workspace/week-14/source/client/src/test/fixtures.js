export const sampleRequests = [
  { id: 'REQ-001', requesterName: 'สมชาย ใจดี', requestType: 'แจ้งซ่อม', location: 'ห้อง 301', details: 'เครื่องปรับอากาศไม่ทำงาน', priority: 'urgent', status: 'pending' },
  { id: 'REQ-002', requesterName: 'สุภาวดี รักเรียน', requestType: 'บริการบัญชีผู้ใช้', location: 'อาคาร SE', details: 'เข้าสู่ระบบไม่ได้เลย', priority: 'normal', status: 'in-progress' },
  { id: 'REQ-003', requesterName: 'กิตติพงษ์ ตั้งใจ', requestType: 'ขอใช้ห้อง', location: 'ห้องประชุม 2', details: 'ขอใช้ห้องทำกิจกรรมกลุ่ม', priority: 'normal', status: 'completed' },
];

export const jsonResponse = (body, status = 200) =>
  new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
