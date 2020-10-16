// @ts-ignore
import classifyPoint from 'robust-point-in-polygon';

type D3Element = HTMLElement & {__data__: any};
type VcPointerEvent = (MouseEvent | TouchEvent) & {collaboratorId: string; isLocalEvent: boolean};

export class VisConnectUtil {
    static drag() {
        const data = {
            elements: null as D3Element[] | null,
            draggingElements: {} as {[collaborator: string]: D3Element},
            offset: {} as {[collaborator: string]: [number, number]},
            onStart: (data: any) => {},
            onEnd: (data: any) => {},
            onDrag: (data: any) => {},
        };

        const dragStart = (element: D3Element) => {
            return (event: VcPointerEvent) => {
                if (!VisConnectUtil.setCustomEvent(event)) {
                    return;
                }

                const mousePos = (window as any)['d3'].mouse(event.target);
                const dataX = element.__data__ && 'x' in element.__data__ ? element.__data__.x : 0;
                const dataY = element.__data__ && 'y' in element.__data__ ? element.__data__.y : 0;
                if (dataX || dataY) {
                    data.offset[event.collaboratorId] = [mousePos[0] - dataX, mousePos[1] - dataY];
                } else {
                    data.offset[event.collaboratorId] = [window.scrollX, window.scrollY];
                }

                data.draggingElements[event.collaboratorId] = element;
                data.onStart.call(element, element.__data__);
            };
        };

        const dragMove = (event: VcPointerEvent) => {
            let d3Event;
            if (!(d3Event = VisConnectUtil.setCustomEvent(event))) {
                return;
            }
            const element = data.draggingElements[event.collaboratorId];
            if (!element) {
                return;
            }

            d3Event.x -= data.offset[event.collaboratorId][0];
            d3Event.y -= data.offset[event.collaboratorId][1];

            data.onDrag.call(element, element.__data__);
        };

        const dragEnd = (event: VcPointerEvent) => {
            if (!VisConnectUtil.setCustomEvent(event)) {
                return;
            }
            const element = data.draggingElements[event.collaboratorId];
            if (element) {
                delete data.draggingElements[event.collaboratorId];
                data.onEnd.call(element, element.__data__);
            }
        };

        const drag = function (selection: {_groups: [[D3Element]]}) {
            const elements = selection._groups[0].filter((element: any) => element);
            if (!elements.length) {
                return;
            }

            data.elements = elements;

            for (const element of data.elements) {
                element.addEventListener('mousedown', (e) =>
                    dragStart(element)(e as VcPointerEvent)
                );
                element.addEventListener('touchstart', (e) =>
                    dragStart(element)(e as VcPointerEvent)
                );
            }

            window.addEventListener('mousemove', (e) => dragMove(e as VcPointerEvent));
            window.addEventListener('touchmove', (e) => dragMove(e as VcPointerEvent));
            window.addEventListener('mouseup', (e) => dragEnd(e as VcPointerEvent));
            window.addEventListener('touchend', (e) => dragEnd(e as VcPointerEvent));
        };

        drag.on = (type: string, callback: (data: any) => void) => {
            if (type === 'start') {
                data.onStart = callback;
            } else if (type === 'drag') {
                data.onDrag = callback;
            } else if (type === 'end') {
                data.onEnd = callback;
            } else {
                console.error('Drag type ', type, ' not defined.');
            }
            return drag;
        };

        return drag;
    }

    static setCustomEvent(event: VcPointerEvent) {
        const pos = point(event);
        if (!pos) {
            return null;
        }
        const newEvent = {sourceEvent: event, x: pos.x, y: pos.y};
        (window as any)['d3'].event = newEvent;

        return newEvent;
    }

