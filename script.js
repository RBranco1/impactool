const VOLUME_UNITS = {
  L: { label: "L", toLiters: 1 },
  m3: { label: "m3", toLiters: 1000 },
  gal: { label: "gal", toLiters: 3.78541 }
};

const WEB_CONFIG = {
  centerLabel: "Biocombustivel",
  centerRadius: 82,
  firstNodeRadius: 170,
  nodeStepRadius: 125,
  // Adicione ou remova caminhos neste array.
  // Cada caminho pode ter quantos pontos quiser no array points.
  tracks: [
    {
      id: "mobility-light-heavy",
      title: "Frota rodada",
      points: [
        {
          id: "lightVehicleKm",
          title: "Veiculo leve",
          outputUnit: "km",
          factorPerLiter: 0.2,
          sourceUrl: "https://fonte-ficticia.example/veiculo-leve"
        },
        {
          id: "heavyVehicleKm",
          title: "Veiculo pesado",
          outputUnit: "km",
          factorPerLiter: 0.1,
          sourceUrl: "https://fonte-ficticia.example/veiculo-pesado"
        }
      ]
    },
    {
      id: "two-wheel-logistics",
      title: "Duas rodas",
      points: [
        {
          id: "motorcycleKm",
          title: "Moto",
          outputUnit: "km",
          factorPerLiter: 0.3,
          sourceUrl: "https://fonte-ficticia.example/moto"
        },
        {
          id: "deliveryTrips",
          title: "Entregas urbanas",
          outputUnit: "trajetos",
          factorPerLiter: 0.12,
          sourceUrl: "https://fonte-ficticia.example/entregas"
        }
      ]
    },
    {
      id: "environment-impact",
      title: "Ambiental",
      points: [
        {
          id: "savedCo2",
          title: "CO2 economizado",
          outputUnit: "kg",
          factorPerLiter: 0.5,
          sourceUrl: "https://fonte-ficticia.example/co2"
        },
        {
          id: "treesEquivalent",
          title: "Arvores equivalentes",
          outputUnit: "arvores",
          factorPerLiter: 0.5,
          sourceUrl: "https://fonte-ficticia.example/arvores"
        }
      ]
    },
    {
      id: "industrial-use",
      title: "Uso industrial",
      points: [
        {
          id: "boilerHours",
          title: "Horas em caldeira",
          outputUnit: "h",
          factorPerLiter: 0.045,
          sourceUrl: "https://fonte-ficticia.example/caldeira"
        },
        {
          id: "steamVolume",
          title: "Vapor gerado",
          outputUnit: "m3",
          factorPerLiter: 0.62,
          sourceUrl: "https://fonte-ficticia.example/vapor"
        }
      ]
    },
    {
      id: "agro-operations",
      title: "Operacao agricola",
      points: [
        {
          id: "tractorHours",
          title: "Horas de trator",
          outputUnit: "h",
          factorPerLiter: 0.08,
          sourceUrl: "https://fonte-ficticia.example/trator"
        },
        {
          id: "hectaresCovered",
          title: "Hectares cobertos",
          outputUnit: "ha",
          factorPerLiter: 0.03,
          sourceUrl: "https://fonte-ficticia.example/hectares"
        }
      ]
    }
  ]
};

const state = {
  liters: 100,
  volumeUnit: "L",
  activeTracks: new Set(WEB_CONFIG.tracks.map((track) => track.id)),
  resultsByTrack: []
};

const elements = {
  form: document.getElementById("converter-form"),
  litersInput: document.getElementById("liters"),
  unitSelect: document.getElementById("volume-unit"),
  svg: document.getElementById("web"),
  summary: document.getElementById("summary"),
  trackFiltersList: document.getElementById("track-filters-list")
};

function sanitizeNumber(rawValue) {
  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return numeric;
}

function litersToCurrentUnit(liters, unitKey) {
  return liters / VOLUME_UNITS[unitKey].toLiters;
}

