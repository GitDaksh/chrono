/**
 * ═══════════════════════════════════════════════════════════════
 * CHRONO — Timeline Builder
 * app.js — Complete application logic
 *
 * Architecture:
 *   State → Render → Events (no framework, just clean vanilla JS)
 *   Each section is clearly labeled.
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   1. STATE
═══════════════════════════════════════════════════════════════ */

const State = {
  // Timeline data
  events: [],          // Array of EventObject
  connections: [],     // Array of { fromId, toId }
  nextId: 1,

  // Canvas transform
  panX: 0,             // canvas offset X (px)
  panY: 0,             // canvas offset Y (px)
  zoom: 1,             // scale factor

  // Canvas interaction
  isPanning: false,
  panStartX: 0,
  panStartY: 0,
  panStartMouseX: 0,
  panStartMouseY: 0,

  // Node dragging
  draggingNode: null,  // { id, startX, startMouseX }
  dragHasMoved: false,

  // Connect mode
  connectMode: false,
  connectFromId: null,

  // UI
  openCardId: null,    // which node card is open
  editingId: null,     // for modal edits
  storyIndex: 0,

  // Canvas center reference (viewport center in canvas coords)
  get viewportCenterX() {
    const vw = window.innerWidth, vh = window.innerHeight - 72;
    return (-State.panX + vw / 2) / State.zoom;
  },
  get viewportCenterY() {
    const vw = window.innerWidth, vh = window.innerHeight - 72;
    return (-State.panY + vh / 2) / State.zoom;
  },

  // SNAP
  SNAP_GRID: 40,       // px — horizontal snap grid
  AXIS_Y: 5000,        // canvas center Y (axis position)
  STEM_MIN: 40,        // min stem height
  STEM_MAX: 140,
};

/* EventObject shape:
  {
    id: number,
    title: string,
    desc: string,
    date: string,
    x: number,          // canvas X (along axis)
    side: 'above'|'below',
    stemHeight: number,
  }
*/


/* ═══════════════════════════════════════════════════════════════
   2. DOM REFERENCES
═══════════════════════════════════════════════════════════════ */

const $ = id => document.getElementById(id);
const DOM = {
  canvasWrapper:  $('canvasWrapper'),
  canvas:         $('canvas'),
  axisLine:       $('axisLine'),
  ticksLayer:     $('ticksLayer'),
  connectionsSvg: $('connectionsSvg'),
  nodesLayer:     $('nodesLayer'),

  topbar:         $('topbar'),
  zoomIn:         $('zoomIn'),
  zoomOut:        $('zoomOut'),
  zoomLabel:      $('zoomLabel'),
  addEventBtn:    $('addEventBtn'),
  exportBtn:      $('exportBtn'),
  importBtn:      $('importBtn'),
  importFileInput:$('importFileInput'),
  storyModeBtn:   $('storyModeBtn'),
  timelineName:   $('timelineName'),

  modalOverlay:   $('modalOverlay'),
  modal:          $('modal'),
  modalTitle:     $('modalTitle'),
  modalClose:     $('modalClose'),
  modalCancel:    $('modalCancel'),
  modalSave:      $('modalSave'),
  eventTitle:     $('eventTitle'),
  eventDesc:      $('eventDesc'),
  eventDate:      $('eventDate'),

  contextMenu:    $('contextMenu'),
  connectTooltip: $('connectTooltip'),

  minimap:        $('minimap'),
  minimapCanvas:  $('minimapCanvas'),
  minimapViewport:$('minimapViewport'),
  minimapNodes:   $('minimapNodes'),

  statusMsg:      $('statusMsg'),
  nodeCount:      $('nodeCount'),
  coordDisplay:   $('coordDisplay'),

  storyOverlay:   $('storyOverlay'),
  storyMeta:      $('storyMeta'),
  storyTitle:     $('storyTitle'),
  storyDesc:      $('storyDesc'),
  storyProgress:  $('storyProgress'),
  storyPrev:      $('storyPrev'),
  storyNext:      $('storyNext'),
  storyExit:      $('storyExit'),
};


/* ═══════════════════════════════════════════════════════════════
   3. UTILITY FUNCTIONS
═══════════════════════════════════════════════════════════════ */

function uid() { return State.nextId++; }

/** Apply canvas transform */
function applyTransform() {
  DOM.canvas.style.transform =
    `translate(${State.panX}px, ${State.panY}px) scale(${State.zoom})`;
}

/** Convert viewport (mouse) coords → canvas coords */
function viewportToCanvas(vx, vy) {
  return {
    x: (vx - State.panX) / State.zoom,
    y: (vy - State.panY) / State.zoom,
  };
}

/** Clamp a value */
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

/** Snap x to grid */
function snapX(x) {
  return Math.round(x / State.SNAP_GRID) * State.SNAP_GRID;
}

