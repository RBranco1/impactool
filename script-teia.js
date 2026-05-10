// script-teia.js
// Depende de data.js: VOLUME_UNITS, GROUP_COLORS, WEB_CONFIG.
// Carregue data.js ANTES deste arquivo no HTML.

const state = {
  liters: 100,
  volumeUnit: "L",
  activeGroups: new Set(),
  resultsByTrack: [],
  selectedNode: null
};

const elements = {
  svg: document.getElementById("web"),
  trackFiltersList: document.getElementById("track-filters-list"),
  modalOverlay: document.getElementById("modal-overlay"),
  modalTitle: document.getElementById("modal-title"),
  modalSubtitle: document.getElementById("modal-subtitle"),
  modalInput: document.getElementById("modal-input"),
  modalUnitDisplay: document.getElementById("modal-unit-display"),
  modalUnitGroup: document.getElementById("modal-unit-group"),
  modalUnitSelect: document.getElementById("modal-unit-select"),
  modalMaterialGroup: document.getElementById("modal-material-group"),
  modalMaterialSelect: document.getElementById("modal-material-select"),
  modalCancel: document.getElementById("modal-cancel"),
  modalSave: document.getElementById("modal-save"),
  exportBtn: document.getElementById("export-btn"),
  tooltip: document.getElementById("node-tooltip"),
  tooltipTitle: document.getElementById("tooltip-title"),
  tooltipMeta: document.getElementById("tooltip-meta")
};

// Initialize all groups as active
WEB_CONFIG.tracks.forEach((track) => {
  state.activeGroups.add(track.group);
});

// Get filter elements
const filterToggle = document.getElementById("filter-toggle");
const filterMenu = document.getElementById("track-filters-list");

function toggleFilterMenu() {
  filterToggle.classList.toggle("active");
  filterMenu.classList.toggle("active");
}

function updateFilterLabel() {
  const filterLabel = document.getElementById("filter-label");
  const activeCount = state.activeGroups.size;
  const totalGroups = WEB_CONFIG.tracks.reduce((acc, track) => {
    return acc.has(track.group) ? acc : acc.add(track.group);
  }, new Set()).size;
  
  if (activeCount === 0) {
    filterLabel.textContent = "Nenhum";
  } else if (activeCount === totalGroups) {
    filterLabel.textContent = "Tudo";
  } else {
    filterLabel.textContent = `${activeCount} de ${totalGroups}`;
  }
}

function sanitizeNumber(rawValue) {
  const numeric = Number(rawValue);
  return !Number.isFinite(numeric) || numeric < 0 ? 0 : numeric;
}

function litersToCurrentUnit(liters, unitKey) {
  return liters / VOLUME_UNITS[unitKey].toLiters;
}

function currentUnitToLiters(value, unitKey) {
  return value * VOLUME_UNITS[unitKey].toLiters;
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value);
}

function formatInputValue(value) {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function calculateResults(liters, config) {
  return config.tracks.map((track) => ({
    ...track,
    points: track.points.map((point) => ({
      ...point,
      value: liters * point.factorPerLiter
    }))
  }));
}

function createSvg(tag, attrs = {}, text) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });
  if (typeof text === "string") node.textContent = text;
  return node;
}

function createXHtml(tag, attrs = {}, text) {
  const node = document.createElementNS("http://www.w3.org/1999/xhtml", tag);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });
  if (typeof text === "string") node.textContent = text;
  return node;
}

function getUniqueGroups(resultsByTrack) {
  const groups = new Map();
  resultsByTrack.forEach((track) => {
    if (!groups.has(track.group)) {
      groups.set(track.group, []);
    }
    groups.get(track.group).push(track);
  });
  return groups;
}

function renderSummary(liters, resultsByTrack) {
  void liters;
  void resultsByTrack;
}

