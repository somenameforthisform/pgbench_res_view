const benchArea = document.getElementById('bench_data');
const canvas = document.getElementById('canvas');
const legend = document.getElementById('legend');
const ctx = canvas.getContext('2d');
const offset = {x: 0, y: 0};

let mouseDown = false;
let scale = 1;

const colorMap = new Map()
    .set('tps', 'green')
    .set('lat', 'blue')
    .set('stddev', 'orange');

 const genMock = (count) => 
    `progress: ${count * 10 + Math.random().toFixed(3)} s, ${((Math.random() * 300) + 300).toFixed(3)} tps, lat ${(Math.random() * 20).toFixed(3)} ms, stddev ${(Math.random() * 10).toFixed(3)}` ;

const addMockData = () => {
    const mock = [];
    
    while(mock.length < 10){
        mock.push(genMock(mock.length));
    }

    benchArea.value = mock.join('\n')

}

const findMaxValue = (benchData) =>
    Math.max(...benchData.map(e => Object.entries(e).map(([key, value]) => value)).flat(1))

const findMinValue = (benchData) =>
    Math.min(...benchData.map(e => Object.entries(e).map(([key, value]) => value)).flat(1))

const parseBenchData = (value) =>
    value
        .split('\n')
        .map(e => e
                   .split(' ')
                   .filter(e => e.match(/^[0-9]*[.][0-9]+$/)
            )
        .map(e => parseFloat(e)))
        .map(e => ({ time: e[0], tps: e[1], lat: e[2], stddev: e[3] }))
        .filter(e => e.time !== undefined && e.tps !== undefined && e.lat !== undefined && e.stddev !== undefined)

const resize = () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

const drawData = (benchData) => {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const step = (displayHeight / (benchData.length - 1));
    canvas.width = displayWidth;
    canvas.height = displayHeight;

    ctx.scale(scale, scale);
    ctx.translate(offset.x, offset.y);

    colorMap.forEach((color, key) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const ltsCoords = { x: 0, y: 0 }
        ctx.strokeStyle = color;
        benchData.forEach((dataObject, i) => {
            ctx.lineTo(step * i, -dataObject[key]);
            ltsCoords.x = step * i;
            ltsCoords.y = - dataObject[key];
        })
        ctx.stroke();
        ctx.font = "12px helvetica";
        ctx.fillText(key, ltsCoords.x, ltsCoords.y);

    })
}

const addLegend = () => colorMap.forEach((color, key) => {
    const legendItem = document.createElement('div');
    const legendColor = document.createElement('div');
    const title = document.createElement('p');
    legendItem.classList.add('legend-item');
    legendColor.classList.add('legend-color');
    legendColor.style.backgroundColor = color;
    title.innerHTML = key;
    legendItem.append(legendColor);
    legendItem.append(title);
    legend.append(legendItem);
})

const moveCanvas = (mouseEvent) => {
    if(mouseDown){
        offset.x = offset.x + (mouseEvent.movementX / scale);
        offset.y = offset.y + (mouseEvent.movementY / scale);
        redraw();
    }
}

const zoom = ({ deltaY }) => {
    const factor = 0.1;
    if (deltaY > 0 && scale - factor > 0) {
      scale -= factor;
    } else if (deltaY < 0 && scale + factor > 0) {
      scale += factor;
    }
    redraw();
  }

const redraw = () => drawData(parseBenchData(benchArea.value))

const init = () => {
    addMockData();
    const benchData = parseBenchData(benchArea.value)
    offset.y = ((findMaxValue(benchData) + findMinValue(benchData)) / 2) + 200;
    console.log(offset.y)
    addLegend();
    redraw();
}

canvas.addEventListener('mousedown',() => mouseDown = true);
canvas.addEventListener('mouseup',() => mouseDown = false);
canvas.addEventListener('mouseleave',() =>  mouseDown = false);
canvas.addEventListener('mousemove', e => moveCanvas(e));
canvas.addEventListener('wheel', e => zoom(e));
benchArea.addEventListener('input', () => redraw());
window.addEventListener('resize', () => redraw());

init();