/** Random int between min and max */
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Find event by id */
function findEvent(id) { return State.events.find(e => e.id === id); }

/** Generate a unique safe position for a new event */
function generateNewEventX() {
  const cx = State.viewportCenterX;
  // spread around viewport center with slight randomness
  const base = snapX(cx + randInt(-160, 160));
  return base;
}

/** Set status bar message */
function setStatus(msg) { DOM.statusMsg.textContent = msg; }

/** Update node count */
function updateNodeCount() {
  const n = State.events.length;
  DOM.nodeCount.textContent = `${n} event${n !== 1 ? 's' : ''}`;
}

/** Update zoom label */
function updateZoomLabel() {
  DOM.zoomLabel.textContent = `${Math.round(State.zoom * 100)}%`;
}

/** Lerp for smooth zoom */
function lerp(a, b, t) { return a + (b - a) * t; }


/* ═══════════════════════════════════════════════════════════════
   4. CANVAS — PAN & ZOOM
═══════════════════════════════════════════════════════════════ */

function initCanvas() {
  // Center the canvas view on the axis
  const vw = window.innerWidth;
  const vh = window.innerHeight - 72;
  // Put canvas center (5000, 5000) at viewport center
  State.panX = vw / 2 - 5000 * State.zoom;
  State.panY = vh / 2 - State.AXIS_Y * State.zoom;
  applyTransform();
  drawTicks();
}

/** Draw axis ticks */
function drawTicks() {
  const frag = document.createDocumentFragment();
  const step = 200; // canvas units between ticks
  for (let i = 0; i <= 50; i++) {
    const x = i * step;
    const tick = document.createElement('div');
    tick.className = 'tick';
    tick.style.left = x + 'px';
    frag.appendChild(tick);
  }
  DOM.ticksLayer.innerHTML = '';
  DOM.ticksLayer.appendChild(frag);
}

// ── Pan ─────────────────────────────────────────────────────

DOM.canvasWrapper.addEventListener('mousedown', onCanvasMouseDown);

function onCanvasMouseDown(e) {
  if (e.target !== DOM.canvasWrapper && e.target !== DOM.canvas &&
      e.target !== DOM.axisLine && e.target !== DOM.ticksLayer &&
      e.target !== DOM.connectionsSvg && !e.target.classList.contains('tick')) return;
  if (e.button !== 0) return;

  closeCard();
  hideContextMenu();

  State.isPanning = true;
  State.panStartX = State.panX;
  State.panStartY = State.panY;
  State.panStartMouseX = e.clientX;
  State.panStartMouseY = e.clientY;
  DOM.canvasWrapper.classList.add('dragging');
}

document.addEventListener('mousemove', onDocMouseMove);
document.addEventListener('mouseup', onDocMouseUp);

function onDocMouseMove(e) {
  // Update coord display
  const c = viewportToCanvas(e.clientX, e.clientY);
  DOM.coordDisplay.textContent = `x: ${Math.round(c.x - 5000)}`;

  if (State.isPanning) {
    const dx = e.clientX - State.panStartMouseX;
    const dy = e.clientY - State.panStartMouseY;
    State.panX = State.panStartX + dx;
    State.panY = State.panStartY + dy;
    applyTransform();
    updateMinimap();
    return;
  }

  if (State.draggingNode !== null) {
    onNodeDragMove(e);
  }
}

function onDocMouseUp(e) {
  if (State.isPanning) {
    State.isPanning = false;
    DOM.canvasWrapper.classList.remove('dragging');
  }
  if (State.draggingNode !== null) {
    onNodeDragEnd(e);
  }
}

// ── Zoom ────────────────────────────────────────────────────

DOM.canvasWrapper.addEventListener('wheel', onWheel, { passive: false });

function onWheel(e) {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.08 : 0.93;
  zoomAtPoint(e.clientX, e.clientY, factor);
}

function zoomAtPoint(vx, vy, factor) {
  const oldZoom = State.zoom;
  const newZoom = clamp(State.zoom * factor, 0.15, 3);

  // Adjust pan so the point under cursor stays fixed
  State.panX = vx - (vx - State.panX) * (newZoom / oldZoom);
  State.panY = vy - (vy - State.panY) * (newZoom / oldZoom);
  State.zoom = newZoom;

  applyTransform();
  updateZoomLabel();
  updateMinimap();
  updateConnections();
}

DOM.zoomIn.addEventListener('click', () => {
  const vw = window.innerWidth, vh = window.innerHeight - 72;
  zoomAtPoint(vw / 2, vh / 2, 1.2);
});

DOM.zoomOut.addEventListener('click', () => {
  const vw = window.innerWidth, vh = window.innerHeight - 72;
  zoomAtPoint(vw / 2, vh / 2, 1 / 1.2);
});