function buildTrackFilters() {
  elements.trackFiltersList.innerHTML = "";
  const groups = getUniqueGroups(state.resultsByTrack);
  const groupNames = Array.from(groups.keys());

  const allRow = document.createElement("button");
  allRow.type = "button";
  allRow.className = "track-filter-item all-track-filter-item";
  allRow.style.setProperty("--item-index", "0");

  const allDot = document.createElement("span");
  allDot.className = "color-dot color-all";

  const allText = document.createElement("span");
  allText.textContent = "Tudo / Nenhum";

  const allCheck = document.createElement("span");
  allCheck.className = "filter-checkmark";
  allCheck.textContent = "";

  // Toggle: se todos os grupos estão ativos, desmarca todos; senão, marca todos
  allRow.addEventListener("click", () => {
    if (state.activeGroups.size === groupNames.length) {
      state.activeGroups.clear();
    } else {
      groupNames.forEach((group) => state.activeGroups.add(group));
    }
    render();
  });

  allRow.appendChild(allDot);
  allRow.appendChild(allText);
  allRow.appendChild(allCheck);
  elements.trackFiltersList.appendChild(allRow);

  groupNames.forEach((group, index) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `track-filter-item ${state.activeGroups.has(group) ? "is-selected" : ""}`;
    row.style.setProperty("--item-index", String(index + 1));

    row.addEventListener("click", () => {
      if (state.activeGroups.has(group)) {
        state.activeGroups.delete(group);
      } else {
        state.activeGroups.add(group);
      }
      render();
    });

    const colorDot = document.createElement("span");
    colorDot.className = `color-dot color-${GROUP_COLORS[group] || ""}`;

    const text = document.createElement("span");
    text.textContent = group;

    const checkmark = document.createElement("span");
    checkmark.className = `filter-checkmark ${state.activeGroups.has(group) ? "active" : ""}`;
    checkmark.textContent = state.activeGroups.has(group) ? "✓" : "";

    row.appendChild(colorDot);
    row.appendChild(text);
    row.appendChild(checkmark);
    elements.trackFiltersList.appendChild(row);
  });
}

// Reduz dinamicamente o font-size para que o texto caiba em maxWidth.
// charRatio é a razão média largura/altura para fontes sans-serif (~0.55).
function fitFontSize(text, maxWidth, baseFontSize, minFontSize) {
  const charRatio = 0.55;
  const textLen = String(text || "").length;
  if (textLen === 0) return baseFontSize;
  const estimatedWidth = textLen * baseFontSize * charRatio;
  if (estimatedWidth <= maxWidth) return baseFontSize;
  const scaled = maxWidth / (textLen * charRatio);
  return Math.max(minFontSize, scaled);
}

