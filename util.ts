export class VisConnectUtil {
    static drag() {
        const data = {
            elements: null as HTMLElement[]|null,
            draggingElements: {} as {[collaborator: string]: HTMLElement},
            onStart: (data: any) => {},
            onEnd: (data: any) => {},
            onDrag: (data: any) => {}
        };

        const drag = function(selection: {_groups: [[HTMLElement]]}) {
            const elements = selection._groups[0].filter((element: any) => element);
            if(!elements.length) {
                return;
            }

            data.elements = elements;

            for(const element of data.elements) {
                element.addEventListener('mousedown', (e: MouseEvent) => {
                    const event = e as MouseEvent & {collaboratorId: string, isLocalEvent: boolean};
                    setCustomEvent(event);
                    data.draggingElements[event.collaboratorId] = element;
                    data.onStart.call(element, (element as any)['__data__']);
                });
            }

            window.addEventListener('mousemove', (e: MouseEvent) => {
                const event = e as MouseEvent & {collaboratorId: string, isLocalEvent: boolean};
                setCustomEvent(event);
                const element = data.draggingElements[event.collaboratorId];
                if(element) {
                    data.onDrag.call(element, (element as any)['__data__']);
                }
            });

            window.addEventListener('mouseup', (e: MouseEvent) => {
                const event = e as MouseEvent & {collaboratorId: string, isLocalEvent: boolean};
                setCustomEvent(event);
                const element = data.draggingElements[event.collaboratorId];
                if(element) {
                    delete data.draggingElements[event.collaboratorId];
                    data.onEnd.call(element, (element as any)['__data__']);
                }
            });
        };

        const setCustomEvent = (event: MouseEvent & {collaboratorId: string, isLocalEvent: boolean}) => {
            const pos = point(event);

            (window as any)['d3'].event = {
                sourceEvent: event,
                x: pos.x,
                y: pos.y,
            };
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

// from D3.js
function point(event: MouseEvent) {
    const node = event.target as SVGElement;
    const svg = node.ownerSVGElement || node;

    if ((svg as any).createSVGPoint) {
        let point = (svg as any).createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        point = point.matrixTransform((node as any).getScreenCTM().inverse());
        return {x: point.x, y: point.y};
    }

    const rect = node.getBoundingClientRect();
    return {x: event.clientX - rect.left - node.clientLeft, y: event.clientY - rect.top - node.clientTop};
}