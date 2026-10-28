import { getStatusLabel } from "./utils.js";

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

/**
 * แสดงข้อความสถานะ (loading / success / error)
 */
export function setMessage(element, type, text) {
  element.className = `message ${type}`;
  element.textContent = text;
}

/**
 * แสดง summary card 4 ใบ: Total, To do, In progress, Done
 */
export function renderStats(element, { total, todo, doing, done }) {
  const items = [
    ["Total", total],
    ["To do", todo],
    ["In progress", doing],
    ["Done", done],
  ];

  element.replaceChildren(
    ...items.map(([label, value]) => {
      const card = createElement("article", "stat-card");
      card.append(createElement("strong", "", String(value)), createElement("span", "", label));
      return card;
    }),
  );
}

/**
 * แสดงรายการ task เป็นการ์ด และแสดง empty state เมื่อไม่มีรายการ
 */
export function renderTasks(element, tasks) {
  if (tasks.length === 0) {
    element.replaceChildren(
      createElement("p", "empty-state", "ไม่พบรายการที่ตรงกับเงื่อนไขที่เลือก"),
    );
    return;
  }

  element.replaceChildren(
    ...tasks.map(({ week, title, topic, status, tags = [] }) => {
      const card = createElement("article", "task-card");

      const meta = createElement("div", "task-meta");
      meta.append(
        createElement("span", "", `Week ${week}`),
        createElement("span", `badge ${status}`, getStatusLabel(status)),
      );

      const tagList = createElement("div", "tags");
      tagList.append(...tags.map((tag) => createElement("span", "tag", tag)));

      card.append(meta, createElement("h3", "", title), createElement("p", "", topic), tagList);
      return card;
    }),
  );
}
