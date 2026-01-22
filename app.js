const app = {
  elements: [],
  selectedId: null,

  draggingId: null,
  dragOffset: { x: 0, y: 0 },

  resizingHandle: null,
  resizeStartData: null,

  rotatingId: null,

  dragSrcIndex: null,

  // DOM
  canvas: document.getElementById("canvas"),
  propPanel: document.getElementById("properties-panel"),
  emptyState: document.getElementById("empty-state"),
  propIdDisplay: document.getElementById("prop-id-display"),
  metadataDisplay: document.getElementById("metadata-display"),
  btnDelete: document.getElementById("btn-delete"),
  layersList: document.getElementById("layers-list"),

  inputs: {
    x: document.getElementById("inp-x"),
    y: document.getElementById("inp-y"),
    w: document.getElementById("inp-width"),
    h: document.getElementById("inp-height"),
    rotation: document.getElementById("inp-rotation"),
    colorPicker: document.getElementById("inp-color-picker"),
    colorText: document.getElementById("inp-color-text"),
    // Text
    content: document.getElementById("inp-content"),
    fontSize: document.getElementById("inp-fontsize"),
    textColorPicker: document.getElementById("inp-text-color-picker"),
    btnAlignLeft: document.getElementById("btn-align-left"),
    btnAlignCenter: document.getElementById("btn-align-center"),
    btnAlignRight: document.getElementById("btn-align-right"),
  },

  init() {
    lucide.createIcons();
    this.setupEventListeners();
    this.setupInputListeners();
    this.setupKeyboardListeners();
    this.updateLayersPanel();
    this.loadFromLocalStorage();

    setInterval(() => {
      this.saveToLocalStorage();
    }, 5000);
  },

  addElement(type) {
    const id = crypto.randomUUID();
    const offset = this.elements.length * 10;
    const isShape = ["rectangle", "circle", "triangle"].includes(type);

    const newEl = {
      id: id,
      type: type,
      x: 100 + offset,
      y: 100 + offset,
      width: isShape ? 150 : 200,
      height: type === "text" ? 40 : 150,
      rotation: 0,
      backgroundColor: isShape ? "#e2e8f0" : "transparent",
      content: type === "text" ? "Hello World" : "",
      fontSize: 16,
      // Text Specific Defaults
      color: type === "text" ? "#000000" : "transparent",
      textAlign: "left",
    };

    this.elements.push(newEl);
    this.renderElementToDOM(newEl);
    this.selectElement(id);
    this.updateLayersPanel();
  },

  renderElementToDOM(data) {
    const el = document.createElement("div");
    el.id = data.id;
    el.className =
      "element-node group hover:ring-1 hover:ring-purple-300 cursor-move";
    el.dataset.type = data.type;

    const inner = document.createElement("div");
    inner.className = "w-full h-full p-2 outline-none pointer-events-none";
    inner.style.overflow = "hidden";
    inner.style.wordWrap = "break-word";

    if (data.type === "circle") {
      inner.style.borderRadius = "50%";
    } else if (data.type === "triangle") {
      inner.style.clipPath = "polygon(50% 0%, 0% 100%, 100% 100%)";
    }

    el.appendChild(inner);

    const label = document.createElement("div");
    label.className = "type-label";
    label.innerText = data.type;
    el.appendChild(label);

    ["tl", "tr", "bl", "br"].forEach((h) => {
      const handle = document.createElement("div");
      handle.className = `resize-handle handle-${h}`;
      handle.dataset.handle = h;
      el.appendChild(handle);
    });

    const rotLine = document.createElement("div");
    rotLine.className = "rotate-line";
    el.appendChild(rotLine);

    const rotHandle = document.createElement("div");
    rotHandle.className = "rotate-handle";
    rotHandle.dataset.action = "rotate";
    el.appendChild(rotHandle);

    this.canvas.appendChild(el);
    this.updateElementDOM(data);
  },

  updateElementDOM(data) {
    const el = document.getElementById(data.id);
    if (!el) return;

    el.style.left = `${data.x}px`;
    el.style.top = `${data.y}px`;
    el.style.width = `${data.width}px`;
    el.style.height = `${data.height}px`;
    el.style.transform = `rotate(${data.rotation}deg)`;
    el.style.backgroundColor = "transparent";

    const inner = el.querySelector("div");
    inner.style.backgroundColor = data.backgroundColor;

    if (data.type === "text") {
      inner.innerText = data.content;
      inner.style.fontSize = `${data.fontSize}px`;
      inner.style.color = data.color;
      inner.style.textAlign = data.textAlign;
      inner.style.whiteSpace = "pre-wrap";
    } else {
      inner.innerText = "";
    }

    if (this.selectedId === data.id) {
      el.classList.add("selected");
    } else {
      el.classList.remove("selected");
    }
  },

  selectElement(id) {
    if (this.selectedId) {
      const prev = document.getElementById(this.selectedId);
      if (prev) prev.classList.remove("selected");
    }

    this.selectedId = id;

    if (id) {
      const el = document.getElementById(id);
      if (el) el.classList.add("selected");
      this.emptyState.classList.add("hidden");
      this.propPanel.classList.remove("hidden");
      this.btnDelete.disabled = false;
      this.btnDelete.classList.remove("text-gray-300", "cursor-not-allowed");
      this.btnDelete.classList.add("text-red-500", "hover:bg-red-50");
      this.populateSidebar();
    } else {
      this.emptyState.classList.remove("hidden");
      this.propPanel.classList.add("hidden");
      this.btnDelete.disabled = true;
      this.btnDelete.classList.add("text-gray-300", "cursor-not-allowed");
      this.btnDelete.classList.remove("text-red-500", "hover:bg-red-50");
      this.propIdDisplay.innerText = "No selection";
    }

    this.updateLayersPanel();
  },

  deleteSelected() {
    if (!this.selectedId) return;
    const el = document.getElementById(this.selectedId);
    if (el) el.remove();
    this.elements = this.elements.filter((e) => e.id !== this.selectedId);
    this.selectElement(null);
    this.updateLayersPanel();
  },

  // --- Export Functions ---

  exportJSON() {
    const dataStr = JSON.stringify(this.elements, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "design.json";
    a.click();
    URL.revokeObjectURL(url);
  },

  escapeHtml(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  exportHTML() {
    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Design</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f3f4f6; width: 100vw; height: 100vh; overflow: hidden; position: relative; }
        .element { position: absolute; box-sizing: border-box; }
        .inner { width: 100%; height: 100%; display: flex; align-items: flex-start; overflow: hidden; }
    </style>
</head>
<body>
`;
    // Iterating elements in order (bottom to top)
    this.elements.forEach((el) => {
      // Outer styles
      const outerStyle = `
                        left: ${el.x}px;
                        top: ${el.y}px;
                        width: ${el.width}px;
                        height: ${el.height}px;
                        transform: rotate(${el.rotation}deg);
                    `;

      // Inner styles (shape, color, font)
      let innerStyle = `background-color: ${el.backgroundColor};`;

      if (el.type === "circle") innerStyle += " border-radius: 50%;";
      if (el.type === "triangle")
        innerStyle += " clip-path: polygon(50% 0%, 0% 100%, 100% 100%);";

      if (el.type === "text") {
        innerStyle += ` font-size: ${el.fontSize}px; color: ${el.color}; text-align: ${el.textAlign}; padding: 8px; white-space: pre-wrap;`;
      }

      const content = el.type === "text" ? this.escapeHtml(el.content) : "";

      htmlContent += `
    <div class="element" style="${outerStyle.replace(/\s+/g, " ")}">
        <div class="inner" style="${innerStyle.replace(/\s+/g, " ")}">${content}</div>
    </div>\n`;
    });

    htmlContent += `</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "design.html";
    a.click();
    URL.revokeObjectURL(url);
  },

  // --- Layer Management & Drag Drop ---

  reorderLayer(direction) {
    if (!this.selectedId) return;

    const index = this.elements.findIndex((e) => e.id === this.selectedId);
    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.elements.length) return;

    const temp = this.elements[index];
    this.elements[index] = this.elements[newIndex];
    this.elements[newIndex] = temp;

    this.refreshCanvasZOrder();
    this.updateLayersPanel();
  },

  refreshCanvasZOrder() {
    this.elements.forEach((data) => {
      const el = document.getElementById(data.id);
      if (el) {
        this.canvas.appendChild(el);
      }
    });
  },

  updateLayersPanel() {
    this.layersList.innerHTML = "";

    [...this.elements].reverse().forEach((el, reversedIndex) => {
      const realIndex = this.elements.length - 1 - reversedIndex;

      const item = document.createElement("div");
      item.className = `layer-item px-4 py-2 flex items-center gap-3 text-sm ${el.id === this.selectedId ? "active" : "text-gray-600"}`;
      item.draggable = true;
      item.dataset.index = realIndex;

      item.onclick = (e) => {
        this.selectElement(el.id);
      };

      item.addEventListener("dragstart", (e) =>
        this.handleDragStart(e, realIndex),
      );
      item.addEventListener("dragover", (e) => this.handleDragOver(e));
      item.addEventListener("dragenter", (e) => this.handleDragEnter(e));
      item.addEventListener("dragleave", (e) => this.handleDragLeave(e));
      item.addEventListener("drop", (e) => this.handleDrop(e, realIndex));

      // Icons
      let iconHtml = '<i data-lucide="box" class="w-4 h-4"></i>';
      if (el.type === "rectangle")
        iconHtml = '<i data-lucide="square" class="w-4 h-4"></i>';
      if (el.type === "circle")
        iconHtml = '<i data-lucide="circle" class="w-4 h-4"></i>';
      if (el.type === "triangle")
        iconHtml = '<i data-lucide="triangle" class="w-4 h-4"></i>';
      if (el.type === "text")
        iconHtml = '<i data-lucide="type" class="w-4 h-4"></i>';

      // Label
      let labelText = el.type.charAt(0).toUpperCase() + el.type.slice(1);
      if (el.type === "text") {
        labelText = el.content || "Text Layer";
      }
      if (labelText.length > 20) labelText = labelText.substring(0, 20) + "...";

      item.innerHTML = `
                        ${iconHtml}
                        <span class="truncate pointer-events-none">${labelText}</span>
                    `;
      this.layersList.appendChild(item);
    });

    lucide.createIcons();
  },

  // --- Drag Handlers ---

  handleDragStart(e, index) {
    this.dragSrcIndex = index;
    e.target.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index);
  },

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    return false;
  },

  handleDragEnter(e) {
    const target = e.target.closest(".layer-item");
    if (target) target.classList.add("drag-over");
  },

  handleDragLeave(e) {
    const target = e.target.closest(".layer-item");
    if (target) target.classList.remove("drag-over");
  },

  handleDrop(e, targetIndex) {
    e.stopPropagation();
    const target = e.target.closest(".layer-item");
    if (target) target.classList.remove("drag-over");

    const srcIndex = this.dragSrcIndex;
    if (srcIndex === targetIndex || srcIndex === null) return;

    let insertionIndex = targetIndex;
    if (srcIndex > targetIndex) {
      insertionIndex = targetIndex + 1;
    }

    const [movedEl] = this.elements.splice(srcIndex, 1);
    this.elements.splice(insertionIndex, 0, movedEl);

    this.refreshCanvasZOrder();
    this.updateLayersPanel();
    this.selectElement(movedEl.id);
    this.dragSrcIndex = null;
  },

  // --- Sidebar & Input Logic ---

  populateSidebar() {
    const data = this.elements.find((e) => e.id === this.selectedId);
    if (!data) return;

    this.propIdDisplay.innerText = `ID: ${data.id}`;
    document.getElementById("type-settings-header").innerText =
      `${data.type} Settings`;

    this.inputs.x.value = Math.round(data.x);
    this.inputs.y.value = Math.round(data.y);
    this.inputs.w.value = Math.round(data.width);
    this.inputs.h.value = Math.round(data.height);
    this.inputs.rotation.value = Math.round(data.rotation);

    const grpShape = document.getElementById("group-shape");
    const grpText = document.getElementById("group-text");

    // Shapes share the fill color picker
    if (["rectangle", "circle", "triangle"].includes(data.type)) {
      grpShape.classList.remove("hidden");
      grpText.classList.add("hidden");
      this.inputs.colorPicker.value = data.backgroundColor;
      this.inputs.colorText.value = data.backgroundColor;
    } else {
      grpShape.classList.add("hidden");
      grpText.classList.remove("hidden");
      this.inputs.content.value = data.content;
      this.inputs.fontSize.value = data.fontSize;

      // New Text Props
      this.inputs.textColorPicker.value = data.color;

      // Highlight Active Alignment
      ["Left", "Center", "Right"].forEach((align) => {
        const btn = this.inputs[`btnAlign${align}`];
        if (data.textAlign === align.toLowerCase()) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    this.metadataDisplay.innerText = JSON.stringify(
      {
        id: data.id,
        type: data.type,
        zIndex: this.elements.indexOf(data),
        dims: { w: data.width, h: data.height, x: data.x, y: data.y },
        rotation: data.rotation,
        color: data.color,
        align: data.textAlign,
      },
      null,
      2,
    );
  },

  updateFromInput(key, value) {
    if (!this.selectedId) return;
    const data = this.elements.find((e) => e.id === this.selectedId);
    if (!data) return;

    if (["x", "y", "width", "height", "fontSize", "rotation"].includes(key)) {
      value = parseFloat(value) || 0;
    }

    data[key] = value;
    this.updateElementDOM(data);

    if (key === "backgroundColor") {
      this.inputs.colorPicker.value = value;
      this.inputs.colorText.value = value;
    }

    if (key === "content") {
      this.updateLayersPanel();
    }

    this.populateSidebar();
  },

  setupEventListeners() {
    this.canvas.addEventListener("mousedown", (e) => {
      if (e.target.dataset.action === "rotate") {
        e.stopPropagation();
        e.preventDefault();
        const id = e.target.closest(".element-node").id;
        this.rotatingId = id;
        this.selectElement(id);
        return;
      }

      if (e.target.classList.contains("resize-handle")) {
        e.stopPropagation();
        e.preventDefault();
        const handleType = e.target.dataset.handle;
        const elNode = e.target.closest(".element-node");
        const data = this.elements.find((el) => el.id === elNode.id);

        this.resizingHandle = handleType;
        this.resizeStartData = {
          x: data.x,
          y: data.y,
          w: data.width,
          h: data.height,
          mx: e.clientX,
          my: e.clientY,
          rotation: data.rotation,
        };
        return;
      }

      const targetEl = e.target.closest(".element-node");
      if (targetEl) {
        e.stopPropagation();
        const id = targetEl.id;
        this.selectElement(id);
        const data = this.elements.find((el) => el.id === id);
        this.draggingId = id;
        this.dragOffset = {
          x: e.clientX - data.x,
          y: e.clientY - data.y,
        };
      } else {
        this.selectElement(null);
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (this.rotatingId) {
        const data = this.elements.find((el) => el.id === this.rotatingId);
        const rect = document.getElementById(data.id).getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const angleRad = Math.atan2(e.clientY - cy, e.clientX - cx);
        let angleDeg = angleRad * (180 / Math.PI);
        angleDeg += 90;
        data.rotation = angleDeg;
        this.updateElementDOM(data);
        this.populateSidebar();
        return;
      }

      if (this.resizingHandle && this.selectedId) {
        const data = this.elements.find((el) => el.id === this.selectedId);
        const start = this.resizeStartData;
        const sdx = e.clientX - start.mx;
        const sdy = e.clientY - start.my;
        const rad = (angle) => angle * (Math.PI / 180);
        const r = start.rotation || 0;
        const dx = sdx * Math.cos(rad(-r)) - sdy * Math.sin(rad(-r));
        const dy = sdx * Math.sin(rad(-r)) + sdy * Math.cos(rad(-r));
        const minSize = 20;

        if (this.resizingHandle.includes("r"))
          data.width = Math.max(minSize, start.w + dx);
        if (this.resizingHandle.includes("b"))
          data.height = Math.max(minSize, start.h + dy);
        if (this.resizingHandle.includes("l")) {
          const newW = Math.max(minSize, start.w - dx);
          if (newW > minSize) {
            data.x = start.x + (dx * Math.cos(rad(r)) - dy * Math.sin(rad(r)));
            data.width = newW;
            data.x = start.x + dx;
          }
        }
        if (this.resizingHandle.includes("t")) {
          const newH = Math.max(minSize, start.h - dy);
          if (newH > minSize) {
            data.y = start.y + dy;
            data.height = newH;
          }
        }
        this.updateElementDOM(data);
        this.populateSidebar();
        return;
      }

      if (this.draggingId) {
        const data = this.elements.find((el) => el.id === this.draggingId);
        if (data) {
          data.x = e.clientX - this.dragOffset.x;
          data.y = e.clientY - this.dragOffset.y;
          this.updateElementDOM(data);
          this.populateSidebar();
        }
      }
    });

    window.addEventListener("mouseup", () => {
      this.draggingId = null;
      this.resizingHandle = null;
      this.resizeStartData = null;
      this.rotatingId = null;
    });
  },

  setupInputListeners() {
    const bind = (input, key) => {
      input.addEventListener("input", (e) =>
        this.updateFromInput(key, e.target.value),
      );
    };

    bind(this.inputs.x, "x");
    bind(this.inputs.y, "y");
    bind(this.inputs.w, "width");
    bind(this.inputs.h, "height");
    bind(this.inputs.rotation, "rotation");
    bind(this.inputs.colorPicker, "backgroundColor");
    bind(this.inputs.colorText, "backgroundColor");

    // Text
    bind(this.inputs.content, "content");
    bind(this.inputs.fontSize, "fontSize");
    bind(this.inputs.textColorPicker, "color");

    // Alignment
    this.inputs.btnAlignLeft.onclick = () =>
      this.updateFromInput("textAlign", "left");
    this.inputs.btnAlignCenter.onclick = () =>
      this.updateFromInput("textAlign", "center");
    this.inputs.btnAlignRight.onclick = () =>
      this.updateFromInput("textAlign", "right");
  },

  setupKeyboardListeners() {
    window.addEventListener("keydown", (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName))
        return;

      if (!this.selectedId) return;

      const data = this.elements.find((el) => el.id === this.selectedId);
      if (!data) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        this.deleteSelected();
        return;
      }

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const step = 5;
        let newX = data.x;
        let newY = data.y;
        const maxX = this.canvas.clientWidth - data.width;
        const maxY = this.canvas.clientHeight - data.height;

        if (e.key === "ArrowUp") newY -= step;
        if (e.key === "ArrowDown") newY += step;
        if (e.key === "ArrowLeft") newX -= step;
        if (e.key === "ArrowRight") newX += step;

        newX = Math.max(0, newX);
        newY = Math.max(0, newY);
        if (maxX > 0) newX = Math.min(newX, maxX);
        if (maxY > 0) newY = Math.min(newY, maxY);

        data.x = newX;
        data.y = newY;
        this.updateElementDOM(data);
        this.populateSidebar();
      }
    });
  },
  saveToLocalStorage() {
    const dataStr = JSON.stringify(this.elements);
    localStorage.setItem("figma_clone_data", dataStr);
  },

  loadFromLocalStorage() {
    const dataStr = localStorage.getItem("figma_clone_data");
    if (!dataStr) return;
    try {
      const dataArr = JSON.parse(dataStr);
      if (Array.isArray(dataArr)) {
        dataArr.forEach((data) => {
          this.elements.push(data);
          this.renderElementToDOM(data);
        });
        this.updateLayersPanel();
      }
    } catch (err) {
      console.error("Failed to load data from localStorage:", err);
    }
  },
};

app.init();