    static brush() {
        const data = {
            svg: {} as D3Selection,
            onStart: (() => {}) as (data?: any) => void,
            onBrush: (() => {}) as (data?: any) => void,
            onEnd: (() => {}) as (data?: any) => void,
        };
        const collaboratorBrushes: {[collaboratorId: string]: any} = {};

        document.body.addEventListener('brush-message', (e) => {
            const event = e as Event & {
                detail: {event: any};
                collaboratorId: string;
                collaboratorColor: string;
                type: string;
            };

            if (event.type === 'brush') {
                if (!collaboratorBrushes[event.collaboratorId]) {
                    collaboratorBrushes[event.collaboratorId] = data.svg
                        .append('rect')
                        .attr('fill', event.collaboratorColor)
                        .attr('opacity', '0.4')
                        .style('pointer-events', 'none');
                }
                const rect = collaboratorBrushes[event.collaboratorId];
                const [[x0, y0], [x1, y1]] = event.detail.event;

                rect.attr('x', x0)
                    .attr('y', y0)
                    .attr('width', `${x1 - x0}`)
                    .attr('height', `${y1 - y0}`);
            }
        });

        const brush = function (svg: any) {
            data.svg = svg;
            return d3b.call(d3b, svg);
        };

        brush.extent = () => {
            d3b.extent.apply(d3b, arguments);
            return brush;
        };
        brush.start = function (this: HTMLElement, p: any) {
            const evtData = {
                detail: {
                    event: d3.event.selection,
                    collaboratorId: d3.event.collaboratorId,
                    type: 'start',
                },
            };
            document.body.dispatchEvent(new CustomEvent('brush-message', evtData));
            data.onStart.call(this, p);
        };
        brush.move = function (this: HTMLElement, p: any, t?: any) {
            if (this === null) {
                d3b.move.call(null, p);
            }
            const evtData = {
                detail: {
                    event: d3.event.selection,
                    collaboratorId: d3.event.collaboratorId,
                    type: 'brush',
                },
            };
            document.body.dispatchEvent(new CustomEvent('brush-message', evtData));
            data.onBrush.call(this, p);
        };
        brush.end = function (this: HTMLElement, p: any) {
            const evtData = {
                detail: {
                    event: d3.event.selection,
                    collaboratorId: d3.event.collaboratorId,
                    type: 'end',
                },
            };
            document.body.dispatchEvent(new CustomEvent('brush-message', evtData));
            data.onEnd.call(this, p);
        };

        brush.on = (type: string, callback: () => void) => {
            if (type === 'start') {
                data.onStart = callback;
            } else if (type === 'brush') {
                data.onBrush = callback;
            } else if (type === 'end') {
                data.onEnd = callback;
            } else {
                console.error('Drag type ', type, ' not defined.');
            }
            return brush;
        };

        const d3b = d3
            .brush()
            .on('start', brush.start)
            .on('brush', brush.move)
            .on('end', brush.end);

        return brush;
    }

    static lasso() {
        const data = {
            svg: {} as D3Selection,
            lassoGs: {} as {[collId: string]: D3Selection},
            drawing: {} as {[collId: string]: boolean},
            start: {} as {[collId: string]: [number, number]},
            positions: {} as {[collId: string]: [number, number][]},
            items: null as D3Selection | null,
            mode: 'divide' as 'divide' | 'join',
            getItemPos: (() => [0, 0]) as (item: D3Selection) => [number, number],
            possibleItems: [] as any[],
            notPossibleItems: [] as any[],
            onStart: () => {},
            onDraw: () => {},
            onEnd: () => {},
        };

        const lasso = (svg: D3Selection) => {
            data.svg = svg;

            const drag = vc.drag();

            drag.on('start', () => {
                const collId = d3.event.sourceEvent.collaboratorId;

                data.drawing[collId] = true;
                data.start[collId] = [d3.event.x, d3.event.y];
                data.positions[collId] = [];

                let lassoG = data.lassoGs[collId];
                if (!lassoG) {
                    lassoG = svg.append('g');
                    data.lassoGs[collId] = lassoG;
                }

                lassoG.selectAll('path').remove();
                lassoG
                    .append('path')
                    .attr('stroke', 'grey')
                    .attr('opacity', '0.5')
                    .style('pointer-events', 'none')
                    .attr('fill', d3.event.sourceEvent.collaboratorColor);

                lassoG.selectAll('circle').remove();
                lassoG
                    .append('circle')
                    .attr('r', 4)
                    .attr('cx', data.start[collId][0])
                    .attr('cy', data.start[collId][1])
                    .style('pointer-events', 'none')
                    .attr('fill', d3.event.sourceEvent.collaboratorColor);

                if (collId === vc.ownId || data.mode === 'join') {
                    data.onStart();
                }
            });

            drag.on('drag', () => {
                const collId = d3.event.sourceEvent.collaboratorId;

                if (data.drawing[collId]) {
                    data.positions[collId].push([d3.event.x, d3.event.y]);

                    const lassoG = data.lassoGs[collId];
                    lassoG
                        .select('path')
                        .attr(
                            'd',
                            () =>
                                'M' +
                                data.positions[collId]
                                    .map((pos) => `${pos[0]},${pos[1]}`)
                                    .reduce((a, b) => `${a} L${b}`) +
                                'Z'
                        );

                    if (collId === vc.ownId || data.mode === 'join') {
                        data.onDraw();
                    }
                }
            });

            drag.on('end', () => {
                const collId = d3.event.sourceEvent.collaboratorId;

                data.drawing[collId] = false;
                data.start[collId] = [0, 0];

                //const lassoG = data.lassoGs[collId];
                //lassoG.selectAll('path').remove();
                //lassoG.selectAll('circle').remove();

                if (collId === vc.ownId || data.mode === 'join') {
                    data.onEnd();
                }
            });

            svg.call(drag);
        };

        lasso.items = (items?: D3Selection) => {
            if (items) {
                data.items = items;
                return lasso;
            }
            return data.items;
        };

        const getItemScore = (d: any) => {
            if (!data.positions[vc.ownId]) {
                return 1;
            }
            const pos = data.getItemPos(d);
            const collIds = Object.keys(data.positions);

            if (data.mode === 'divide') {
                return classifyPoint(data.positions[vc.ownId], pos);
            } else {
                return Math.min(
                    ...collIds.map((collId) => classifyPoint(data.positions[collId], pos))
                );
            }
        };

        const getInside = () => {
            if (!data.items) {
                return null;
            }
            return data.items.filter(function (d) {
                return getItemScore(d) <= 0;
            });
        };

        const getOutside = () => {
            if (!data.items) {
                return null;
            }
            return data.items.filter(function (d) {
                return getItemScore(d) > 0;
            });
        };

        lasso.selectedItems = getInside;
        lasso.notSelectedItems = getOutside;
        lasso.possibleItems = getInside;
        lasso.notPossibleItems = getOutside;
        lasso.collaborationMode = (mode?: 'divide' | 'join') => {
            if (mode) {
                data.mode = mode;
                return lasso;
            } else {
                return data.mode;
            }
        };

        lasso.getItemPos = (cb: (item: D3Selection) => [number, number]) => {
            data.getItemPos = cb;
            return lasso;
        };

        lasso.on = (type: string, callback: () => void) => {
            if (type === 'start') {
                data.onStart = callback;
            } else if (type === 'draw') {
                data.onDraw = callback;
            } else if (type === 'end') {
                data.onEnd = callback;
            } else {
                console.error('Lasso type ', type, ' not defined.');
            }
            return lasso;
        };

        return lasso;
    }