/** Zoom to fit all events */
function zoomToFit() {
  if (State.events.length === 0) { initCanvas(); return; }

  const xs = State.events.map(e => e.x);
  const minX = Math.min(...xs) - 200;
  const maxX = Math.max(...xs) + 200;
  const rangeX = maxX - minX;

  const vw = window.innerWidth;
  const vh = window.innerHeight - 72;
  const newZoom = clamp(vw / rangeX, 0.2, 2);

  State.zoom = newZoom;
  const midX = (minX + maxX) / 2;
  State.panX = vw / 2 - midX * newZoom;
  State.panY = vh / 2 - State.AXIS_Y * newZoom;

  applyTransform();
  updateZoomLabel();
  updateMinimap();
}


/* ═══════════════════════════════════════════════════════════════
   5. EVENTS — CREATE / EDIT / DELETE
═══════════════════════════════════════════════════════════════ */

let _modalMode = 'create'; // 'create' | 'edit'

DOM.addEventBtn.addEventListener('click', openCreateModal);

function openCreateModal() {
  _modalMode = 'create';
  State.editingId = null;
  DOM.modalTitle.textContent = 'New Event';
  DOM.eventTitle.value = '';
  DOM.eventDesc.value = '';
  DOM.eventDate.value = '';
  showModal();
  setTimeout(() => DOM.eventTitle.focus(), 80);
}

function openEditModal(id) {
  const ev = findEvent(id);
  if (!ev) return;
  _modalMode = 'edit';
  State.editingId = id;
  DOM.modalTitle.textContent = 'Edit Event';
  DOM.eventTitle.value = ev.title;
  DOM.eventDesc.value = ev.desc;
  DOM.eventDate.value = ev.date;
  showModal();
  setTimeout(() => DOM.eventTitle.focus(), 80);
}

function showModal() {
  DOM.modalOverlay.classList.remove('hidden');
}

function hideModal() {
  DOM.modalOverlay.classList.add('hidden');
}

DOM.modalClose.addEventListener('click', hideModal);
DOM.modalCancel.addEventListener('click', hideModal);
DOM.modalOverlay.addEventListener('click', e => {
  if (e.target === DOM.modalOverlay) hideModal();
});

DOM.modalSave.addEventListener('click', saveModal);

// Allow Ctrl+Enter to save
DOM.modal.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveModal();
  if (e.key === 'Escape') hideModal();
});

function saveModal() {
  const title = DOM.eventTitle.value.trim();
  if (!title) {
    DOM.eventTitle.style.borderColor = 'rgba(255,59,59,0.5)';
    setTimeout(() => DOM.eventTitle.style.borderColor = '', 800);
    return;
  }
  const desc = DOM.eventDesc.value.trim();
  const date = DOM.eventDate.value.trim();

  if (_modalMode === 'create') {
    createEvent(title, desc, date);
  } else {
    updateEvent(State.editingId, title, desc, date);
  }
  hideModal();
}

function createEvent(title, desc, date) {
  const id = uid();
  const x = generateNewEventX();

  // Alternate above/below for aesthetics
  const side = State.events.length % 2 === 0 ? 'above' : 'below';
  const stemHeight = randInt(State.STEM_MIN, State.STEM_MAX);

  const ev = { id, title, desc, date, x, side, stemHeight };
  State.events.push(ev);
  renderNode(ev);
  updateNodeCount();
  updateMinimap();
  setStatus(`Event "${title}" created`);

  // Pan to new event
  panToX(x);
}

function updateEvent(id, title, desc, date) {
  const ev = findEvent(id);
  if (!ev) return;
  ev.title = title;
  ev.desc = desc;
  ev.date = date;
  refreshNode(ev);
  updateMinimap();
  setStatus(`Event "${title}" updated`);

  // Refresh open card
  if (State.openCardId === id) {
    closeCard();
    openCard(id);
  }
}

function deleteEvent(id) {
  const ev = findEvent(id);
  if (!ev) return;
  // Remove connections
  State.connections = State.connections.filter(c => c.fromId !== id && c.toId !== id);
  // Remove from state
  State.events = State.events.filter(e => e.id !== id);
  // Remove DOM
  const el = document.querySelector(`.event-node[data-id="${id}"]`);
  if (el) el.remove();
  closeCard();
  updateConnections();
  updateNodeCount();
  updateMinimap();
  setStatus('Event deleted');
}

