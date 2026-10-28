import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { sampleRequests } from '../test/fixtures.js';
import RequestList from './RequestList.jsx';

const renderList = (props) => render(<MemoryRouter><RequestList {...props} /></MemoryRouter>);

describe('RequestList', () => {
  it('แสดงการ์ดครบทุกรายการ พร้อมลิงก์ไปหน้ารายละเอียด', () => {
    renderList({ requests: sampleRequests, onDeleteRequest: vi.fn() });
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getByRole('link', { name: 'แจ้งซ่อม' })).toHaveAttribute('href', '/requests/REQ-001');
  });

  it('ไม่มีรายการ -> แสดงข้อความว่าง ไม่แสดงการ์ด', () => {
    renderList({ requests: [], onDeleteRequest: vi.fn() });
    expect(screen.getByText('ไม่มีคำร้องที่ตรงกับตัวกรองนี้')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });

  it('กดลบส่ง id ที่ถูกต้องให้ parent', async () => {
    const onDelete = vi.fn();
    renderList({ requests: sampleRequests, onDeleteRequest: onDelete });
    await userEvent.click(screen.getByRole('button', { name: 'ลบคำร้อง REQ-002' }));
    expect(onDelete).toHaveBeenCalledWith('REQ-002');
  });

  it('ข้อความจากผู้ใช้ถูกแสดงเป็นข้อความ ไม่ถูกตีความเป็น HTML', () => {
    const evil = { ...sampleRequests[0], details: '<img src=x onerror=alert(1)>' };
    const { container } = renderList({ requests: [evil], onDeleteRequest: vi.fn() });
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
  });
});