function drawWeb(liters, resultsByTrack, config) {
  const svg = elements.svg;
  svg.innerHTML = "";

  const width = 1800;
  const height = 1600;
  const centerX = width / 2;
  const centerY = height / 2;
  const pointBaseRadius = 60;
  const pointScaleStep = 0.95;
  const edgePadding = 10;

  const defs = createSvg("defs");
  const centerGradient = createSvg("radialGradient", {
    id: "center-gradient",
    cx: "38%",
    cy: "32%",
    r: "88%"
  });
  centerGradient.appendChild(createSvg("stop", { offset: "0%", "stop-color": "#ff8d6b" }));
  centerGradient.appendChild(createSvg("stop", { offset: "22%", "stop-color": "#ff6a40" }));
  centerGradient.appendChild(createSvg("stop", { offset: "70%", "stop-color": "#FB441A" }));
  centerGradient.appendChild(createSvg("stop", { offset: "100%", "stop-color": "#df3a12" }));
  defs.appendChild(centerGradient);
  svg.appendChild(defs);

  const linkLayer = createSvg("g", { class: "layer-links" });
  const nodeLayer = createSvg("g", { class: "layer-nodes" });
  const textLayer = createSvg("g", { class: "layer-text" });
  const sourceLayer = createSvg("g", { class: "layer-sources" });
  svg.appendChild(linkLayer);
  svg.appendChild(nodeLayer);
  svg.appendChild(textLayer);
  svg.appendChild(sourceLayer);

  const visibleTracks = resultsByTrack.filter((track) => state.activeGroups.has(track.group));

  if (visibleTracks.length === 0) {
    const centerHalo = createSvg("circle", {
      cx: centerX,
      cy: centerY,
      r: config.centerRadius + 14,
      class: "center-halo"
    });
    nodeLayer.appendChild(centerHalo);

    const centerCircle = createSvg("circle", {
      cx: centerX,
      cy: centerY,
      r: config.centerRadius,
      class: "node-circle center"
    });
    centerCircle.addEventListener("click", openCenterModal);
    nodeLayer.appendChild(centerCircle);

    const emptyText = createSvg("text", {
      x: centerX,
      y: centerY + 6,
      "text-anchor": "middle",
      class: "center-title"
    }, "Ative ao menos um grupo");
    textLayer.appendChild(emptyText);
    return;
  }

  const allTracks = resultsByTrack;
  const trackCount = Math.max(allTracks.length, 1);
  const angleStep = (Math.PI * 2) / trackCount;
  const maxDepth = Math.max(...allTracks.map((track) => track.points.length), 1);
  const sourceOffset = 12;
  const maxPointRadius = pointBaseRadius;
  const maxConfiguredReach =
    config.firstNodeRadius +
    (maxDepth - 1) * config.nodeStepRadius +
    maxPointRadius +
    sourceOffset;
  const allowedReach = Math.max(80, Math.min(centerX, centerY) - edgePadding);
  const radialScale = Math.min(1, allowedReach / maxConfiguredReach);

  const firstNodeRadius = config.firstNodeRadius * radialScale;
  const nodeStepRadius = config.nodeStepRadius * radialScale;
  const outerRadius = firstNodeRadius + (maxDepth - 1) * nodeStepRadius;

  const ring = createSvg("circle", {
    cx: centerX,
    cy: centerY,
    r: outerRadius,
    fill: "none",
    stroke: "#dde5f0",
    "stroke-width": 2
  });
  linkLayer.appendChild(ring);

  const centerCircle = createSvg("circle", {
    cx: centerX,
    cy: centerY,
    r: config.centerRadius,
    class: "node-circle center"
  });
  centerCircle.addEventListener("click", openCenterModal);

  const centerHaloOuter = createSvg("circle", {
    cx: centerX,
    cy: centerY,
    r: config.centerRadius + 18,
    class: "center-halo"
  });
  nodeLayer.appendChild(centerHaloOuter);

  const centerHaloInner = createSvg("circle", {
    cx: centerX,
    cy: centerY,
    r: config.centerRadius + 8,
    class: "center-halo center-halo-inner"
  });
  nodeLayer.appendChild(centerHaloInner);

  nodeLayer.appendChild(centerCircle);

  const centerTitle = createSvg("text", {
    x: centerX,
    y: centerY - 24,
    "text-anchor": "middle",
    class: "center-title"
  }, config.centerLabel);
  textLayer.appendChild(centerTitle);

  const centerValueText = formatNumber(litersToCurrentUnit(liters, state.volumeUnit));
  // .center-value tem 2.4rem ≈ 38px no CSS. Largura útil ~1.6 * raio (80% do diâmetro).
  const centerValueFont = fitFontSize(centerValueText, config.centerRadius * 1.6, 38, 12);
  const centerValue = createSvg("text", {
    x: centerX,
    y: centerY + 10,
    "text-anchor": "middle",
    class: "center-value",
    style: `font-size: ${centerValueFont}px;`
  }, centerValueText);
  textLayer.appendChild(centerValue);

  const centerUnit = createSvg("text", {
    x: centerX,
    y: centerY + 34,
    "text-anchor": "middle",
    class: "center-unit"
  }, `${VOLUME_UNITS[state.volumeUnit].label}`);
  textLayer.appendChild(centerUnit);

  allTracks.forEach((track, trackIndex) => {
    const angle = angleStep * trackIndex - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const isVisible = state.activeGroups.has(track.group);

    const firstRadius = firstNodeRadius;
    const firstX = centerX + cos * firstRadius;
    const firstY = centerY + sin * firstRadius;

    const centerToTrack = createSvg("line", {
      x1: centerX,
      y1: centerY,
      x2: firstX,
      y2: firstY,
      class: `link-line ${!isVisible ? "hidden" : ""}`
    });
    linkLayer.appendChild(centerToTrack);

    const labelRadius = Math.max(firstRadius - 72, 90);
    const labelX = centerX + cos * labelRadius;
    const labelY = centerY + sin * labelRadius;

    const trackLabel = createSvg("text", {
      x: labelX,
      y: labelY,
      "text-anchor": "middle",
      class: "link-label",
      style: !isVisible ? "opacity: 0; pointer-events: none" : ""
    }, track.title);
    textLayer.appendChild(trackLabel);

    track.points.forEach((point, pointIndex) => {
      const currentRadius = firstNodeRadius + pointIndex * nodeStepRadius;
      const x = centerX + cos * currentRadius;
      const y = centerY + sin * currentRadius;
      const pointRadius = Math.max(18, pointBaseRadius * Math.pow(pointScaleStep, pointIndex));
      const hiddenStyle = !isVisible ? "opacity: 0; pointer-events: none;" : "";
      const valueText = formatNumber(point.value);
      const baseValueFontSize = Math.max(12, pointRadius * 0.34);
      // Reduz o font-size se o texto for muito longo para caber dentro do círculo.
      const valueFontSize = fitFontSize(valueText, pointRadius * 1.6, baseValueFontSize, 8);
      const unitFontSize = Math.max(8, pointRadius * 0.16);
      const titleFontSize = Math.max(11, pointRadius * 0.22);

      if (pointIndex > 0) {
        const prevRadius = firstNodeRadius + (pointIndex - 1) * nodeStepRadius;
        const prevX = centerX + cos * prevRadius;
        const prevY = centerY + sin * prevRadius;

        const segment = createSvg("line", {
          x1: prevX,
          y1: prevY,
          x2: x,
          y2: y,
          class: `link-line ${!isVisible ? "hidden" : ""}`
        });
        segment.style.animationDelay = `${pointIndex * 90}ms, 0ms`;
        linkLayer.appendChild(segment);
      }

      const pointCircle = createSvg("circle", {
        cx: x,
        cy: y,
        r: pointRadius,
        class: `node-circle node-point color-${GROUP_COLORS[track.group] || ""} ${!isVisible ? "hidden" : ""}`,
        style: `${hiddenStyle}animation-delay: ${pointIndex * 90 + 60}ms;`
      });

      pointCircle.addEventListener("click", () => {
        if (isVisible) openEditModal(point, track);
      });

      if (isVisible) {
        pointCircle.addEventListener("mouseenter", () => {
          elements.tooltipTitle.textContent = point.title;
          elements.tooltipMeta.textContent = `${track.group} \u00b7 ${formatNumber(point.value)} ${point.outputUnit}`;
          elements.tooltip.classList.add("visible");
        });
        pointCircle.addEventListener("mouseleave", () => {
          elements.tooltip.classList.remove("visible");
        });
      }

      nodeLayer.appendChild(pointCircle);

      const pointTitle = createSvg("text", {
        x: x,
        y: y - pointRadius * 0.42,
        "text-anchor": "middle",
        class: `node-title ${!isVisible ? "hidden" : ""}`,
        style: `${hiddenStyle}font-size: ${titleFontSize}px;`
      });
      const titleWords = String(point.title || "").split(/\s+/).filter(Boolean);
      const titleLines = [];
      const maxCharsPerLine = Math.max(10, Math.floor(pointRadius / 3.5));
      let currentLine = "";
      titleWords.forEach((word) => {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (candidate.length > maxCharsPerLine && currentLine) {
          titleLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = candidate;
        }
      });
      if (currentLine) titleLines.push(currentLine);
      const limitedTitleLines = titleLines.slice(0, 2);
      if (titleLines.length > 2) {
        limitedTitleLines[1] = `${limitedTitleLines[1].slice(0, Math.max(0, maxCharsPerLine - 1))}\u2026`;
      }
      limitedTitleLines.forEach((line, lineIndex) => {
        const tspan = createSvg("tspan", {
          x: x,
          dy: lineIndex === 0 ? 0 : titleFontSize * 1.05
        }, line);
        pointTitle.appendChild(tspan);
      });
      textLayer.appendChild(pointTitle);

      const valueOffset = limitedTitleLines.length > 1 ? pointRadius * 0.22 : pointRadius * 0.12;
      const pointValue = createSvg("text", {
        x: x,
        y: y + valueOffset,
        "text-anchor": "middle",
        class: `node-point-value ${!isVisible ? "hidden" : ""}`,
        style: `${hiddenStyle}font-size: ${valueFontSize}px;`
      }, valueText);
      textLayer.appendChild(pointValue);

      const pointUnit = createSvg("text", {
        x: x,
        y: y + valueOffset + valueFontSize * 0.95,
        "text-anchor": "middle",
        class: `node-point-unit ${!isVisible ? "hidden" : ""}`,
        style: `${hiddenStyle}font-size: ${unitFontSize}px;`
      }, point.outputUnit);
      textLayer.appendChild(pointUnit);

      const infoCx = x + pointRadius * 0.72;
      const infoCy = y - pointRadius * 0.72;
      const infoRadius = Math.max(7, pointRadius * 0.18);
      const sourceLink = createSvg("a", {
        href: point.sourceUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `Fonte de ${point.title}`,
        class: `info-badge ${!isVisible ? "hidden" : ""}`,
        style: hiddenStyle
      });
      sourceLink.appendChild(createSvg("circle", {
        cx: infoCx,
        cy: infoCy,
        r: infoRadius,
        class: "info-badge-circle"
      }));
      const infoLabel = createSvg("text", {
        x: infoCx,
        y: infoCy,
        "text-anchor": "middle",
        class: "info-badge-text",
        style: `font-size: ${infoRadius * 1.3}px;`
      }, "i");
      sourceLink.appendChild(infoLabel);
      sourceLayer.appendChild(sourceLink);
    });
  });
}