/** Pan so that a canvas X coordinate is centered in viewport */
function panToX(x) {
  const vw = window.innerWidth;
  const vh = window.innerHeight - 72;
  const targetPanX = vw / 2 - x * State.zoom;
  const targetPanY = vh / 2 - State.AXIS_Y * State.zoom;

  // Smooth animate
  const startPanX = State.panX;
  const startPanY = State.panY;
  const startTime = performance.now();
  const duration = 380;

  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    State.panX = lerp(startPanX, targetPanX, ease);
    State.panY = lerp(startPanY, targetPanY, ease);
    applyTransform();
    updateMinimap();
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


/* ═══════════════════════════════════════════════════════════════
   6. NODE RENDERING
═══════════════════════════════════════════════════════════════ */

function renderNode(ev) {
  const el = document.createElement('div');
  el.className = `event-node ${ev.side}`;
  el.dataset.id = ev.id;

  const stemH = ev.stemHeight;

  if (ev.side === 'above') {
    // Node sits above axis: stem goes down to axis
    el.style.left = ev.x + 'px';
    el.style.top = (State.AXIS_Y - stemH - 20) + 'px'; // 20px above stem top
    el.style.height = (stemH + 20) + 'px';
  } else {
    // Node sits below axis: stem goes up to axis
    el.style.left = ev.x + 'px';
    el.style.top = State.AXIS_Y + 'px';
    el.style.height = (stemH + 20) + 'px';
  }

  el.innerHTML = buildNodeHTML(ev, stemH);

  // Events
  el.addEventListener('click', e => { e.stopPropagation(); onNodeClick(ev.id, el); });
  el.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); onNodeRightClick(ev.id, e); });
  el.addEventListener('mousedown', e => { e.stopPropagation(); onNodeMouseDown(ev.id, e, el); });

  DOM.nodesLayer.appendChild(el);
}

function buildNodeHTML(ev, stemH) {
  const isAbove = ev.side === 'above';
  return `
    <div class="node-stem ${isAbove ? 'above' : 'below'}" style="height:${stemH}px; ${isAbove ? 'bottom:20px' : 'top:20px'};"></div>
    <div class="node-dot-wrap" style="${isAbove ? 'bottom:20px' : 'top:20px'};">
      <div class="node-dot"></div>
    </div>
    <div class="node-label" style="${isAbove ? 'bottom:' + (stemH + 32) + 'px' : 'top:' + (stemH + 32) + 'px'};">${escHtml(ev.title)}</div>
    ${ev.date ? `<div class="node-date" style="${isAbove ? 'bottom:' + (stemH + 20) + 'px' : 'top:' + (stemH + 20) + 'px'};">${escHtml(ev.date)}</div>` : ''}
  `;
}

function refreshNode(ev) {
  const el = document.querySelector(`.event-node[data-id="${ev.id}"]`);
  if (!el) return;
  const stemH = ev.stemHeight;
  el.innerHTML = buildNodeHTML(ev, stemH);
  // Re-attach inner events (outer ones are already on el)
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Update node DOM position after drag */
function updateNodePosition(ev) {
  const el = document.querySelector(`.event-node[data-id="${ev.id}"]`);
  if (!el) return;
  el.style.left = ev.x + 'px';
}


/* ═══════════════════════════════════════════════════════════════
   7. NODE INTERACTION — CLICK / CARD / DRAG
═══════════════════════════════════════════════════════════════ */

function onNodeClick(id, el) {
  if (State.dragHasMoved) return; // suppress click if it was a drag

  if (State.connectMode) {
    // Finalize connection
    if (id !== State.connectFromId) {
      addConnection(State.connectFromId, id);
    }
    exitConnectMode();
    return;
  }

  // Toggle card
  if (State.openCardId === id) {
    closeCard();
  } else {
    closeCard();
    openCard(id);
  }
}

function onNodeRightClick(id, e) {
  showContextMenu(id, e.clientX, e.clientY);
}

// ── Card ────────────────────────────────────────────────────

function openCard(id) {
  const ev = findEvent(id);
  if (!ev) return;
  State.openCardId = id;

  const el = document.querySelector(`.event-node[data-id="${id}"]`);
  if (el) el.classList.add('selected');

  // Figure out screen position of the dot
  const dotEl = el?.querySelector('.node-dot');
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  if (dotEl) {
    const rect = dotEl.getBoundingClientRect();
    cx = rect.left + rect.width / 2;
    cy = rect.top + rect.height / 2;
  }

  const card = document.createElement('div');
  card.className = 'node-card';
  card.id = 'activeCard';
  card.innerHTML = `
    <div class="card-header">
      <span class="card-title">${escHtml(ev.title)}</span>
      <button class="card-close">✕</button>
    </div>
    ${ev.date ? `<div class="card-date">${escHtml(ev.date)}</div>` : ''}
    <div class="card-desc">${escHtml(ev.desc) || '<span style="color:#444">No description</span>'}</div>
    <div class="card-actions">
      <button class="card-action-btn" data-action="edit">Edit</button>
      <button class="card-action-btn" data-action="connect">Connect</button>
      <button class="card-action-btn" data-action="delete" style="color:#ff3b3b;">Delete</button>
    </div>
  `;

  // Position card near the node dot, keep in viewport
  const cardW = 280, cardH = 200;
  let left = cx + 16;
  let top  = cy - 60;
  if (left + cardW > window.innerWidth - 16) left = cx - cardW - 16;
  if (top + cardH > window.innerHeight - 36) top = window.innerHeight - cardH - 36;
  if (top < 56) top = 56;

  card.style.left = left + 'px';
  card.style.top  = top + 'px';

  card.querySelector('.card-close').addEventListener('click', closeCard);

  card.querySelectorAll('.card-action-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const action = e.currentTarget.dataset.action;
      if (action === 'edit') { closeCard(); openEditModal(id); }
      if (action === 'connect') { closeCard(); enterConnectMode(id); }
      if (action === 'delete') { closeCard(); deleteEvent(id); }
    });
  });

  card.addEventListener('click', e => e.stopPropagation());
  document.body.appendChild(card);
}