    static mouse(node: HTMLElement): [number, number] {
        const coords = (window as any)['d3'].mouse(node);
        return [coords[0] - window.scrollX, coords[1] - window.scrollY];
    }

    static random(leaderId: string) {
        // string to int hash from https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0.
        let seed = Array.from(leaderId).reduce(
            (s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0,
            0
        );
        return () => {
            // Bad but seeded random function
            const x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };
    }

    // From https://gist.github.com/0x263b/2bdd90886c2036a1ad5bcf06d6e6fb37
    static stringToHex(string: string) {
        let hash = 0;
        if (string.length === 0) return '#000000';
        for (let i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash;
        }
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 255;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    }
}

// Adapted from D3.js
function point(event: MouseEvent | TouchEvent) {
    const node = event.target as SVGElement;
    const svg = node.ownerSVGElement || node;

    const position = event instanceof MouseEvent ? event : event.touches[0];
    if (!position) {
        console.warn(event);
        return null;
    }

    if ((svg as any).createSVGPoint) {
        let point = (svg as any).createSVGPoint();
        point.x = position.clientX;
        point.y = position.clientY;
        point = point.matrixTransform((node as any).getScreenCTM().inverse());
        return {x: point.x, y: point.y};
    }

    const rect = node.getBoundingClientRect();
    return {
        x: position.clientX - rect.left - node.clientLeft,
        y: position.clientY - rect.top - node.clientTop,
    };
}

interface D3Selection {
    append: (elementType: string) => D3Selection;
    attr: (name: string, value?: string | number | ((d: any) => string | number)) => D3Selection;
    call: (fct: () => void) => D3Selection;
    each: (fct: (d: any) => void) => D3Selection;
    filter: (fct: (d: any) => boolean) => D3Selection;
    nodes: () => Element[];
    on: (name: string, callback?: (event: any) => void) => D3Selection;
    select: (name: string) => D3Selection;
    selectAll: (name: string) => D3Selection;
    style: (name: string, value?: string) => D3Selection;
    remove: () => void;
}

function wrapFct(wrap: any, inner: any, fctName: string) {
    wrap[fctName] = () => {
        inner[fctName].apply(inner, arguments as any);
        return wrap;
    };
}
