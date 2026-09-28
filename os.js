const coverPage = document.getElementById("coverPage");
const simulatorView = document.getElementById("simulatorView");
const proceedBtn = document.getElementById("proceedBtn");
const addProcessBtn = document.getElementById("addProcessBtn");
const simulateBtn = document.getElementById("simulateBtn");
const processTableBody = document.getElementById("processTableBody");
const resultsTableBody = document.getElementById("resultsTableBody");
const comparisonTableBody = document.getElementById("comparisonTableBody");
const ganttChart = document.getElementById("ganttChart");
const quantumContainer = document.getElementById("quantumContainer");
const timeQuantum = document.getElementById("timeQuantum");
const avgWaiting = document.getElementById("avgWaiting");
const avgTurnaround = document.getElementById("avgTurnaround");
const avgResponse = document.getElementById("avgResponse");
const cpuUtilization = document.getElementById("cpuUtilization");

let selectedAlgorithm = "FCFS";
let processCounter = 5;

proceedBtn.addEventListener("click", () => {
    coverPage.style.display = "none";
    simulatorView.style.display = "block";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

function createProcessRow(name, arrival, burst, priority) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>
            <input type="text" class="process-name" value="${name}">
        </td>
        <td>
            <input type="number" class="arrival-time" min="0" value="${arrival}">
        </td>
        <td>
            <input type="number" class="burst-time" min="1" value="${burst}">
        </td>
        <td>
            <input type="number" class="priority-value" min="1" value="${priority}">
        </td>
        <td>
            <button class="delete-btn" type="button">×</button>
        </td>
    `;

    row.querySelector(".delete-btn").addEventListener("click", () => {
        row.remove();
        updateProcessNames();
        clearResults();
    });

    processTableBody.appendChild(row);
}

createProcessRow("P1", 0, 5, 1);
createProcessRow("P2", 1, 3, 2);
createProcessRow("P3", 2, 4, 3);
createProcessRow("P4", 3, 2, 4);
createProcessRow("P5", 4, 3, 5);

document.querySelectorAll(".algorithm-card").forEach(card => {
    card.addEventListener("click", () => {
        document.querySelectorAll(".algorithm-card").forEach(item => {
            item.classList.remove("active");
        });

        card.classList.add("active");
        selectedAlgorithm = card.dataset.algorithm;

        quantumContainer.style.display =
            selectedAlgorithm === "RR" ? "block" : "none";

        clearResults();
    });
});

addProcessBtn.addEventListener("click", () => {
    processCounter++;

    createProcessRow(
        `P${processCounter}`,
        0,
        1,
        processCounter
    );
});

function updateProcessNames() {
    const rows = processTableBody.querySelectorAll("tr");

    rows.forEach((row, index) => {
        const input = row.querySelector(".process-name");

        if (!input.value.trim()) {
            input.value = `P${index + 1}`;
        }
    });
}

function getProcesses() {
    const rows = processTableBody.querySelectorAll("tr");
    const processes = [];

    rows.forEach((row, index) => {
        const name =
            row.querySelector(".process-name").value.trim();

        const arrival =
            Number(row.querySelector(".arrival-time").value);

        const burst =
            Number(row.querySelector(".burst-time").value);

        const priority =
            Number(row.querySelector(".priority-value").value);

        if (
            !name ||
            !Number.isFinite(arrival) ||
            !Number.isFinite(burst) ||
            !Number.isFinite(priority)
        ) {
            return;
        }

        if (
            arrival < 0 ||
            burst <= 0 ||
            priority <= 0
        ) {
            return;
        }

        processes.push({
            id: name,
            arrival,
            burst,
            priority,
            originalIndex: index
        });
    });

    return processes;
}

function fcfs(processes) {
    const sorted = [...processes].sort(
        (a, b) =>
            a.arrival - b.arrival ||
            a.originalIndex - b.originalIndex
    );

    let time = 0;
    const result = [];
    const segments = [];

    sorted.forEach(process => {
        if (time < process.arrival) {
            segments.push({
                id: "IDLE",
                start: time,
                end: process.arrival
            });

            time = process.arrival;
        }

        const start = time;
        const end = time + process.burst;

        segments.push({
            id: process.id,
            start,
            end
        });

        result.push({
            ...process,
            start,
            completion: end,
            turnaround: end - process.arrival,
            waiting: start - process.arrival,
            response: start - process.arrival
        });

        time = end;
    });

    return {
        processes: result,
        segments
    };
}

function sjf(processes) {
    const remaining = processes.map(process => ({
        ...process
    }));

    const result = [];
    const segments = [];
    let time = 0;

    while (remaining.length > 0) {
        const available = remaining.filter(
            process => process.arrival <= time
        );

        if (available.length === 0) {
            const nextArrival = Math.min(
                ...remaining.map(process => process.arrival)
            );

            segments.push({
                id: "IDLE",
                start: time,
                end: nextArrival
            });

            time = nextArrival;
            continue;
        }

        available.sort(
            (a, b) =>
                a.burst - b.burst ||
                a.arrival - b.arrival ||
                a.originalIndex - b.originalIndex
        );

        const process = available[0];
        const index = remaining.indexOf(process);

        remaining.splice(index, 1);

        const start = time;
        const end = time + process.burst;

        segments.push({
            id: process.id,
            start,
            end
        });

        result.push({
            ...process,
            start,
            completion: end,
            turnaround: end - process.arrival,
            waiting: start - process.arrival,
            response: start - process.arrival
        });

        time = end;
    }

    return {
        processes: result,
        segments
    };
}

function priorityScheduling(processes) {
    const remaining = processes.map(process => ({
        ...process
    }));

    const result = [];
    const segments = [];
    let time = 0;

    while (remaining.length > 0) {
        const available = remaining.filter(
            process => process.arrival <= time
        );

        if (available.length === 0) {
            const nextArrival = Math.min(
                ...remaining.map(process => process.arrival)
            );

            segments.push({
                id: "IDLE",
                start: time,
                end: nextArrival
            });

            time = nextArrival;
            continue;
        }

        available.sort(
            (a, b) =>
                a.priority - b.priority ||
                a.arrival - b.arrival ||
                a.originalIndex - b.originalIndex
        );

        const process = available[0];
        const index = remaining.indexOf(process);

        remaining.splice(index, 1);

        const start = time;
        const end = time + process.burst;

        segments.push({
            id: process.id,
            start,
            end
        });

        result.push({
            ...process,
            start,
            completion: end,
            turnaround: end - process.arrival,
            waiting: start - process.arrival,
            response: start - process.arrival
        });

        time = end;
    }

    return {
        processes: result,
        segments
    };
}

function srtf(processes) {
    const items = processes.map(process => ({
        ...process,
        remaining: process.burst,
        completion: null,
        firstStart: null
    }));

    const segments = [];
    let time = 0;
    let completed = 0;

    while (completed < items.length) {
        const available = items.filter(
            process =>
                process.arrival <= time &&
                process.remaining > 0
        );

        if (available.length === 0) {
            const future = items
                .filter(process => process.remaining > 0)
                .map(process => process.arrival);

            const nextArrival = Math.min(...future);

            addSegment(
                segments,
                "IDLE",
                time,
                nextArrival
            );

            time = nextArrival;
            continue;
        }

        available.sort(
            (a, b) =>
                a.remaining - b.remaining ||
                a.arrival - b.arrival ||
                a.originalIndex - b.originalIndex
        );

        const current = available[0];

        if (current.firstStart === null) {
            current.firstStart = time;
        }

        addSegment(
            segments,
            current.id,
            time,
            time + 1
        );

        current.remaining--;
        time++;

        if (current.remaining === 0) {
            current.completion = time;
            completed++;
        }
    }

    const result = items.map(process => ({
        ...process,
        start: process.firstStart,
        completion: process.completion,
        turnaround:
            process.completion -
            process.arrival,
        waiting:
            process.completion -
            process.arrival -
            process.burst,
        response:
            process.firstStart -
            process.arrival
    }));

    return {
        processes: result,
        segments
    };
}

function roundRobin(processes, quantum) {
    const sorted = [...processes].sort(
        (a, b) =>
            a.arrival - b.arrival ||
            a.originalIndex - b.originalIndex
    );

    const items = sorted.map(process => ({
        ...process,
        remaining: process.burst,
        completion: null,
        firstStart: null
    }));

    const queue = [];
    const segments = [];

    let time = 0;
    let index = 0;
    let completed = 0;

    while (completed < items.length) {
        if (
            queue.length === 0 &&
            index < items.length &&
            time < items[index].arrival
        ) {
            addSegment(
                segments,
                "IDLE",
                time,
                items[index].arrival
            );

            time = items[index].arrival;
        }

        while (
            index < items.length &&
            items[index].arrival <= time
        ) {
            queue.push(items[index]);
            index++;
        }

        if (queue.length === 0) {
            continue;
        }

        const current = queue.shift();

        if (current.firstStart === null) {
            current.firstStart = time;
        }

        const execution = Math.min(
            quantum,
            current.remaining
        );

        const start = time;

        time += execution;
        current.remaining -= execution;

        addSegment(
            segments,
            current.id,
            start,
            time
        );

        while (
            index < items.length &&
            items[index].arrival <= time
        ) {
            queue.push(items[index]);
            index++;
        }

        if (current.remaining > 0) {
            queue.push(current);
        } else {
            current.completion = time;
            completed++;
        }
    }

    const result = items.map(process => ({
        ...process,
        start: process.firstStart,
        completion: process.completion,
        turnaround:
            process.completion -
            process.arrival,
        waiting:
            process.completion -
            process.arrival -
            process.burst,
        response:
            process.firstStart -
            process.arrival
    }));

    return {
        processes: result,
        segments
    };
}

function addSegment(segments, id, start, end) {
    const last = segments[segments.length - 1];

    if (
        last &&
        last.id === id &&
        last.end === start
    ) {
        last.end = end;
    } else {
        segments.push({
            id,
            start,
            end
        });
    }
}

function runAlgorithm(name, processes) {
    if (name === "FCFS") {
        return fcfs(processes);
    }

    if (name === "SJF") {
        return sjf(processes);
    }

    if (name === "SRTF") {
        return srtf(processes);
    }

    if (name === "RR") {
        return roundRobin(
            processes,
            Number(timeQuantum.value)
        );
    }

    if (name === "Priority") {
        return priorityScheduling(processes);
    }

    return fcfs(processes);
}

simulateBtn.addEventListener("click", () => {
    const processes = getProcesses();

    if (processes.length === 0) {
        alert("Please enter valid process information.");
        return;
    }

    if (selectedAlgorithm === "RR") {
        const quantum = Number(timeQuantum.value);

        if (
            !Number.isInteger(quantum) ||
            quantum <= 0
        ) {
            alert("Please enter a valid Time Quantum.");
            return;
        }
    }

    const schedule =
        runAlgorithm(
            selectedAlgorithm,
            processes
        );

    displayResults(schedule.processes);
    displayGanttChart(schedule.segments);
    calculateStatistics(schedule);
    updateComparison(processes);
    updateProgress();
});

function displayResults(results) {
    resultsTableBody.innerHTML = "";

    const sortedResults = [...results].sort(
        (a, b) =>
            a.originalIndex -
            b.originalIndex
    );

    sortedResults.forEach(process => {
        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${process.id}</td>
            <td>${process.arrival}</td>
            <td>${process.burst}</td>
            <td>${process.priority}</td>
            <td>${process.completion}</td>
            <td>${process.turnaround}</td>
            <td>${process.waiting}</td>
            <td>${process.response}</td>
        `;

        resultsTableBody.appendChild(row);
    });
}

