const activities = [];
const colors = ["#ea5545", "#f46a9b", "#ef9b20", "#edbf33", "#ede15b", "#bdcf32", "#87bc45", "#27aeef", "#b33dc6"];
const categoryColors = {
    "Rest": "#ea5545",
    "Care Work": "#f46a9b",
    "Wage Labor/Employment": "#ef9b20",
    "Reselling": "#edbf33",
    "Recreation": "#ede15b"
};

const ctx = document.getElementById('activityClock').getContext('2d');
let activityChart;
let isFirstDraw = true;

function updateSlider(slider) {
    slider.nextElementSibling.textContent = `${slider.value}%`;
    updateTotal();
}

function updateTotal() {
    const sliders = document.querySelectorAll('.clock-slider');
    let total = 0;
    sliders.forEach(slider => {
        total += parseFloat(slider.value);
    });
    document.getElementById('totalPercentage').innerText = `${total}%`;
    const canvasContainer = document.getElementById('canvasContainer');
    const warpText = document.getElementById('warpText');
    if (total > 100) {
        canvasContainer.classList.add('shake', 'sparkles');
        warpText.style.display = 'block';
    } else {
        canvasContainer.classList.remove('shake', 'sparkles');
        warpText.style.display = 'none';
    }
}

function addRow() {
    const table = document.getElementById('activityTable').getElementsByTagName('tbody')[0];
    const row = table.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);

    cell1.innerHTML = '<input type="text">';
    cell2.innerHTML = '<input type="range" class="clock-slider" min="0" max="100" step="5" value="0" oninput="updateSlider(this)" onchange="updateTotal()"><span>0%</span>';
    cell3.innerHTML = '<button onclick="removeRow(this)">Remove</button>';
}

function removeRow(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateTotal();
}

function drawOrUpdateClock() {
    if (isFirstDraw) {
        addActivities();
        document.getElementById('updateClockButton').innerText = 'Update Clock';
        isFirstDraw = false;
    } else {
        addActivities();
    }
}

function addActivities() {
    activities.length = 0; // Clear existing activities
    const rows = document.querySelectorAll('#activityTable tbody tr');
    rows.forEach(row => {
        const activity = row.cells[0].querySelector('input').value;
        const percentage = parseFloat(row.cells[1].querySelector('input').value) || 0;
        if (activity && percentage > 0) {
            const color = categoryColors[activity] || colors[Math.floor(Math.random() * colors.length)];
            activities.push({ activity, percentage, color });
        }
    });
    updateChart();
}

function updateChart() {
    const total = parseFloat(document.getElementById('totalPercentage').innerText);
    const data = {
        labels: activities.map(a => a.activity),
        datasets: [{
            data: activities.map(a => a.percentage),
            backgroundColor: total > 100 ? '#000000' : activities.map(a => a.color)
        }]
    };

    if (activityChart) {
        activityChart.destroy();
    }

    activityChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        plugins: [ChartDataLabels],
        options: {
            plugins: {
                datalabels: {
                    color: '#ffffff',
                    formatter: (value, context) => {
                        let percentage = context.chart.data.datasets[0].data[context.dataIndex];
                        return context.chart.data.labels[context.dataIndex] + '\n' + percentage + '%';
                    },
                    font: {
                        weight: 'bold',
                        size: '16'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw + '%';
                        }
                    }
                }
            }
        }
    });
}

function updateSliderColor(slider) {
    const value = slider.value;
    let color = '';
    if (value == -2) {
        color = '#ea5545';
    } else if (value == -1) {
        color = '#f46a9b';
    } else if (value == 0) {
        color = '#ef9b20';
    } else if (value == 1) {
        color = '#edbf33';
    } else if (value == 2) {
        color = '#87bc45';
    }
    slider.style.background = `linear-gradient(to right, ${color}, ${color})`;
    updateAverageScore(); // Ensure average score updates whenever a slider changes
}

function updateAverageScore() {
    const sliders = document.querySelectorAll('.wellbeing-slider');
    let total = 0;
    sliders.forEach(slider => {
        total += parseFloat(slider.value);
    });
    const average = total / sliders.length;
    const averageScoreElement = document.getElementById('averageScore');
    averageScoreElement.innerText = average.toFixed(2);

    let color = '';
    if (average <= -1.5) {
        color = '#ea5545';
    } else if (average <= -0.5) {
        color = '#f46a9b';
    } else if (average <= 0.5) {
        color = '#ef9b20';
    } else if (average <= 1.5) {
        color = '#edbf33';
    } else {
        color = '#87bc45';
    }
    averageScoreElement.style.color = color;
}

function downloadImage() {
    html2canvas(document.querySelector('.container')).then(canvas => {
        const link = document.createElement('a');
        link.download = 'reselling_wellbeing_scorecard.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}
