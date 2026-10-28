import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sampleRequests } from '../test/fixtures.js';
import DashboardPage from './DashboardPage.jsx';
import * as service from '../services/requestService.js';

vi.mock('../services/requestService.js');

const renderPage = (route = '/') =>
  render(<MemoryRouter initialEntries={[route]}><DashboardPage /></MemoryRouter>);

beforeEach(() => {
  vi.resetAllMocks();
  service.getRequests.mockResolvedValue(structuredClone(sampleRequests));
});

describe('DashboardPage', () => {
  it('แสดง loading ก่อน แล้วแสดงรายการและ summary ที่คำนวณจากข้อมูล', async () => {
    renderPage();
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(await screen.findByTestId('request-list')).toBeInTheDocument();
    expect(within(screen.getByTestId('request-list')).getAllByRole('article')).toHaveLength(3);
    const summary = screen.getByLabelText('สรุปคำร้อง');
    expect(within(summary).getByText('ทั้งหมด').parentElement).toHaveTextContent('3');
  });

  it('ข้อมูลว่าง -> empty state พร้อมลิงก์สร้างคำร้อง', async () => {
    service.getRequests.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'สร้างคำร้องใหม่' })).toHaveAttribute('href', '/requests/new');
  });

  it('โหลดไม่สำเร็จ -> error state และกด retry แล้วโหลดใหม่สำเร็จ', async () => {
    service.getRequests.mockRejectedValueOnce(new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้'));
    renderPage();
    expect(await screen.findByTestId('error-state')).toHaveTextContent('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    await userEvent.click(screen.getByTestId('retry-button'));
    expect(await screen.findByTestId('request-list')).toBeInTheDocument();
    expect(service.getRequests).toHaveBeenCalledTimes(2);
  });

  it('กรองตามสถานะ', async () => {
    renderPage();
    await screen.findByTestId('request-list');
    await userEvent.click(screen.getByRole('button', { name: 'เสร็จสิ้น' }));
    const list = screen.getByTestId('request-list');
    expect(within(list).getAllByRole('article')).toHaveLength(1);
    expect(within(list).getByText('REQ-003')).toBeInTheDocument();
  });

  it('ลบผ่าน service แล้วอัปเดตรายการด้วยข้อมูลที่ server คืนมา', async () => {
    service.deleteRequest.mockResolvedValue(sampleRequests.slice(1));
    renderPage();
    await screen.findByTestId('request-list');
    await userEvent.click(screen.getByRole('button', { name: 'ลบคำร้อง REQ-001' }));
    await waitFor(() => expect(screen.queryByText('REQ-001')).not.toBeInTheDocument());
    expect(service.deleteRequest).toHaveBeenCalledWith('REQ-001');
    expect(screen.getByText('ลบคำร้อง REQ-001 แล้ว')).toBeInTheDocument();
  });

  it('ลบไม่สำเร็จ -> แจ้งข้อความ และรายการเดิมยังอยู่', async () => {
    service.deleteRequest.mockRejectedValue(new Error('ลบไม่ได้'));
    renderPage();
    await screen.findByTestId('request-list');
    await userEvent.click(screen.getByRole('button', { name: 'ลบคำร้อง REQ-001' }));
    expect(await screen.findByText('ลบไม่ได้')).toBeInTheDocument();
    expect(screen.getByText('REQ-001')).toBeInTheDocument();
  });

  it('ใช้ scenario จาก URL (?scenario=error)', async () => {
    renderPage('/?scenario=error');
    await screen.findByTestId('request-list');
    expect(service.getRequests).toHaveBeenCalledWith({ scenario: 'error' });
  });

  it('ผลของ request เก่าไม่ทับผลใหม่ (stale guard) เมื่อ unmount ก่อนโหลดเสร็จ', async () => {
    let resolve;
    service.getRequests.mockReturnValue(new Promise((r) => { resolve = r; }));
    const { unmount } = renderPage();
    unmount();
    resolve(sampleRequests); // ต้องไม่ error / warning จาก setState หลัง unmount
    await Promise.resolve();
    expect(service.getRequests).toHaveBeenCalledTimes(1);
  });
});