function closeCard() {
  const card = document.getElementById('activeCard');
  if (card) card.remove();
  document.querySelectorAll('.event-node.selected')
    .forEach(el => el.classList.remove('selected'));
  State.openCardId = null;
}


/* ═══════════════════════════════════════════════════════════════
   8. NODE DRAG & DROP
═══════════════════════════════════════════════════════════════ */

function onNodeMouseDown(id, e, el) {
  if (e.button !== 0) return;
  State.dragHasMoved = false;

  const startMouseX = e.clientX;
  const ev = findEvent(id);
  if (!ev) return;

  State.draggingNode = {
    id,
    startX: ev.x,
    startMouseX,
  };
}

function onNodeDragMove(e) {
  if (!State.draggingNode) return;
  const { id, startX, startMouseX } = State.draggingNode;

  const dx = (e.clientX - startMouseX) / State.zoom;
  if (Math.abs(dx) > 3) State.dragHasMoved = true;
  if (!State.dragHasMoved) return;

  const ev = findEvent(id);
  if (!ev) return;

  const rawX = startX + dx;
  ev.x = snapX(rawX);

  updateNodePosition(ev);
  updateConnections();
  updateMinimap();

  // Mark node as dragging
  const el = document.querySelector(`.event-node[data-id="${id}"]`);
  if (el) el.classList.add('dragging-node');
  closeCard();
}

function onNodeDragEnd(e) {
  if (!State.draggingNode) return;
  const { id } = State.draggingNode;
  const el = document.querySelector(`.event-node[data-id="${id}"]`);
  if (el) el.classList.remove('dragging-node');

  State.draggingNode = null;
  updateConnections();

  if (State.dragHasMoved) {
    setStatus('Event repositioned');
  }
  // dragHasMoved reset on next mousedown
}


/* ═══════════════════════════════════════════════════════════════
   9. CONNECTIONS (SVG)
═══════════════════════════════════════════════════════════════ */

function addConnection(fromId, toId) {
  // Avoid duplicates
  const exists = State.connections.find(
    c => (c.fromId === fromId && c.toId === toId) ||
         (c.fromId === toId && c.toId === fromId)
  );
  if (exists) return;

  State.connections.push({ fromId, toId });
  drawConnection(fromId, toId, true); // animated
  setStatus('Events connected');
}

function updateConnections() {
  // Clear existing paths
  DOM.connectionsSvg.querySelectorAll('.connection-path').forEach(p => p.remove());
  State.connections.forEach(c => drawConnection(c.fromId, c.toId, false));
}

function drawConnection(fromId, toId, animated) {
  const from = findEvent(fromId);
  const to = findEvent(toId);
  if (!from || !to) return;

  // Get dot positions in canvas coords
  const fromDot = getDotCanvasPos(from);
  const toDot = getDotCanvasPos(to);

  if (!fromDot || !toDot) return;

  // Build a cubic bezier path
  const dx = toDot.x - fromDot.x;
  const dy = toDot.y - fromDot.y;
  const cx1 = fromDot.x + dx * 0.4;
  const cy1 = fromDot.y;
  const cx2 = toDot.x - dx * 0.4;
  const cy2 = toDot.y;

  const d = `M ${fromDot.x} ${fromDot.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toDot.x} ${toDot.y}`;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.classList.add('connection-path');
  if (animated) path.classList.add('animated');
  path.setAttribute('d', d);
  path.dataset.from = fromId;
  path.dataset.to = toId;

  // Right-click to delete connection
  path.style.pointerEvents = 'stroke';
  path.addEventListener('contextmenu', e => {
    e.preventDefault();
    showConnectionContextMenu(fromId, toId, e.clientX, e.clientY);
  });

  DOM.connectionsSvg.appendChild(path);
}

function getDotCanvasPos(ev) {
  // Dot is at ev.x, State.AXIS_Y in canvas coords
  return { x: ev.x, y: State.AXIS_Y };
}

