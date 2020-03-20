declare var d3;

interface FallingObject {
    type: 'rock'|'person';
    position: {x: number, y: number};
    speed: number;
}

const svg = d3.select('svg');
const width = 1000;
const height = 600;
let fallingObjects: FallingObject[] = [];

svg.attr('width', width)
    .attr('height', height);

svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#ccc');

const net = svg.append('line').attr('stroke', '#000000');
const collaboratorIds = new Set<string>();

svg.on('mousemove', () => {
    const index = getCollaboratorIndex(d3.event.collaboratorId);
    net.attr('x' + String(index), d3.event.x);
    net.attr('y' + String(index), d3.event.y);
});


const addRandomFallingObject = () => {
    fallingObjects.push({
        type: random() > 0.5 ? 'rock' : 'person',
        position: {x: random() * width, y: -100},
        speed: random() * 5
    });
};

const raf = () => {
    if(random() > 0.9) {
        addRandomFallingObject();
    }

    fallingObjects.forEach(falling => falling.position.y += falling.speed); //TODO: Set by time, not by RAF.
    fallingObjects = fallingObjects.filter(falling => falling.position.y < height);

    const falling = svg.selectAll('.falling').data(fallingObjects);
    const fallingEnter = falling.enter()
        .append('g')
        .attr('class', 'falling');

    fallingEnter.append('circle')
        .attr('r', 5)
        .attr('fill', (d) => d.type === 'rock' ? '#666' : '#0c0');

    falling.attr('transform', (d) => `translate(${d.position.x}, ${d.position.y})`);

    requestAnimationFrame(raf);
};

raf();



const getCollaboratorIndex = (id: string) => {
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