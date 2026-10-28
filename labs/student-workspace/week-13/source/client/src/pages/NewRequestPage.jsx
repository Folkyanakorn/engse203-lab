import { useNavigate } from 'react-router-dom';
import RequestForm from '../components/RequestForm.jsx';
import { addRequest } from '../services/requestService.js';

function NewRequestPage() {
  const navigate = useNavigate();

  async function handleAddRequest(input) {
    const created = await addRequest(input);
    navigate(`/requests/${created.id}`);
  }

  return (
    <section data-testid="page-new-request">
      <div className="page-heading">
        <div>
          <p className="eyebrow dark">ROUTED · WRITE PATH</p>
          <h1>สร้างคำร้องใหม่</h1>
          <p>กรอกข้อมูลให้ครบ ระบบจะบันทึกและพาไปหน้ารายละเอียด</p>
        </div>
      </div>
      <section className="panel form-panel">
        <RequestForm onAddRequest={handleAddRequest} />
      </section>
    </section>
  );
}

export default NewRequestPage;