function showConnectionContextMenu(fromId, toId, cx, cy) {
  const menu = document.createElement('div');
  menu.id = 'connCtxMenu';
  menu.className = 'hidden';
  menu.style.cssText = `
    position:fixed; left:${cx}px; top:${cy}px; z-index:1000;
    background:#0d0d0d; border:1px solid #2a2a2a; border-radius:8px;
    padding:4px; min-width:140px; box-shadow:0 16px 60px rgba(0,0,0,.9);
    animation: cardIn 150ms var(--ease) both;
  `;
  const btn = document.createElement('button');
  btn.className = 'ctx-item ctx-danger';
  btn.textContent = 'Remove connection';
  btn.addEventListener('click', () => {
    State.connections = State.connections.filter(
      c => !(c.fromId === fromId && c.toId === toId) &&
           !(c.fromId === toId && c.toId === fromId)
    );
    updateConnections();
    menu.remove();
    setStatus('Connection removed');
  });
  menu.appendChild(btn);
  menu.classList.remove('hidden');
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener('click', () => menu.remove(), { once: true }), 50);
}


/* ═══════════════════════════════════════════════════════════════
   10. CONNECT MODE
═══════════════════════════════════════════════════════════════ */

function enterConnectMode(fromId) {
  State.connectMode = true;
  State.connectFromId = fromId;
  DOM.connectTooltip.classList.remove('hidden');
  setStatus('Connect mode — click target event');

  // Highlight potential targets
  document.querySelectorAll('.event-node').forEach(el => {
    if (parseInt(el.dataset.id) !== fromId) {
      el.classList.add('connect-target');
    }
  });
}

function exitConnectMode() {
  State.connectMode = false;
  State.connectFromId = null;
  DOM.connectTooltip.classList.add('hidden');
  document.querySelectorAll('.event-node.connect-target')
    .forEach(el => el.classList.remove('connect-target'));
  setStatus('Ready');
}


/* ═══════════════════════════════════════════════════════════════
   11. CONTEXT MENU
═══════════════════════════════════════════════════════════════ */

let _ctxNodeId = null;

function showContextMenu(id, cx, cy) {
  _ctxNodeId = id;
  DOM.contextMenu.style.left = cx + 'px';
  DOM.contextMenu.style.top = cy + 'px';
  DOM.contextMenu.classList.remove('hidden');
}

function hideContextMenu() {
  DOM.contextMenu.classList.add('hidden');
  _ctxNodeId = null;
}

DOM.contextMenu.querySelectorAll('.ctx-item').forEach(btn => {
  btn.addEventListener('click', e => {
    const action = e.currentTarget.dataset.action;
    const id = _ctxNodeId;
    hideContextMenu();
    if (action === 'edit') openEditModal(id);
    if (action === 'connect') enterConnectMode(id);
    if (action === 'delete') deleteEvent(id);
  });
});

document.addEventListener('click', e => {
  if (!DOM.contextMenu.classList.contains('hidden') &&
      !DOM.contextMenu.contains(e.target)) {
    hideContextMenu();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    hideContextMenu();
    hideModal();
    closeCard();
    if (State.connectMode) exitConnectMode();
    if (!DOM.storyOverlay.classList.contains('hidden')) exitStoryMode();
  }
});


/* ═══════════════════════════════════════════════════════════════
   12. MINI-MAP
═══════════════════════════════════════════════════════════════ */

const MM = {
  W: 178,
  H: 90,
  // Canvas range we map onto minimap
  RANGE_X: 8000,   // canvas units
  RANGE_Y: 1000,   // canvas units (centered on AXIS_Y)
  ORIGIN_X: 1000,  // canvas X where minimap starts
  get ORIGIN_Y() { return State.AXIS_Y - 500; },
};

function updateMinimap() {
  // Update viewport indicator
  const vw = window.innerWidth, vh = window.innerHeight - 72;
  const vpLeft   = (-State.panX) / State.zoom;
  const vpTop    = (-State.panY) / State.zoom;
  const vpRight  = vpLeft + vw / State.zoom;
  const vpBottom = vpTop + vh / State.zoom;

  const toMmX = x => ((x - MM.ORIGIN_X) / MM.RANGE_X) * MM.W;
  const toMmY = y => ((y - MM.ORIGIN_Y) / MM.RANGE_Y) * MM.H;

  const mmLeft   = clamp(toMmX(vpLeft),   0, MM.W);
  const mmTop    = clamp(toMmY(vpTop),    0, MM.H);
  const mmRight  = clamp(toMmX(vpRight),  0, MM.W);
  const mmBottom = clamp(toMmY(vpBottom), 0, MM.H);

  DOM.minimapViewport.style.left   = mmLeft + 'px';
  DOM.minimapViewport.style.top    = mmTop  + 'px';
  DOM.minimapViewport.style.width  = (mmRight  - mmLeft) + 'px';
  DOM.minimapViewport.style.height = (mmBottom - mmTop)  + 'px';

  // Update dots
  DOM.minimapNodes.innerHTML = '';
  State.events.forEach(ev => {
    const dot = document.createElement('div');
    dot.className = 'minimap-dot';
    dot.style.left = clamp(toMmX(ev.x), 0, MM.W) + 'px';
    dot.style.top  = (MM.H / 2) + 'px';
    DOM.minimapNodes.appendChild(dot);
  });
}

