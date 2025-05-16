const canvas = document.getElementById("pitchCanvas");
const ctx = canvas.getContext("2d");

const pitchWidth = 120;
const pitchHeight = 80;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let firstClick = true;
let startPos = [-1, -1];
let endPos = [-1, -1];

let collectedStats = []; // Array to store all submitted data

function drawPitch() {
  const ctx = canvas.getContext("2d");

  // Clear the pitch
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dimensions in meters mapped to canvas scale
  const fieldWidth = 120; // meters
  const fieldHeight = 80; // meters
  const scaleX = canvas.width / fieldWidth;
  const scaleY = canvas.height / fieldHeight;

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;

  // Draw outer boundary
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Midline
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 9.15 * scaleX, 0, 2 * Math.PI);
  ctx.stroke();

  // Center point
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 1.5, 0, 2 * Math.PI);
  ctx.fill();

  // Left penalty area
  ctx.strokeRect(
    0,
    (canvas.height - 40 * scaleY) / 2,
    18 * scaleX,
    40 * scaleY
  );
  // Right penalty area
  ctx.strokeRect(
    canvas.width - 18 * scaleX,
    (canvas.height - 40 * scaleY) / 2,
    18 * scaleX,
    40 * scaleY
  );

  // Left 6-yard box
  ctx.strokeRect(0, (canvas.height - 18 * scaleY) / 2, 6 * scaleX, 18 * scaleY);
  // Right 6-yard box
  ctx.strokeRect(
    canvas.width - 6 * scaleX,
    (canvas.height - 18 * scaleY) / 2,
    6 * scaleX,
    18 * scaleY
  );

  // Penalty spots
  ctx.beginPath();
  ctx.arc(11 * scaleX, canvas.height / 2, 1.5, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(canvas.width - 11 * scaleX, canvas.height / 2, 1.5, 0, 2 * Math.PI);
  ctx.fill();

  // Set a uniform scale (important)
  const scale = canvas.width / 120; // assuming 120m field length
  const pitchHeight = 80 * scale;
  const centerY = canvas.height / 2;

  // Penalty spot positions
  const leftX = 11 * scale;
  const rightX = canvas.width - 12 * scale;

  // Arc radius (9.15m)
  const r = 9.15 * scale;

  const leftPenaltyX = 12 * scale;

  // Draw top quarter
  ctx.beginPath();
  ctx.arc(leftPenaltyX, centerY, r, 1.71 * Math.PI, 2 * Math.PI);
  ctx.stroke();

  // Draw bottom quarter
  ctx.beginPath();
  ctx.arc(leftPenaltyX, centerY, r, 0, 0.29 * Math.PI);
  ctx.stroke();
  // RIGHT penalty arc (same, flipped direction)
  ctx.beginPath();
  ctx.arc(rightX, centerY, r, 1.28 * Math.PI, 0.72 * Math.PI, true); // top half, reversed
  ctx.stroke();

  // Corner arcs
  [0, canvas.width].forEach((x) => {
    [0, canvas.height].forEach((y) => {
      ctx.beginPath();
      ctx.arc(x, y, 1 * scaleX, 0, 0.5 * Math.PI);
      if (x === 0 && y === 0) ctx.arc(x, y, 1 * scaleX, 0, 0.5 * Math.PI);
      if (x === 0 && y === canvas.height)
        ctx.arc(x, y, 1 * scaleX, 1.5 * Math.PI, 2 * Math.PI);
      if (x === canvas.width && y === 0)
        ctx.arc(x, y, 1 * scaleX, 0.5 * Math.PI, Math.PI);
      if (x === canvas.width && y === canvas.height)
        ctx.arc(x, y, 1 * scaleX, Math.PI, 1.5 * Math.PI);
      ctx.stroke();
    });
  });
}

function drawArrow(fromX, fromY, toX, toY) {
  const headlen = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headlen * Math.cos(angle - Math.PI / 6),
    toY - headlen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headlen * Math.cos(angle + Math.PI / 6),
    toY - headlen * Math.sin(angle + Math.PI / 6)
  );
  ctx.lineTo(toX, toY);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();
}

function scaleToPitch(x, y) {
  return [(x / canvasWidth) * pitchWidth, (y / canvasHeight) * pitchHeight];
}