function currentUnitToLiters(value, unitKey) {
  return value * VOLUME_UNITS[unitKey].toLiters;
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2
  }).format(value);
}

function formatInputValue(value) {
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return String(rounded);
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

function getVisibleTracks(resultsByTrack) {
  return resultsByTrack.filter((track) => state.activeTracks.has(track.id));
}

function renderSummary(liters, visibleTracks) {
  const pointCount = visibleTracks.reduce((acc, track) => acc + track.points.length, 0);
  const centerValue = litersToCurrentUnit(liters, state.volumeUnit);
  const unit = VOLUME_UNITS[state.volumeUnit].label;

  elements.summary.textContent = `${formatNumber(centerValue)} ${unit} equivalem a ${pointCount} conversoes em ${visibleTracks.length} trilhas ativas.`;
}

function buildTrackFilters() {
  elements.trackFiltersList.innerHTML = "";

  WEB_CONFIG.tracks.forEach((track) => {
    const row = document.createElement("label");
    row.className = "track-filter-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = state.activeTracks.has(track.id);
    checkbox.dataset.trackId = track.id;

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        state.activeTracks.add(track.id);
      } else {
        state.activeTracks.delete(track.id);
      }
      render();
    });

    const text = document.createElement("span");
    text.textContent = track.title;

    row.appendChild(checkbox);
    row.appendChild(text);
    elements.trackFiltersList.appendChild(row);
  });
}