// Click on minimap to pan
DOM.minimapCanvas.addEventListener('click', e => {
  const rect = DOM.minimapCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const canvasX = MM.ORIGIN_X + (mx / MM.W) * MM.RANGE_X;
  const canvasY = MM.ORIGIN_Y + (my / MM.H) * MM.RANGE_Y;

  const vw = window.innerWidth, vh = window.innerHeight - 72;
  State.panX = vw / 2 - canvasX * State.zoom;
  State.panY = vh / 2 - canvasY * State.zoom;
  applyTransform();
  updateMinimap();
});


/* ═══════════════════════════════════════════════════════════════
   13. STORY MODE
═══════════════════════════════════════════════════════════════ */

DOM.storyModeBtn.addEventListener('click', enterStoryMode);

function enterStoryMode() {
  if (State.events.length === 0) {
    setStatus('Add events before using Story Mode');
    return;
  }
  // Sort events by X position
  const sorted = [...State.events].sort((a, b) => a.x - b.x);
  State._storySorted = sorted;
  State.storyIndex = 0;
  DOM.storyOverlay.classList.remove('hidden');
  renderStorySlide();
}

function renderStorySlide() {
  const sorted = State._storySorted;
  const idx = State.storyIndex;
  const ev = sorted[idx];

  DOM.storyCard.style.animation = 'none';
  DOM.storyCard.offsetHeight; // reflow
  DOM.storyCard.style.animation = '';

  DOM.storyMeta.textContent = ev.date || `Event ${idx + 1}`;
  DOM.storyTitle.textContent = ev.title;
  DOM.storyDesc.textContent  = ev.desc || '';
  DOM.storyProgress.textContent = `${idx + 1} / ${sorted.length}`;

  DOM.storyPrev.disabled = idx === 0;
  DOM.storyNext.disabled = idx === sorted.length - 1;

  // Pan canvas to this event in background
  panToX(ev.x);
}

DOM.storyNext.addEventListener('click', () => {
  if (State.storyIndex < State._storySorted.length - 1) {
    State.storyIndex++;
    renderStorySlide();
  }
});

DOM.storyPrev.addEventListener('click', () => {
  if (State.storyIndex > 0) {
    State.storyIndex--;
    renderStorySlide();
  }
});

DOM.storyExit.addEventListener('click', exitStoryMode);

function exitStoryMode() {
  DOM.storyOverlay.classList.add('hidden');
}

// Keyboard navigation in story mode
document.addEventListener('keydown', e => {
  if (DOM.storyOverlay.classList.contains('hidden')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') DOM.storyNext.click();
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   DOM.storyPrev.click();
});


/* ═══════════════════════════════════════════════════════════════
   14. EXPORT / IMPORT
═══════════════════════════════════════════════════════════════ */

DOM.exportBtn.addEventListener('click', exportJSON);

function exportJSON() {
  const data = {
    version: 1,
    name: DOM.timelineName.textContent.trim(),
    events: State.events,
    connections: State.connections,
    nextId: State.nextId,
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chrono-timeline.json';
  a.click();
  URL.revokeObjectURL(url);
  setStatus('Timeline exported as JSON');
}

DOM.importBtn.addEventListener('click', () => DOM.importFileInput.click());

DOM.importFileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      importJSON(JSON.parse(evt.target.result));
    } catch (err) {
      setStatus('Import failed — invalid JSON');
    }
    DOM.importFileInput.value = '';
  };
  reader.readAsText(file);
});

function importJSON(data) {
  if (!data.events || !Array.isArray(data.events)) {
    setStatus('Import failed — missing events array');
    return;
  }

  // Clear current state
  State.events = [];
  State.connections = [];
  DOM.nodesLayer.innerHTML = '';
  DOM.connectionsSvg.querySelectorAll('.connection-path').forEach(p => p.remove());

  // Load
  State.nextId = data.nextId || 1;
  if (data.name) DOM.timelineName.textContent = data.name;

  data.events.forEach(ev => {
    State.events.push(ev);
    renderNode(ev);
  });

  if (data.connections) {
    State.connections = data.connections;
    updateConnections();
  }

  updateNodeCount();
  updateMinimap();
  zoomToFit();
  setStatus(`Imported "${data.name || 'Timeline'}" — ${State.events.length} events`);
}