function displayGanttChart(segments) {
    ganttChart.innerHTML = "";

    if (segments.length === 0) {
        ganttChart.innerHTML = `
            <div class="empty-state">
                No schedule available.
            </div>
        `;

        return;
    }

    const track =
        document.createElement("div");

    track.className = "gantt-track";

    segments.forEach(segment => {
        const item =
            document.createElement("div");

        item.className = "gantt-item";

        if (segment.id === "IDLE") {
            item.classList.add("idle");
        }

        const duration =
            segment.end -
            segment.start;

        item.style.width =
            `${Math.max(85, duration * 55)}px`;

        item.innerHTML = `
            <span>${segment.id}</span>
            <span class="gantt-time">
                ${segment.start}
            </span>
        `;

        track.appendChild(item);
    });

    const finalItem =
        document.createElement("div");

    finalItem.className = "gantt-item";
    finalItem.style.width = "1px";
    finalItem.style.minWidth = "1px";
    finalItem.style.border = "none";
    finalItem.style.background = "transparent";

    finalItem.innerHTML = `
        <span class="gantt-time">
            ${segments[segments.length - 1].end}
        </span>
    `;

    track.appendChild(finalItem);
    ganttChart.appendChild(track);
}

function calculateStatistics(schedule) {
    const results =
        schedule.processes;

    const totalWaiting =
        results.reduce(
            (sum, process) =>
                sum + process.waiting,
            0
        );

    const totalTurnaround =
        results.reduce(
            (sum, process) =>
                sum + process.turnaround,
            0
        );

    const totalResponse =
        results.reduce(
            (sum, process) =>
                sum + process.response,
            0
        );

    const averageWaiting =
        totalWaiting /
        results.length;

    const averageTurnaround =
        totalTurnaround /
        results.length;

    const averageResponse =
        totalResponse /
        results.length;

    const firstTime =
        schedule.segments.length > 0
            ? schedule.segments[0].start
            : 0;

    const lastTime =
        schedule.segments.length > 0
            ? schedule.segments[
                  schedule.segments.length - 1
              ].end
            : 0;

    const totalBurst =
        results.reduce(
            (sum, process) =>
                sum + process.burst,
            0
        );

    const totalTime =
        lastTime -
        firstTime;

    const utilization =
        totalTime > 0
            ? (totalBurst /
                totalTime) *
              100
            : 0;

    avgWaiting.textContent =
        averageWaiting.toFixed(2);

    avgTurnaround.textContent =
        averageTurnaround.toFixed(2);

    avgResponse.textContent =
        averageResponse.toFixed(2);

    cpuUtilization.textContent =
        utilization.toFixed(2) + "%";
}

