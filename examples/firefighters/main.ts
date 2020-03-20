declare var d3;

interface FallingObject {
    type: 'rock'|'person';
    position: {x: number, y: number};
    speed: number;
    id: string;
    timeSinceLanding: number;
    intersected: boolean;
}

const svg = d3.select('svg');
const width = 1000;
const height = 600;
const groundHeight = 100;
let fallingObjects: FallingObject[] = [];

svg.attr('width', width)
    .attr('height', height);

// Add background
svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#ccc');

// Add ground
svg.append('rect')
    .attr('fill', '#875131')
    .attr('width', width)
    .attr('height', groundHeight)
    .attr('y', height - groundHeight);

const net = svg.append('line').attr('stroke', '#000000');
const collaboratorIds = new Set<string>();
let started = false;

svg.on('mousemove', () => {
    const index = getCollaboratorIndex(d3.event.collaboratorId);
    if(!index) {
        return;
    }
    net.attr('x' + String(index), d3.event.x);
    net.attr('y' + String(index), d3.event.y);

    if(!started && index === 2) {
        started = true;
        start();
    }
});


const addRandomFallingObject = () => {
    if(stopped) {
        return;
    }

    fallingObjects.push({
        id: String(random()),
        type: random() > 0.7 ? 'rock' : 'person',
        position: {x: random() * width, y: -100},
        speed: 0.1 + random() * 0.2,
        timeSinceLanding: 0,
        intersected: false
    });
};

let lastFrame = Date.now();
const rockPath = 'm 20,135 20,-10 60,10 30,-10 10,20 -20,25 -60,10 z';
const personPath = 'm 42,165 c 0,0 -10,6 -12,-3 -1,-8 14,-6 20,-4 5,1 8,-2 24,-3 15,-0 66,-6 66,-6 0,0 12,0 1,6 -13,2 -28,3 -28,3 l 27,1 c 0,0 18,3 0,5 -17,-0 -44,-0 -44,-0 l -21,1 -19,0 c 0,0 -15,20 -19,22 -4,2 -8,0 -2,-6 6,-7 10,-11 10,-11 l -19,7 c 0,0 -11,1 -3,-4 10,-2 20,-8 20,-8 z';

let health = 3;
let saved = 0;
let fallen = 0;

const start = () => {
    raf();
    setInterval(() => {
        addRandomFallingObject();
    }, 1000);
};

const continueFalling = () => {
    fallingObjects.forEach(falling => {
        if(falling.position.y < height - groundHeight) {
            falling.position.y += falling.speed * (Date.now() - lastFrame)
        } else {
            if(falling.timeSinceLanding === 0) {
                // Just fell.
                if(falling.type === 'person' && !falling.intersected) {
                    fallen++;
                }
            }
            falling.timeSinceLanding += Date.now() - lastFrame;
        }
    });
    fallingObjects = fallingObjects.filter(falling => falling.timeSinceLanding < 4000);
};

const checkIntersect = () => {
    const start = {x: parseFloat(net.attr('x1')) || 0, y: parseFloat(net.attr('y1')) || 0};
    const end = {x: parseFloat(net.attr('x2')) || 0, y: parseFloat(net.attr('y2')) || 0};

    fallingObjects.forEach(falling => {
        if(falling.intersected || falling.timeSinceLanding > 0) {
            return;
        }
        const d = distToSegment(start, end, falling.position);

        if(d < 10) {
            falling.intersected = true;

            if(falling.type === 'rock') {
                health--;
                if(health === 0) {
                    stopped = true;
                }
            } else {
                saved++;
            }
        }
    });
};

const dist = (v: {x: number, y: number}, w: {x: number, y: number}) =>
    Math.sqrt(Math.pow(v.x - w.x, 2) + Math.pow(v.y - w.y, 2));

const distToSegment = (v: {x: number, y: number}, w: {x: number, y: number}, p: {x: number, y: number}) => {
    const segmentLength = dist(v, w);
    if (segmentLength == 0) return dist(p, v);

    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / Math.pow(segmentLength, 2);
    t = Math.max(0, Math.min(1, t));
    const closestPoint = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
    return dist(p, closestPoint);
};


let stopped = false;

const raf = () => {
    if(stopped) {
        return;
    }
    checkIntersect();
    continueFalling();

    document.getElementById('health').innerText = String(health);
    document.getElementById('saved').innerText = String(saved);
    document.getElementById('fallen').innerText = String(fallen);

    const falling = svg.selectAll('.falling').data(fallingObjects, d => d.id);
    falling.exit().remove();
    const fallingEnter = falling.enter()
        .append('g')
        .attr('class', 'falling');

    fallingEnter.append('path')
        .attr('d', (d) => d.type === 'rock' ? rockPath : personPath)
        .attr('fill', (d) => d.type === 'rock' ? '#666' : '#0c0');

    // To check alignment
    /*fallingEnter.append('circle')
        .attr('r', 5)
        .attr('fill', '#000')
        .attr('cx', 80)
        .attr('cy', 150);*/

    fallingEnter.merge(falling)
        .attr('transform', (d) => `translate(${d.position.x-40}, ${d.position.y - 75})scale(0.5)`)
        .attr('opacity', (d) => d.intersected ? 0 : 1);

    lastFrame = Date.now();
    requestAnimationFrame(raf);
};

document.getElementById('restart').addEventListener('click', () => {
    health = 3;
    saved = 0;
    fallen = 0;
    stopped = false;
    fallingObjects = [];
    raf();
});


const getCollaboratorIndex = (id: string) => {
    if(!id) {
        return;
    }
    if(!collaboratorIds.has(id)) {
        collaboratorIds.add(id);
    }
    return Array.from(collaboratorIds.values()).indexOf(id) + 1; // 1 or 2
};

let seed = 1;
function random() { // Bad but seeded random function
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}