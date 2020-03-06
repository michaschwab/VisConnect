(function() {
  var SWATCH_D, active_color, active_line, canvas, drag, drawing_data, lines_layer, palette, redraw, render_line, swatches, trash_btn, ui;

  SWATCH_D = 22;

  render_line = d3.svg.line().x(function(d) {
    return d[0];
  }).y(function(d) {
    return d[1];
  }).interpolate('basis');

  drawing_data = {
    lines: []
  };

  active_line = {};

  active_color = {};
  active_local_color = '#333333';

  canvas = d3.select('#canvas');

  lines_layer = canvas.append('g');

  ui = d3.select('#ui');

  palette = ui.append('g').attr({
    transform: "translate(" + (4 + SWATCH_D / 2) + "," + (4 + SWATCH_D / 2) + ")"
  });

  swatches = palette.selectAll('swatch').data(["#333333", "#ffffff", "#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"]);

  trash_btn = ui.append('text').html('&#xf1f8;').attr({
    "class": 'btn',
    dy: '0.35em',
    transform: 'translate(940,20)'
  }).on('click', function() {
    drawing_data.lines = [];
    return redraw();
  });

  swatches.enter().append('circle').attr({
    "class": 'swatch',
    cx: function(d, i) {
      return i * (SWATCH_D + 4) / 2;
    },
    cy: function(d, i) {
      if (i % 2) {
        return SWATCH_D;
      } else {
        return 0;
      }
    },
    r: SWATCH_D / 2,
    fill: function(d) {
      return d;
    }
  }).on('click', function(d) {
    active_color[d3.event.collaboratorId] = d;
    if(d3.event.isLocalEvent) {
      active_local_color = d;
      swatches.classed('active', false);
      return d3.select(this).classed('active', true);
    }
  });

  swatches.each(function(d) {
    if (d === active_local_color) {
      return d3.select(this).classed('active', true);
    }
  });

  drag = d3.behavior.drag();

  drag.on('dragstart', function() {
    active_line[d3.event.sourceEvent.collaboratorId] = {
      points: [],
      color: active_color[d3.event.sourceEvent.collaboratorId] || active_local_color
    };
    drawing_data.lines.push(active_line[d3.event.sourceEvent.collaboratorId]);
    return redraw(active_line[d3.event.sourceEvent.collaboratorId]);
  });

  drag.on('drag', function() {
    if(active_line[d3.event.sourceEvent.collaboratorId]){
      active_line[d3.event.sourceEvent.collaboratorId].points.push(d3.mouse(this));
      redraw(active_line[d3.event.sourceEvent.collaboratorId]);
    }
  });

  drag.on('dragend', function() {
    if (active_line[d3.event.sourceEvent.collaboratorId].points.length === 0) {
      drawing_data.lines.pop();
    }
    active_line[d3.event.sourceEvent.collaboratorId] = null;
  });

  canvas.call(drag);

  redraw = function(specific_line) {
    var lines;
    lines = lines_layer.selectAll('.line').data(drawing_data.lines);
    lines.enter().append('path').attr({
      "class": 'line',
      stroke: function(d) {
        return d.color;
      }
    }).each(function(d) {
      return d.elem = d3.select(this);
    });
    if (specific_line != null) {
      specific_line.elem.attr({
        d: function(d) {
          return render_line(d.points);
        }
      });
    } else {
      lines.attr({
        d: function(d) {
          return render_line(d.points);
        }
      });
    }
    return lines.exit().remove();
  };

  redraw();

}).call(this);