function openEditModal(point, track) {
  state.selectedNode = { kind: "point", point, track };
  elements.modalTitle.textContent = point.title;
  elements.modalSubtitle.textContent = "Ajuste o valor para recalcular a teia";
  elements.modalInput.value = formatInputValue(point.value);
  elements.modalUnitDisplay.textContent = `Unidade: ${point.outputUnit}`;
  elements.modalUnitGroup.style.display = "none";
  elements.modalMaterialGroup.style.display = "none";
  elements.modalOverlay.classList.add("active");
  elements.modalInput.focus();
}

function openCenterModal() {
  state.selectedNode = { kind: "center" };
  elements.modalTitle.textContent = WEB_CONFIG.centerLabel;
  elements.modalSubtitle.textContent = "Defina o volume e a unidade para atualizar toda a teia";
  elements.modalUnitGroup.style.display = "block";
  elements.modalMaterialGroup.style.display = "block";
  elements.modalUnitSelect.value = state.volumeUnit;
  elements.modalInput.value = formatInputValue(
    litersToCurrentUnit(state.liters, state.volumeUnit)
  );
  elements.modalUnitDisplay.textContent = "Unidade aplicada em toda a visualiza\u00e7\u00e3o";
  elements.modalOverlay.classList.add("active");
  elements.modalInput.focus();
}

