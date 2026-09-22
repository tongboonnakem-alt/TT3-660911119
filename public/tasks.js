const form = document.querySelector('#task-form');
const input = document.querySelector('#task-input');
const list = document.querySelector('#task-list');
const statusText = document.querySelector('#task-status');
const filters = [...document.querySelectorAll('[data-filter]')];
let currentFilter = 'all';

function setStatus(text = '', error = false) {
  statusText.textContent = text;
  statusText.classList.toggle('error', error);
}

async function api(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

function render(tasks) {
  list.innerHTML = '';
  if (!tasks.length) {
    const empty = document.createElement('li');
    empty.className = 'task-empty';
    empty.textContent = 'ยังไม่มีรายการในหมวดนี้';
    list.appendChild(empty);
    return;
  }
  tasks.forEach((task) => {
    const item = document.createElement('li');
    item.className = task.done ? 'done' : '';
    const toggle = document.createElement('button');
    toggle.type = 'button'; toggle.className = 'task-toggle'; toggle.textContent = task.done ? '✓' : '';
    toggle.setAttribute('aria-label', `${task.done ? 'เปลี่ยนเป็นกำลังพัฒนา' : 'เปลี่ยนเป็นเสร็จแล้ว'}: ${task.text}`);
    toggle.addEventListener('click', () => changeStatus(task.id));
    const text = document.createElement('span'); text.textContent = task.text;
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'task-delete'; remove.textContent = 'ลบ';
    remove.setAttribute('aria-label', `ลบ: ${task.text}`); remove.addEventListener('click', () => deleteTask(task.id));
    item.append(toggle, text, remove); list.appendChild(item);
  });
}

async function loadTasks() {
  try {
    setStatus('กำลังโหลด...');
    const query = currentFilter === 'all' ? '' : `?done=${currentFilter}`;
    const tasks = await api(`/api/tasks${query}`);
    render(tasks); setStatus(`แสดง ${tasks.length} รายการ`);
  } catch (error) { setStatus(`โหลดข้อมูลไม่สำเร็จ: ${error.message}`, true); }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); const text = input.value.trim(); if (!text) return;
  try {
    await api('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
    input.value = ''; input.focus(); await loadTasks();
  } catch (error) { setStatus(`เพิ่มรายการไม่สำเร็จ: ${error.message}`, true); }
});

async function changeStatus(id) {
  try { await api(`/api/tasks/${id}`, { method: 'PATCH' }); await loadTasks(); }
  catch (error) { setStatus(`เปลี่ยนสถานะไม่สำเร็จ: ${error.message}`, true); }
}
async function deleteTask(id) {
  try { await api(`/api/tasks/${id}`, { method: 'DELETE' }); await loadTasks(); }
  catch (error) { setStatus(`ลบรายการไม่สำเร็จ: ${error.message}`, true); }
}
filters.forEach((button) => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter;
  filters.forEach((item) => item.classList.toggle('active', item === button));
  loadTasks();
}));
loadTasks();
