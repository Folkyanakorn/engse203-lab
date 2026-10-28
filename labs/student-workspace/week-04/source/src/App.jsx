import { useState } from 'react';
import AppHeader from './components/AppHeader.jsx';
import SummaryPanel from './components/SummaryPanel.jsx';
import RequestForm from './components/RequestForm.jsx';
import FilterBar from './components/FilterBar.jsx';
import RequestList from './components/RequestList.jsx';
import { initialRequests } from './data/initialRequests.js';

function createRequestId(requests) {
  const maxNumber = requests.reduce((max, { id }) => {
    const number = Number(id.replace('REQ-', ''));
    return Number.isNaN(number) ? max : Math.max(max, number);
  }, 0);
  return `REQ-${String(maxNumber + 1).padStart(3, '0')}`;
}

function App() {
  // state เจ้าของข้อมูลหลักอยู่ที่ App
  const [requests, setRequests] = useState(initialRequests);
  const [statusFilter, setStatusFilter] = useState('all');

  // derived data: คำนวณจาก requests จริง ไม่เก็บซ้ำเป็น state
  const summary = {
    total: requests.length,
    pending: requests.filter((request) => request.status === 'pending').length,
    inProgress: requests.filter((request) => request.status === 'in-progress').length,
    completed: requests.filter((request) => request.status === 'completed').length,
  };

  const filteredRequests =
    statusFilter === 'all'
      ? requests
      : requests.filter((request) => request.status === statusFilter);

  function handleAddRequest(requestData) {
    const newRequest = {
      ...requestData,
      id: createRequestId(requests),
      status: 'pending',
    };
    setRequests((currentRequests) => [newRequest, ...currentRequests]);
  }

  function handleDeleteRequest(requestId) {
    setRequests((currentRequests) =>
      currentRequests.filter((request) => request.id !== requestId),
    );
  }

  return (
    <>
      <AppHeader
        title="Campus Service Request"
        subtitle="ระบบแจ้งคำร้องบริการภายในคณะ — State-driven React UI"
      />
      <main className="container page-content">
        <SummaryPanel summary={summary} />
        <div className="workspace-grid">
          <RequestForm onAddRequest={handleAddRequest} />
          <section className="panel" aria-labelledby="request-list-title">
            <div className="section-heading">
              <h2 id="request-list-title">รายการคำร้อง</h2>
              <FilterBar value={statusFilter} onFilterChange={setStatusFilter} />
            </div>
            <RequestList
              requests={filteredRequests}
              onDeleteRequest={handleDeleteRequest}
            />
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
