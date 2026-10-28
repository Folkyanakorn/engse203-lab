const STATUS_LABELS = {
  todo: "To do",
  doing: "In progress",
  done: "Done",
};

export const getStatusLabel = (status) => STATUS_LABELS[status] ?? "Unknown";

/**
 * กรอง task ตามคำค้น (ชื่อ/หัวข้อ/tag) และสถานะ โดยไม่แก้ array ต้นฉบับ
 */
export function filterTasks(tasks, { query = "", status = "all" } = {}) {
  const keyword = query.trim().toLowerCase();

  return tasks.filter(({ title, topic, tags = [], status: taskStatus }) => {
    const matchesStatus = status === "all" || taskStatus === status;
    const matchesQuery =
      keyword === "" ||
      [title, topic, ...tags].some((text) => text.toLowerCase().includes(keyword));
    return matchesStatus && matchesQuery;
  });
}

/**
 * สรุปจำนวน task ทั้งหมดและแยกตามสถานะ
 */
export function getStats(tasks) {
  return tasks.reduce(
    (summary, { status }) => ({
      ...summary,
      total: summary.total + 1,
      [status]: (summary[status] ?? 0) + 1,
    }),
    { total: 0, todo: 0, doing: 0, done: 0 },
  );
}