function closeEditModal() {
  elements.modalOverlay.classList.remove("active");
  state.selectedNode = null;
}

function saveEditModal() {
  if (!state.selectedNode) return;

  const newValue = sanitizeNumber(elements.modalInput.value);

  if (state.selectedNode.kind === "center") {
    const selectedUnit = elements.modalUnitSelect.value;
    state.volumeUnit = selectedUnit;
    state.liters = currentUnitToLiters(newValue, selectedUnit);
    closeEditModal();
    render();
    return;
  }

  const { point } = state.selectedNode;

  if (point.factorPerLiter <= 0) {
    closeEditModal();
    return;
  }

  state.liters = newValue / point.factorPerLiter;

  closeEditModal();
  render();
}

function exportToCSV() {
  const visibleTracks = state.resultsByTrack.filter((track) => state.activeGroups.has(track.group));
  
  let csv = "Grupo,Ponto,Valor,Unidade\n";
  
  const centerValue = litersToCurrentUnit(state.liters, state.volumeUnit);
  const centerUnit = VOLUME_UNITS[state.volumeUnit].label;
  csv += `Centro,Biocombust\u00edvel,${WEB_CONFIG.centerLabel},${formatNumber(centerValue)},${centerUnit}\n`;
  
  visibleTracks.forEach((track) => {
    track.points.forEach((point) => {
      csv += `"${track.group}","${point.title}",${formatNumber(point.value)},"${point.outputUnit}"\n`;
    });
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `teia-biocombustivel-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
}

function render() {
  state.resultsByTrack = calculateResults(state.liters, WEB_CONFIG);
  buildTrackFilters();
  updateFilterLabel();
  drawWeb(state.liters, state.resultsByTrack, WEB_CONFIG);
}

// Event listeners

elements.modalCancel.addEventListener("click", closeEditModal);
elements.modalSave.addEventListener("click", saveEditModal);
elements.modalInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") saveEditModal();
});

elements.modalOverlay.addEventListener("click", (event) => {
  if (event.target === elements.modalOverlay) closeEditModal();
});

elements.exportBtn.addEventListener("click", exportToCSV);

if (filterToggle) {
  filterToggle.addEventListener("click", toggleFilterMenu);
}

// Zoom controls (manipulate SVG viewBox)
const BASE_VIEWBOX = { x: 0, y: 0, w: 1800, h: 1600 };
const zoomState = { level: 1, panX: 0, panY: 0 };
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.2;

function applyZoom() {
  const svg = elements.svg;
  if (!svg) return;
  const w = BASE_VIEWBOX.w / zoomState.level;
  const h = BASE_VIEWBOX.h / zoomState.level;
  const x = BASE_VIEWBOX.x + (BASE_VIEWBOX.w - w) / 2 + zoomState.panX;
  const y = BASE_VIEWBOX.y + (BASE_VIEWBOX.h - h) / 2 + zoomState.panY;
  svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
}

function setZoom(next) {
  zoomState.level = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
  applyZoom();
}

const zoomInBtn = document.querySelector(".zoom-btn.zoom-in");
const zoomOutBtn = document.querySelector(".zoom-btn.zoom-out");
const fullscreenBtn = document.querySelector(".zoom-btn.zoom-fullscreen");

if (zoomInBtn) zoomInBtn.addEventListener("click", () => setZoom(zoomState.level + ZOOM_STEP));
if (zoomOutBtn) zoomOutBtn.addEventListener("click", () => setZoom(zoomState.level - ZOOM_STEP));
if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", () => {
    const target = document.querySelector(".right-content") || document.documentElement;
    if (!document.fullscreenElement) {
      const req = target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen;
      if (req) req.call(target);
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (exit) exit.call(document);
    }
  });
  document.addEventListener("fullscreenchange", () => {
    fullscreenBtn.classList.toggle("is-active", !!document.fullscreenElement);
    fullscreenBtn.title = document.fullscreenElement ? "Sair da tela cheia" : "Tela cheia";
  });
}

// Pan support (drag the SVG to move the teia)
(function setupPan() {
  const svg = elements.svg;
  if (!svg) return;
  let isPanning = false;
  let startClientX = 0;
  let startClientY = 0;
  let startPanX = 0;
  let startPanY = 0;

  svg.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    // Don't start panning when clicking an interactive node (bubble or source link)
    if (event.target.closest("a, .node-circle, .source-dot, .info-badge")) return;
    isPanning = true;
    startClientX = event.clientX;
    startClientY = event.clientY;
    startPanX = zoomState.panX;
    startPanY = zoomState.panY;
    svg.classList.add("is-panning");
    event.preventDefault();
  });

  window.addEventListener("mousemove", (event) => {
    if (!isPanning) return;
    const rect = svg.getBoundingClientRect();
    const viewW = BASE_VIEWBOX.w / zoomState.level;
    const viewH = BASE_VIEWBOX.h / zoomState.level;
    const scaleX = viewW / rect.width;
    const scaleY = viewH / rect.height;
    zoomState.panX = startPanX - (event.clientX - startClientX) * scaleX;
    zoomState.panY = startPanY - (event.clientY - startClientY) * scaleY;
    applyZoom();
  });

  window.addEventListener("mouseup", () => {
    if (!isPanning) return;
    isPanning = false;
    svg.classList.remove("is-panning");
  });

  svg.addEventListener("wheel", (event) => {
    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    setZoom(zoomState.level + direction * ZOOM_STEP);
  }, { passive: false });
})();

render();