function scaleToCanvas(x, y) {
  return [(x / pitchWidth) * canvasWidth, (y / pitchHeight) * canvasHeight];
}

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const [xPitch, yPitch] = scaleToPitch(x, y);

  if (xPitch < 0 || xPitch > 120 || yPitch < 0 || yPitch > 80) return;

  if (firstClick) {
    startPos = [xPitch, yPitch];
    drawPitch();
    const [sx, sy] = scaleToCanvas(...startPos);
    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
    firstClick = false;
  } else {
    endPos = [xPitch, yPitch];
    drawPitch();
    const [sx, sy] = scaleToCanvas(...startPos);
    const [ex, ey] = scaleToCanvas(...endPos);
    drawArrow(sx, sy, ex, ey);
    firstClick = true;
  }
});

let editMode = false;
let editIndex = null;

function editRow(index) {
  const data = collectedStats[index];

  document.getElementById("game").value = data.game;
  document.getElementById("event").value = data.event;
  document.getElementById("result").value = data.result;
  document.getElementById("team").value = data.team;
  startPos = data.start_position;
  endPos = data.end_position;
  editMode = true;
  editIndex = index;

  drawPitch();
  const [sx, sy] = scaleToCanvas(...startPos);
  const [ex, ey] = scaleToCanvas(...endPos);
  drawArrow(sx, sy, ex, ey);
}

function deleteRow(index) {
  collectedStats.splice(index, 1);
  refreshTable();
  saveToLocalStorage();
}

function refreshTable() {
  const tableBody = document.querySelector("#statsTable tbody");
  tableBody.innerHTML = "";
  collectedStats.forEach((stat, i) => addRowToTable(stat, i));
}

function saveToLocalStorage() {
  localStorage.setItem("collectedStats", JSON.stringify(collectedStats));
}

function loadFromLocalStorage() {
  const savedStats = localStorage.getItem("collectedStats");
  if (savedStats) {
    collectedStats = JSON.parse(savedStats);
    collectedStats.forEach((data, i) => addRowToTable(data, i));
  }
}
 
function addRowToTable(data, index) {
  const tableBody = document.querySelector("#statsTable tbody");
  const newRow = document.createElement("tr");
  newRow.setAttribute("data-index", index);

  newRow.innerHTML = `
    <td>${data.game}</td>
    <td>${data.event}</td>
    <td>${data.result}</td>
    <td>${data.team}</td>
    <td>[${data.start_position.map((p) => p.toFixed(1)).join(", ")}]</td>
    <td>[${data.end_position.map((p) => p.toFixed(1)).join(", ")}]</td>
    <td>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </td>
  `;

  tableBody.appendChild(newRow);
  newRow.querySelector(".edit-btn").addEventListener("click", () => editRow(index));
  newRow.querySelector(".delete-btn").addEventListener("click", () => deleteRow(index));
}

document.getElementById("submitBtn").addEventListener("click", () => {
  const game = document.getElementById("game").value;
  const event = document.getElementById("event").value;
  const result = document.getElementById("result").value;
  const team = document.getElementById("team").value;

  if (startPos[0] === -1 || endPos[0] === -1) {
    alert("Please click two points on the pitch.");
    return;
  }

  const data = {
    game,
    event,
    result,
    team,
    start_position: startPos,
    end_position: endPos,
  };

  console.log("Submitted stat:", data);
  //   collectedStats.push(data);
  //   const index = collectedStats.length - 1;
  //   addRowToTable(data, index);
  if (editMode) {
    collectedStats[editIndex] = data;
    editMode = false;
    editIndex = null;
    refreshTable();
    saveToLocalStorage();
  } else {
    collectedStats.push(data);
    addRowToTable(data, collectedStats.length - 1);
    saveToLocalStorage();
  }

  // Reset canvas and positions
  startPos = [-1, -1];
  endPos = [-1, -1];
  drawPitch();
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  if (collectedStats.length === 0) {
    alert("No data to export.");
    return;
  }

  const headers = ["Game", "Event", "Result", "Team", "Start Pos", "End Pos"];
  const rows = collectedStats.map((stat) => [
    stat.game,
    stat.event,
    stat.result,
    stat.team,
    `"${stat.start_position.join(",")}"`,
    `"${stat.end_position.join(",")}"`,
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "collected_stats.csv");
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});
document.getElementById("closeBtn").addEventListener("click", () => {
  alert(
    "This would close the app. In browsers, you must close the tab manually."
  );
});


window.onload = loadFromLocalStorage;

drawPitch();
