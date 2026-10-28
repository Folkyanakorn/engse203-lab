/**
 * โหลดรายการ learning tasks จากไฟล์ JSON ใน public/data
 * @param {{ simulateError?: boolean }} options
 * @returns {Promise<Array>} รายการ task
 */
export async function fetchLearningTasks({ simulateError = false } = {}) {
  if (simulateError) {
    throw new Error("จำลองข้อผิดพลาด: ไม่สามารถโหลดข้อมูลได้ (simulateError=1)");
  }

  const url = `${import.meta.env.BASE_URL}data/learning-tasks.json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`โหลดข้อมูลไม่สำเร็จ (HTTP ${response.status})`);
  }

  return await response.json();
}
