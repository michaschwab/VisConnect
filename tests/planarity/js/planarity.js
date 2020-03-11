var w = 960,
    h = 600,
    p = 15,
    x = d3.scaleLinear().range([0, w]),
    y = d3.scaleLinear().range([0, h]),
    start,
    format = d3.format(",.1f"),
    moves = 0,
    highlightIntersections = false,
    count = 0, // intersections
    graph;

let level = 0;
let seed = level;

function random() { // Bad but seeded random function
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

graph = scramble(planarGraph(8));

d3.select("#vis").selectAll("*").remove();

var vis = d3.select("#vis").append("svg")
    .attr("width", w + p * 2)
    .attr("height", h + p * 2)
  .append("g")
    .attr("transform", "translate(" + [p, p] + ")");

const lines = vis.append("g");
const nodes = vis.append("g");
const counter = d3.select("#count");
const moveCounter = d3.select("#move-count");
const timer = d3.select("#timer");

const force = d3.select("#force").append("svg")
    .attr("width", w + p * 2)
    .attr("height", h + p * 2)
  .append("g")
    .attr("transform", "translate(" + [p, p] + ")");

const forceLines = force.append("g");
const forceNodes = force.append("g");

const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter( (w + p * 2)/2, (h + p * 2)/2));

d3.select("#generate").on("click", generate);
d3.select("#intersections").on("change", function() {
  highlightIntersections = this.checked;
  update();
});

generate();

d3.timer(function() {
  if (count) timer.text(format((+new Date - start) / 1000));
});

function generate() {
  if(intersections(graph.links) !== 0 && level !== 0) {
    return;
  }
  level++;
  seed = level;
  moveCounter.text("0 moves");
  document.getElementById('levelindicator').innerText = level;
  moves = 0;
  start = +new Date;
  lastCount = null;
  forceLines.selectAll("line").remove();
  forceNodes.selectAll("circle").remove();
  graph = scramble(planarGraph(level + 4));
  simulation.restart();
  simulation.alpha(1);
  update();
}

function update() {
  count = intersections(graph.links);
  counter.text(count ? count + "." : "0! Well done!");
  const nextLevelButton = document.getElementById('nextlevel');
  const forceDiv = document.getElementById('force');

  if(count === 0) {
    nextLevelButton.removeAttribute('disabled');
    forceDiv.style.display = 'inline';
  } else {
    nextLevelButton.setAttribute('disabled', '');
    forceDiv.style.display = 'none';
  }

  const line = lines.selectAll("line")
      .data(graph.links);
  const lineEnter = line.enter().append("line");
  line.exit().remove();
  lineEnter.merge(line).attr("x1", function(d) { return x(d[0][0]); })
      .attr("y1", function(d) { return y(d[0][1]); })
      .attr("x2", function(d) { return x(d[1][0]); })
      .attr("y2", function(d) { return y(d[1][1]); })
      .classed("intersection", highlightIntersections ? function(d) { return d.intersection; } : true);

  const node = nodes.selectAll("circle")
      .data(graph.nodes);
  const nodeEnter = node.enter().append("circle");

  nodeEnter
      .attr("r", p - 1)
      .call(vc.drag()
          .on("drag", function(d) {
              // Jitter to prevent coincident nodes.
              const pos = vc.mouse(this);
              d[0] = Math.max(0, Math.min(1, x.invert(pos[0]))) + random() * 1e-4;
              d[1] = Math.max(0, Math.min(1, y.invert(pos[1]))) + random() * 1e-4;
              update();
          })
          .on("end", function() {
              moveCounter.text(++moves + " move" + (moves !== 1 ? "s" : ""));
          }));
  node.exit().remove();

  nodeEnter.merge(node).attr("cx", function(d) { return x(d[0]); })
      .attr("cy", function(d) { return y(d[1]); })
      .classed("intersection", highlightIntersections ?
          function(d) { return d.intersection; } : count);

  const forceLine = forceLines.selectAll("line")
      .data(graph.links)
      .enter().append("line");

  const forceNode = forceNodes.attr("class", "nodes")
  .selectAll("circle")
      .data(graph.nodes)
      .enter()
      .append("circle")
      .attr("r", 2);

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    forceLine
        .attr("x1", function(d) { return d[0].x; })
        .attr("y1", function(d) { return d[0].y; })
        .attr("x2", function(d) { return d[1].x; })
        .attr("y2", function(d) { return d[1].y; });

    forceNode
         .attr("r", 16)
         .style("fill", "#efefef")
         .style("stroke", "#424242")
         .style("stroke-width", "1px")
         .attr("cx", function (d) { return d.x+5; })
         .attr("cy", function(d) { return d.y-3; });
  }
}

// Scramble the node positions.
function scramble(graph) {
  if (graph.nodes.length < 4) return graph;
  do {
    graph.nodes.forEach(function(node) {
      node[0] = random();
      node[1] = random();
    });
  } while (!intersections(graph.links));
  return graph;
}

// Generates a random planar graph with *n* nodes.
function planarGraph(n) {
  var points = [],
      links = [],
      i = -1,
      j;
  while (++i < n) points[i] = [random(), random()];
  i = -1; while (++i < n) {
    addPlanarLink([points[i], points[~~(random() * n)]], links);
  }
  i = -1; while (++i < n) {
    j = i; while (++j < n) addPlanarLink([points[i], points[j]], links);
  }
  
  //console.log(links)
  return {nodes: points, links: links};
}

// Adds a link if it doesn't intersect with anything.
function addPlanarLink(link, links) {
  if (!links.some(function(to) { return intersect(link, to); })) {
    links.push(link);
  }
}

// Counts the number of intersections for a given array of links.
function intersections(links) {
  var n = links.length,
      i = -1,
      j,
      x,
      count = 0;
  // Reset flags.
  while (++i < n) {
    (x = links[i]).intersection = false;
    x[0].intersection = false;
    x[1].intersection = false;
  }
  i = -1; while (++i < n) {
    x = links[i];
    j = i; while (++j < n) {
      if (intersect(x, links[j])) {
        x.intersection =
            x[0].intersection =
            x[1].intersection =
            links[j].intersection =
            links[j][0].intersection =
            links[j][1].intersection = true;
        count++;
      }
    }
  }
  return count;
}

// Returns true if two line segments intersect.
// Based on http://stackoverflow.com/a/565282/64009
function intersect(a, b) {
  // Check if the segments are exactly the same (or just reversed).
  if (a[0] === b[0] && a[1] === b[1] || a[0] === b[1] && a[1] === b[0]) return true;

  // Represent the segments as p + tr and q + us, where t and u are scalar
  // parameters.
  var p = a[0],
      r = [a[1][0] - p[0], a[1][1] - p[1]],
      q = b[0],
      s = [b[1][0] - q[0], b[1][1] - q[1]];

  // Solve p + tr = q + us to find an intersection point.
  // First, cross both sides with s:
  //   (p + tr) × s = (q + us) × s
  // We know that s × s = 0, so this can be rewritten as:
  //   t(r × s) = (q − p) × s
  // Then solve for t to get:
  //   t = (q − p) × s / (r × s)
  // Similarly, for u we get:
  //   u = (q − p) × r / (r × s)
  var rxs = cross(r, s),
      q_p = [q[0] - p[0], q[1] - p[1]],
      t = cross(q_p, s) / rxs,
      u = cross(q_p, r) / rxs,
      epsilon = 1e-6;

  return t > epsilon && t < 1 - epsilon && u > epsilon && u < 1 - epsilon;
}

function cross(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}
