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
}

// Adapted from D3.js
function point(event: MouseEvent|TouchEvent) {
    const node = event.target as SVGElement;
    const svg = node.ownerSVGElement || node;

    const position = event instanceof MouseEvent ? event : event.changedTouches[0];
    if(!position) {
        //console.warn(event.changedTouches);
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