export class VisConnectUtil {
    static drag() {
        const data = {
            elements: null as HTMLElement[]|null,
            draggingElements: {} as {[collaborator: string]: HTMLElement},
            onStart: (data: any) => {},
            onEnd: (data: any) => {},
            onDrag: (data: any) => {}
        };

        const dragStart = (element: HTMLElement) => {
            return (e: MouseEvent|TouchEvent) => {
                const event = e as (MouseEvent|TouchEvent) & {collaboratorId: string, isLocalEvent: boolean};
                if(!setCustomEvent(event)) {
                    return;
                }
                data.draggingElements[event.collaboratorId] = element;
                data.onStart.call(element, (element as any)['__data__']);
            };
        };

        const dragMove = (e: MouseEvent|TouchEvent) => {
            const event = e as (MouseEvent|TouchEvent) & {collaboratorId: string, isLocalEvent: boolean};
            if(!setCustomEvent(event)) {
                return;
            }
            const element = data.draggingElements[event.collaboratorId];
            if(element) {
                data.onDrag.call(element, (element as any)['__data__']);
            }
        };

        const dragEnd = (e: MouseEvent|TouchEvent) => {
            const event = e as (MouseEvent|TouchEvent) & {collaboratorId: string, isLocalEvent: boolean};
            if(!setCustomEvent(event)) {
                return;
            }
            const element = data.draggingElements[event.collaboratorId];
            if(element) {
                delete data.draggingElements[event.collaboratorId];
                data.onEnd.call(element, (element as any)['__data__']);
            }
        };

        const drag = function(selection: {_groups: [[HTMLElement]]}) {
            const elements = selection._groups[0].filter((element: any) => element);
            if(!elements.length) {
                return;
            }

            data.elements = elements;

            for(const element of data.elements) {
                element.addEventListener('mousedown', dragStart(element));
                element.addEventListener('touchstart', dragStart(element));
            }

            window.addEventListener('mousemove', dragMove);
            window.addEventListener('touchmove', dragMove);
            window.addEventListener('mouseup', dragEnd);
            window.addEventListener('touchend', dragEnd);
        };

        const setCustomEvent = (event: (MouseEvent|TouchEvent) & {collaboratorId: string, isLocalEvent: boolean}) => {
            const pos = point(event);
            if(!pos) {
                return false;
            }

            (window as any)['d3'].event = {
                sourceEvent: event,
                x: pos.x,
                y: pos.y,
            };
            return true;
        };

        drag.on = (type: string, callback: (data: any) => void) => {
            if(type === 'start') {
                data.onStart = callback;
            } else if(type === 'drag') {
                data.onDrag = callback;
            } else if(type === 'end') {
                data.onEnd = callback;
            } else {
                console.error('Drag type ', type, ' not defined.');
            }
            return drag;
        };

        return drag;
    }

    static brush() {
        const data = {
            svg: {} as D3Selection,
            onStart: () => {},
            onBrush: () => {},
            onEnd: () => {},
        }
        const collaboratorBrushes: {[collaboratorId: string]: any} = {};

        const d3b = d3.brush()
            .on('brush', () => {
                const evtData = {detail: {event: d3.event.selection, collaboratorId: d3.event.collaboratorId}};
                const event = new CustomEvent('brush-message', evtData);
                document.body.dispatchEvent(event);
                data.onBrush();
            });

        document.body.addEventListener('brush-message', (e) => {
            const event = e as Event & {detail: {event: any}, collaboratorId: string, collaboratorColor: string};

            if(!collaboratorBrushes[event.collaboratorId]) {
                collaboratorBrushes[event.collaboratorId] = data.svg.append('rect')
                    .attr('fill', event.collaboratorColor)
                    .attr('opacity', '0.4')
                    .style('pointer-events', 'none');
            }
            const rect = collaboratorBrushes[event.collaboratorId];
            const [[x0, y0], [x1, y1]] = event.detail.event;

            rect
                .attr('x', x0)
                .attr('y', y0)
                .attr('width', `${x1 - x0}`)
                .attr('height', `${y1 - y0}`);
        });

        const brush = function(svg: any) {
            data.svg = svg;

            return d3b.call(d3b, svg);
        };
        brush.extent = () => {
            d3b.extent.apply(d3b, arguments);
            return brush;
        }

        brush.on = (type: string, callback: () => void) => {
            if(type === 'start') {
                data.onStart = callback;
            } else if(type === 'brush') {
                data.onBrush = callback;
            } else if(type === 'end') {
                data.onEnd = callback;
            } else {
                console.error('Drag type ', type, ' not defined.');
            }
            return brush;
        };

        return brush;
    }

    static mouse(node: HTMLElement) {
        const coords = (window as any)['d3'].mouse(node);
        return [coords[0] - window.scrollX, coords[1] - window.scrollY];
    }

    static random(leaderId: string) {
        // string to int hash from https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0.
        let seed = Array.from(leaderId).reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0);
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
    };

}

// Adapted from D3.js
function point(event: MouseEvent|TouchEvent) {
    const node = event.target as SVGElement;
    const svg = node.ownerSVGElement || node;

    const position = event instanceof MouseEvent ? event : event.touches[0];
    if(!position) {
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
    return {x: position.clientX - rect.left - node.clientLeft, y: position.clientY - rect.top - node.clientTop};
}

interface D3Selection {
    append: (elementType: string) => D3Selection;
    attr: (name: string, value?: string) => D3Selection;
    style: (name: string, value?: string) => D3Selection;
}
