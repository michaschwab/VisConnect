var svg = d3.select('svg');
var width = 1000;
var height = 600;
var fallingObjects = [];
svg.attr('width', width)
    .attr('height', height);
svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#ccc');
var net = svg.append('line').attr('stroke', '#000000');
var collaboratorIds = new Set();
svg.on('mousemove', function () {
    var index = getCollaboratorIndex(d3.event.collaboratorId);
    net.attr('x' + String(index), d3.event.x);
    net.attr('y' + String(index), d3.event.y);
});
var addRandomFallingObject = function () {
    fallingObjects.push({
        type: random() > 0.5 ? 'rock' : 'person',
        position: { x: random() * width, y: -100 },
        speed: random() * 5
    });
};
var raf = function () {
    if (random() > 0.9) {
        addRandomFallingObject();
    }
    fallingObjects.forEach(function (falling) { return falling.position.y += falling.speed; }); //TODO: Set by time, not by RAF.
    fallingObjects = fallingObjects.filter(function (falling) { return falling.position.y < height; });
    var falling = svg.selectAll('.falling').data(fallingObjects);
    var fallingEnter = falling.enter()
        .append('g')
        .attr('class', 'falling');
    fallingEnter.append('circle')
        .attr('r', 5)
        .attr('fill', function (d) { return d.type === 'rock' ? '#666' : '#0c0'; });
    falling.attr('transform', function (d) { return "translate(" + d.position.x + ", " + d.position.y + ")"; });
    requestAnimationFrame(raf);
};
raf();
var getCollaboratorIndex = function (id) {
    if (!collaboratorIds.has(id)) {
        collaboratorIds.add(id);
    }
    return Array.from(collaboratorIds.values()).indexOf(id) + 1; // 1 or 2
};
var seed = 1;
function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}
//# sourceMappingURL=main.js.map