function drawWeb(liters, visibleTracks, config) {
  const svg = elements.svg;
  svg.innerHTML = "";

  const width = 1000;
  const height = 700;
  const centerX = width / 2;
  const centerY = height / 2;

  if (visibleTracks.length === 0) {
    const centerCircle = createSvg("circle", {
      cx: centerX,
      cy: centerY,
      r: config.centerRadius,
      class: "node-circle center"
    });
    svg.appendChild(centerCircle);

    const emptyText = createSvg(
      "text",
      {
        x: centerX,
        y: centerY + 6,
        "text-anchor": "middle",
        class: "node-value"
      },
      "Ative ao menos um caminho"
    );
    svg.appendChild(emptyText);
    return;
  }

  const trackCount = visibleTracks.length;
  const angleStep = (Math.PI * 2) / trackCount;
  const maxDepth = Math.max(...visibleTracks.map((track) => track.points.length), 1);
  const outerRadius = config.firstNodeRadius + (maxDepth - 1) * config.nodeStepRadius;

  const ring = createSvg("circle", {
    cx: centerX,
    cy: centerY,
    r: outerRadius,
    fill: "none",
    stroke: "#dce6f1",
    "stroke-width": 2
  });
  svg.appendChild(ring);

  const centerCircle = createSvg("circle", {
    cx: centerX,
    cy: centerY,
    r: config.centerRadius,
    class: "node-circle center"
  });
  svg.appendChild(centerCircle);

  const centerSubtext = createSvg(
    "text",
    {
      x: centerX,
      y: centerY + 43,
      "text-anchor": "middle",
      class: "node-value"
    },
    config.centerLabel
  );
  svg.appendChild(centerSubtext);

  visibleTracks.forEach((track, trackIndex) => {
    const angle = angleStep * trackIndex - Math.PI / 2;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const firstRadius = config.firstNodeRadius;
    const firstX = centerX + cos * firstRadius;
    const firstY = centerY + sin * firstRadius;

    const centerToTrack = createSvg("line", {
      x1: centerX,
      y1: centerY,
      x2: firstX,
      y2: firstY,
      class: "link-line"
    });
    svg.appendChild(centerToTrack);

    const labelRadius = Math.max(firstRadius - 72, 90);
    const labelX = centerX + cos * labelRadius;
    const labelY = centerY + sin * labelRadius;

    const trackLabel = createSvg(
      "text",
      {
        x: labelX,
        y: labelY,
        "text-anchor": "middle",
        class: "link-label"
      },
      track.title
    );
    svg.appendChild(trackLabel);

    track.points.forEach((point, pointIndex) => {
      const currentRadius = config.firstNodeRadius + pointIndex * config.nodeStepRadius;
      const x = centerX + cos * currentRadius;
      const y = centerY + sin * currentRadius;

      if (pointIndex > 0) {
        const prevRadius = config.firstNodeRadius + (pointIndex - 1) * config.nodeStepRadius;
        const prevX = centerX + cos * prevRadius;
        const prevY = centerY + sin * prevRadius;

        const segment = createSvg("line", {
          x1: prevX,
          y1: prevY,
          x2: x,
          y2: y,
          class: "link-line"
        });
        svg.appendChild(segment);
      }

      const pointCircle = createSvg("circle", {
        cx: x,
        cy: y,
        r: 14,
        class: "node-circle"
      });
      svg.appendChild(pointCircle);

      const textAnchor = x >= centerX ? "start" : "end";
      const textOffset = x >= centerX ? 24 : -24;

      const pointTitle = createSvg(
        "text",
        {
          x: x + textOffset,
          y: y - 6,
          "text-anchor": textAnchor,
          class: "node-title"
        },
        point.title
      );
      svg.appendChild(pointTitle);

      const inputWidth = 130;
      const inputX = x >= centerX ? x + 18 : x - (inputWidth + 18);
      const inputY = y + 3;

      const foreignObject = createSvg("foreignObject", {
        x: inputX,
        y: inputY,
        width: inputWidth,
        height: 36
      });

      const wrapper = createXHtml("div", { class: "node-editor" });
      const input = createXHtml("input", {
        class: "node-input",
        type: "number",
        min: "0",
        step: "0.1",
        value: formatInputValue(point.value)
      });

      input.addEventListener("change", (event) => {
        const typedValue = sanitizeNumber(event.target.value);
        if (point.factorPerLiter <= 0) return;

        state.liters = typedValue / point.factorPerLiter;
        elements.litersInput.value = formatInputValue(
          litersToCurrentUnit(state.liters, state.volumeUnit)
        );
        render();
      });

      const unit = createXHtml("span", { class: "node-unit" }, point.outputUnit);

      wrapper.appendChild(input);
      wrapper.appendChild(unit);
      foreignObject.appendChild(wrapper);
      svg.appendChild(foreignObject);

      const sourceDot = createSvg("a", {
        href: point.sourceUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        "aria-label": `Fonte de ${point.title}`
      });
      sourceDot.appendChild(
        createSvg("circle", {
          cx: x + (x >= centerX ? 10 : -10),
          cy: y + 26,
          r: 6,
          class: "source-dot"
        })
      );
      svg.appendChild(sourceDot);
    });
  });
}

function render() {
  state.resultsByTrack = calculateResults(state.liters, WEB_CONFIG);
  const visibleTracks = getVisibleTracks(state.resultsByTrack);
  renderSummary(state.liters, visibleTracks);
  drawWeb(state.liters, visibleTracks, WEB_CONFIG);
}

function bindCenterEvents() {
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
  });

  elements.unitSelect.value = state.volumeUnit;
  elements.litersInput.value = formatInputValue(litersToCurrentUnit(state.liters, state.volumeUnit));

  elements.litersInput.addEventListener("change", () => {
    const centerValue = sanitizeNumber(elements.litersInput.value);
    state.liters = currentUnitToLiters(centerValue, state.volumeUnit);
    elements.litersInput.value = formatInputValue(centerValue);
    render();
  });

  elements.unitSelect.addEventListener("change", () => {
    const previousUnit = state.volumeUnit;
    state.volumeUnit = elements.unitSelect.value;

    const previousValue = sanitizeNumber(elements.litersInput.value);
    const liters = currentUnitToLiters(previousValue, previousUnit);
    const converted = litersToCurrentUnit(liters, state.volumeUnit);

    state.liters = liters;
    elements.litersInput.value = formatInputValue(converted);
    render();
  });
}

buildTrackFilters();
bindCenterEvents();
render();
