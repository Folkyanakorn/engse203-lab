import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState.jsx';
import FilterBar from '../components/FilterBar.jsx';
import LoadingState from '../components/LoadingState.jsx';
import RequestList from '../components/RequestList.jsx';
import SummaryPanel from '../components/SummaryPanel.jsx';
import useManualReload from '../hooks/useManualReload.js';
import { deleteRequest, getRequests, resetRequests } from '../services/requestService.js';

function readErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback;
}

function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const scenario = searchParams.get('scenario') ?? '';
  const [reloadKey, reload] = useManualReload();

  const [loadState, setLoadState] = useState('idle');
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    // guard กัน stale update: ถ้า Effect ถูก cleanup แล้ว (เปลี่ยน scenario/ออกจากหน้า)
    // ผลลัพธ์ของ request เก่าต้องไม่ถูกนำมา setState
    let ignore = false;

    setLoadState('loading');
    setErrorMessage('');
    setNotice('');

    getRequests({
      scenario,
      onRecovery: (message) => {
        if (!ignore) setNotice(message);
      },
    })
      .then((data) => {
        if (ignore) return;
        setRequests(data);
        setLoadState('success');
      })
      .catch((error) => {
        if (ignore) return;
        setErrorMessage(readErrorMessage(error, 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'));
        setLoadState('error');
      });

    return () => {
      ignore = true;
    };
  }, [scenario, reloadKey]);

  const summary = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((request) => request.status === 'pending').length,
    inProgress: requests.filter((request) => request.status === 'in-progress').length,
    completed: requests.filter((request) => request.status === 'completed').length,
  }), [requests]);

  const filteredRequests = statusFilter === 'all'
    ? requests
    : requests.filter((request) => request.status === statusFilter);

  function handleRetry() {
    if (scenario) setSearchParams({});
    else reload();
  }

  async function handleDelete(requestId) {
    try {
      const updated = await deleteRequest(requestId);
      setRequests(updated);
      setNotice(`ลบคำร้อง ${requestId} แล้ว`);
    } catch (error) {
      setNotice(readErrorMessage(error, 'ลบคำร้องไม่สำเร็จ'));
    }
  }

  async function handleReset() {
    try {
      const seed = await resetRequests();
      setRequests(seed);
      setStatusFilter('all');
      setNotice('คืนค่าข้อมูลตัวอย่างเริ่มต้นแล้ว');
    } catch (error) {
      setNotice(readErrorMessage(error, 'คืนค่าข้อมูลตัวอย่างไม่สำเร็จ'));
    }
  }

  return (
    <section data-testid="page-dashboard">
      <div className="page-heading">
        <div>
          <p className="eyebrow dark">ROUTED · READ + WRITE PATH</p>
          <h1>Dashboard</h1>
          <p>ติดตามคำร้องจาก URL, Service Layer และ browser storage</p>
        </div>
        <button
          className="button"
          data-testid="reset-button"
          type="button"
          onClick={handleReset}
          disabled={loadState === 'loading'}
        >
          Reset Demo Data
        </button>
      </div>

      {scenario && <p className="lab-scenario" role="status">LAB test scenario: {scenario}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}

      {loadState === 'loading' && <LoadingState />}
      {loadState === 'error' && <ErrorState message={errorMessage} onRetry={handleRetry} />}

      {loadState === 'success' && requests.length === 0 && (
        <section className="state-card" data-testid="empty-state">
          <h2>ยังไม่มีคำร้อง</h2>
          <p>เริ่มสร้างคำร้องแรกของคุณได้เลย</p>
          <Link className="button primary inline" to="/requests/new">สร้างคำร้องใหม่</Link>
        </section>
      )}

      {loadState === 'success' && requests.length > 0 && (
        <>
          <SummaryPanel summary={summary} />
          <section className="panel" aria-labelledby="request-list-title">
            <div className="section-heading">
              <h2 id="request-list-title">รายการคำร้อง</h2>
              <FilterBar value={statusFilter} onFilterChange={setStatusFilter} />
            </div>
            <RequestList requests={filteredRequests} onDeleteRequest={handleDelete} />
          </section>
        </>
      )}
    </section>
  );
}

export default DashboardPage;
