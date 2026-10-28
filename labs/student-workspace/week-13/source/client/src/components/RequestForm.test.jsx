import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import RequestForm from './RequestForm.jsx';

async function fillValid(user) {
  await user.type(screen.getByLabelText('ชื่อผู้แจ้ง'), 'ญาณากร');
  await user.selectOptions(screen.getByLabelText('ประเภทคำร้อง'), 'แจ้งซ่อม');
  await user.type(screen.getByLabelText('สถานที่'), 'ห้อง 301');
  await user.type(screen.getByLabelText('รายละเอียด'), 'โปรเจกเตอร์เปิดไม่ติด');
}

describe('RequestForm', () => {
  it('ส่งว่าง -> แสดง error ทุกช่อง, ตั้ง aria-invalid และไม่เรียก onAddRequest', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<RequestForm onAddRequest={onAdd} />);
    await user.click(screen.getByRole('button', { name: 'เพิ่มคำร้อง' }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByText('กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร')).toBeInTheDocument();
    expect(screen.getByText('กรุณาเลือกประเภทคำร้อง')).toBeInTheDocument();
    expect(screen.getByLabelText('ชื่อผู้แจ้ง')).toHaveAttribute('aria-invalid', 'true');
  });

  it('รายละเอียดสั้นกว่า 10 ตัวอักษร -> ไม่ผ่าน', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<RequestForm onAddRequest={onAdd} />);
    await user.type(screen.getByLabelText('ชื่อผู้แจ้ง'), 'ญาณากร');
    await user.selectOptions(screen.getByLabelText('ประเภทคำร้อง'), 'แจ้งซ่อม');
    await user.type(screen.getByLabelText('สถานที่'), 'ห้อง 301');
    await user.type(screen.getByLabelText('รายละเอียด'), 'สั้น');
    await user.click(screen.getByRole('button', { name: 'เพิ่มคำร้อง' }));
    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByText(/อย่างน้อย 10 ตัวอักษร/)).toBeInTheDocument();
  });

  it('ข้อมูลถูกต้อง -> ส่งข้อมูลให้ parent และรีเซ็ตฟอร์ม', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<RequestForm onAddRequest={onAdd} />);
    await fillValid(user);
    await user.click(screen.getByLabelText('เร่งด่วน'));
    await user.click(screen.getByRole('button', { name: 'เพิ่มคำร้อง' }));

    expect(onAdd).toHaveBeenCalledWith({
      requesterName: 'ญาณากร', requestType: 'แจ้งซ่อม', location: 'ห้อง 301', details: 'โปรเจกเตอร์เปิดไม่ติด', priority: 'urgent',
    });
    expect(await screen.findByText('บันทึกคำร้องแล้ว')).toBeInTheDocument();
    expect(screen.getByLabelText('ชื่อผู้แจ้ง')).toHaveValue('');
  });

  it('API ปฏิเสธ -> แสดงข้อความ error และ "ไม่" รีเซ็ตฟอร์ม', async () => {
    const onAdd = vi.fn().mockRejectedValue(new Error('บันทึกไม่ได้ ลองใหม่ภายหลัง'));
    const user = userEvent.setup();
    render(<RequestForm onAddRequest={onAdd} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'เพิ่มคำร้อง' }));
    expect(await screen.findByText('บันทึกไม่ได้ ลองใหม่ภายหลัง')).toBeInTheDocument();
    expect(screen.getByLabelText('ชื่อผู้แจ้ง')).toHaveValue('ญาณากร');
  });

  it('ปุ่มถูกปิดระหว่างบันทึก กันกดซ้ำ', async () => {
    let finish;
    const onAdd = vi.fn(() => new Promise((resolve) => { finish = resolve; }));
    const user = userEvent.setup();
    render(<RequestForm onAddRequest={onAdd} />);
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: 'เพิ่มคำร้อง' }));
    expect(await screen.findByRole('button', { name: 'กำลังบันทึก…' })).toBeDisabled();
    finish();
    expect(await screen.findByRole('button', { name: 'เพิ่มคำร้อง' })).toBeEnabled();
  });
});