/* ═══════════════════════════════════════════════════════════════
   15. CANVAS CLICK — close card / exit connect
═══════════════════════════════════════════════════════════════ */

DOM.canvasWrapper.addEventListener('click', e => {
  if (e.target === DOM.canvasWrapper || e.target === DOM.canvas) {
    closeCard();
    if (State.connectMode) exitConnectMode();
    hideContextMenu();
  }
});


/* ═══════════════════════════════════════════════════════════════
   16. WINDOW RESIZE
═══════════════════════════════════════════════════════════════ */

window.addEventListener('resize', () => {
  updateMinimap();
  updateConnections();
});


/* ═══════════════════════════════════════════════════════════════
   17. DOUBLE-CLICK ON CANVAS — quick add event
═══════════════════════════════════════════════════════════════ */

DOM.canvasWrapper.addEventListener('dblclick', e => {
  if (e.target !== DOM.canvasWrapper && e.target !== DOM.canvas &&
      !e.target.classList.contains('tick')) return;

  // Convert to canvas X, use it as the new event X
  const c = viewportToCanvas(e.clientX, e.clientY);
  _dblClickX = snapX(c.x);
  openCreateModal();
});

let _dblClickX = null;

// Override createEvent to use dblclick X if available
const _origCreateEvent = createEvent;
window.createEvent = function(title, desc, date) {
  const id = uid();
  const x = _dblClickX !== null ? _dblClickX : generateNewEventX();
  _dblClickX = null;

  const side = State.events.length % 2 === 0 ? 'above' : 'below';
  const stemHeight = randInt(State.STEM_MIN, State.STEM_MAX);

  const ev = { id, title, desc, date, x, side, stemHeight };
  State.events.push(ev);
  renderNode(ev);
  updateNodeCount();
  updateMinimap();
  setStatus(`Event "${title}" created`);
  panToX(x);
};

// Redirect saveModal's createEvent call
function createEvent(title, desc, date) {
  window.createEvent(title, desc, date);
}


/* ═══════════════════════════════════════════════════════════════
   18. KEYBOARD SHORTCUTS
═══════════════════════════════════════════════════════════════ */

document.addEventListener('keydown', e => {
  // Skip if focused on input
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
  if (document.activeElement.isContentEditable) return;

  if (e.key === 'n' || e.key === 'N') openCreateModal();
  if (e.key === 'f' || e.key === 'F') zoomToFit();
  if (e.key === '+' || e.key === '=') {
    const vw = window.innerWidth, vh = window.innerHeight - 72;
    zoomAtPoint(vw / 2, vh / 2, 1.15);
  }
  if (e.key === '-') {
    const vw = window.innerWidth, vh = window.innerHeight - 72;
    zoomAtPoint(vw / 2, vh / 2, 1 / 1.15);
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (State.openCardId) deleteEvent(State.openCardId);
  }
});


/* ═══════════════════════════════════════════════════════════════
   19. SAMPLE DATA — first load demo
═══════════════════════════════════════════════════════════════ */

function loadSampleData() {
  const samples = [
    { title: 'Project Kickoff',  desc: 'Initial meeting with all stakeholders. Defined scope, timeline, and key deliverables for the upcoming quarter.', date: 'Jan 2024', x: 4600, side: 'above', stemHeight: 80  },
    { title: 'Research Phase',   desc: 'Deep dive into user interviews, market analysis, and competitor audit. Synthesized findings into 3 core opportunity areas.', date: 'Feb 2024', x: 4840, side: 'below', stemHeight: 60  },
    { title: 'Design Sprint',    desc: 'Rapid prototyping week. Produced 12 concepts, narrowed to 3 through team voting and user feedback sessions.', date: 'Mar 2024', x: 5080, side: 'above', stemHeight: 110 },
    { title: 'MVP Launch',       desc: 'First public release shipped to 500 beta users. Core features stable. Observability stack fully deployed.', date: 'Apr 2024', x: 5320, side: 'below', stemHeight: 75  },
    { title: 'First Milestone',  desc: '10,000 users onboarded. NPS score of 62. Retention at 68% after 30 days — well above industry baseline.', date: 'May 2024', x: 5560, side: 'above', stemHeight: 95  },
  ];

  samples.forEach(s => {
    const id = uid();
    const ev = { id, ...s };
    State.events.push(ev);
    renderNode(ev);
  });

  // Connections
  addConnection(1, 2);
  addConnection(2, 3);
  addConnection(3, 4);
  addConnection(4, 5);
  addConnection(2, 4); // branch

  updateNodeCount();
  updateMinimap();
  setStatus('Welcome to Chrono — double-click canvas to add events, or press N');
}


/* ═══════════════════════════════════════════════════════════════
   20. INIT
═══════════════════════════════════════════════════════════════ */

function init() {
  initCanvas();
  loadSampleData();
  updateZoomLabel();
  updateMinimap();
}

init();