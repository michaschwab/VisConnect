(function () {
    var SWATCH_D, active_color, active_line, canvas, drag, drawing_data, lines_layer, palette, redraw, render_line,
        swatches, trash_btn, ui;

    SWATCH_D = 22;
    render_line = d3.line().x((d) => d[0]).y((d) => d[1]).curve(d3.curveBasis);

    drawing_data = {
        lines: []
    };

    active_line = {};
    active_color = {};
    const default_color = '#333333';
    let active_local_color = default_color;

    canvas = d3.select('#canvas');
    lines_layer = canvas.append('g');
    ui = d3.select('#ui');
    palette = ui.append('g').attr('transform', "translate(" + (4 + SWATCH_D / 2) + "," + (4 + SWATCH_D / 2) + ")");

    swatches = palette.selectAll('swatch').data(["#333333", "#ffffff", "#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"]);

    trash_btn = ui.append('text').html('&#xf1f8;')
        .attr("class", 'btn')
        .attr("dy", '0.35em')
        .attr("transform", 'translate(940,20)')
        .on('click', function () {
            drawing_data.lines = [];
            return redraw();
        });

    swatches.enter().append('circle')
        .attr("class", 'swatch')
        .attr('cx', function (d, i) {
            return i * (SWATCH_D + 4) / 2;
        })
        .attr('cy', function (d, i) {
            if (i % 2) {
                return SWATCH_D;
            } else {
                return 0;
            }
        })
        .attr('r', SWATCH_D / 2)
        .attr('fill', d => d)
        .on('click', function (d) {
            active_color[d3.event.collaboratorId] = d;
            if (d3.event.isLocalEvent) {
                active_local_color = d;
                swatches.classed('active', false);
                return d3.select(this).classed('active', true);
            }
        });

    swatches.each(function (d) {
        if (d === active_local_color) {
            return d3.select(this).classed('active', true);
        }
    });

    var drag = vc.drag(); // = d3.drag();
    var rafRequest = 0;

    drag.on('start', function () {
        active_line[d3.event.sourceEvent.collaboratorId] = {
            points: [],
            color: active_color[d3.event.sourceEvent.collaboratorId] || default_color
        };
        drawing_data.lines.push(active_line[d3.event.sourceEvent.collaboratorId]);
        redraw();
    });

    drag.on('drag', function () {
        if (active_line[d3.event.sourceEvent.collaboratorId]) {
            active_line[d3.event.sourceEvent.collaboratorId].points.push(d3.mouse(this));
            if(!rafRequest) {
                rafRequest = requestAnimationFrame(redraw.bind(this));
            }
        }
    });

    drag.on('end', function () {
        if (active_line[d3.event.sourceEvent.collaboratorId] &&
            active_line[d3.event.sourceEvent.collaboratorId].points.length === 0) {
            drawing_data.lines.pop();
        }
        active_line[d3.event.sourceEvent.collaboratorId] = null;
    });

    canvas.call(drag);

    redraw = function () {
        rafRequest = 0;
        const lines = lines_layer.selectAll('.line').data(drawing_data.lines);
        const enter = lines.enter();

        enter.append('path')
            .attr("class", 'line')
            .attr('stroke', function (d) {
                return d.color;
            }).each(function (d) {
                return d.elem = d3.select(this);
            });

        lines.attr('d', function (d) {
            return render_line(d.points);
        });
        lines.exit().remove();
    };

    redraw();

}).call(this);