function updateComparison(processes) {
    const algorithms = [
        "FCFS",
        "SJF",
        "SRTF",
        "RR",
        "Priority"
    ];

    const data = algorithms.map(name => {
        const schedule =
            runAlgorithm(
                name,
                processes
            );

        const results =
            schedule.processes;

        const tat =
            results.reduce(
                (sum, process) =>
                    sum + process.turnaround,
                0
            ) / results.length;

        const wt =
            results.reduce(
                (sum, process) =>
                    sum + process.waiting,
                0
            ) / results.length;

        const rt =
            results.reduce(
                (sum, process) =>
                    sum + process.response,
                0
            ) / results.length;

        return {
            algorithm: name,
            tat,
            wt,
            rt
        };
    });

    const minTat =
        Math.min(
            ...data.map(item => item.tat)
        );

    const minWt =
        Math.min(
            ...data.map(item => item.wt)
        );

    const minRt =
        Math.min(
            ...data.map(item => item.rt)
        );

    comparisonTableBody.innerHTML = "";

    data.forEach(item => {
        const row =
            document.createElement("tr");

        const tatBest =
            Math.abs(item.tat - minTat) < 0.000001;

        const wtBest =
            Math.abs(item.wt - minWt) < 0.000001;

        const rtBest =
            Math.abs(item.rt - minRt) < 0.000001;

        row.innerHTML = `
            <td class="algorithm-name">
                ${item.algorithm}
            </td>

            <td class="${tatBest ? "best-value" : ""}">
                ${item.tat.toFixed(2)}
            </td>

            <td class="${wtBest ? "best-value" : ""}">
                ${item.wt.toFixed(2)}
            </td>

            <td class="${rtBest ? "best-value" : ""}">
                ${item.rt.toFixed(2)}
            </td>
        `;

        comparisonTableBody.appendChild(row);
    });
}

function clearResults() {
    resultsTableBody.innerHTML = `
        <tr>
            <td colspan="8" class="empty-cell">
                No results yet.
            </td>
        </tr>
    `;

    comparisonTableBody.innerHTML = `
        <tr>
            <td colspan="4" class="empty-cell">
                Run the simulation to compare algorithms.
            </td>
        </tr>
    `;

    ganttChart.innerHTML = `
        <div class="empty-state">
            Run the simulation to generate the Gantt chart.
        </div>
    `;

    avgWaiting.textContent = "0.00";
    avgTurnaround.textContent = "0.00";
    avgResponse.textContent = "0.00";
    cpuUtilization.textContent = "0.00%";
}

function updateProgress() {
    const dots =
        document.querySelectorAll(
            ".step-dot"
        );

    dots[0].classList.add("completed");
    dots[1].classList.add("completed");
    dots[2].classList.add("active");
}