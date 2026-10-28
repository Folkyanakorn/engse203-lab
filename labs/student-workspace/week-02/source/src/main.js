import "./style.css";
import { fetchLearningTasks } from "./api.js";
import { filterTasks, getStats } from "./utils.js";
import { renderStats, renderTasks, setMessage } from "./ui.js";

const elements = {
  message: document.querySelector("#app-message"),
  stats: document.querySelector("#stats"),
  search: document.querySelector("#search"),
  statusFilter: document.querySelector("#status-filter"),
  taskList: document.querySelector("#task-list"),
};

const state = {
  tasks: [],
  query: "",
  status: "all",
};

function render() {
  const visibleTasks = filterTasks(state.tasks, {
    query: state.query,
    status: state.status,
  });
  renderStats(elements.stats, getStats(state.tasks));
  renderTasks(elements.taskList, visibleTasks);
}

async function loadDashboard() {
  const simulateError = new URLSearchParams(window.location.search).get("simulateError") === "1";

  setMessage(elements.message, "loading", "กำลังโหลดข้อมูล...");

  try {
    state.tasks = await fetchLearningTasks({ simulateError });
    render();
    setMessage(elements.message, "success", `โหลดข้อมูลสำเร็จ ${state.tasks.length} รายการ`);
  } catch (error) {
    console.error(error);
    state.tasks = [];
    render();
    setMessage(elements.message, "error", `เกิดข้อผิดพลาด: ${error.message}`);
  } finally {
    elements.search.disabled = false;
    elements.statusFilter.disabled = false;
  }
}

elements.search.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

elements.statusFilter.addEventListener("change", (event) => {
  state.status = event.target.value;
  render();
});

loadDashboard();
