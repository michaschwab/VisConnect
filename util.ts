export class VisConnectUtil {
    static drag() {
        const data = {
            element: null as HTMLElement|null,
            onStart: () => {},
            onEnd: () => {},
            onDrag: () => {}
        };

        const drag = function(selection: {_groups: [[HTMLElement]]}) {
            data.element = selection._groups[0][0];

            data.element.addEventListener('mousedown', (e: MouseEvent) => {
                const event = e as MouseEvent & {collaboratorId: string, isLocalEvent: boolean};
                (window as any)['d3'].event = {sourceEvent: event};
                data.onStart.call(data.element);
            });

            window.addEventListener('mousemove', (e: MouseEvent) => {
                const event = e as MouseEvent & {collaboratorId: string, isLocalEvent: boolean};
                (window as any)['d3'].event = {sourceEvent: event};
                data.onDrag.call(data.element);
            });

            window.addEventListener('mouseup', (e: MouseEvent) => {
                const event = e as MouseEvent & {collaboratorId: string, isLocalEvent: boolean};
                (window as any)['d3'].event = {sourceEvent: event};
                data.onEnd.call(data.element);
            });
        };

        drag.on = (type: string, callback: () => void) => {
            if(type === 'start') {
                data.onStart = callback;
            } else if(type === 'drag') {
                data.onDrag = callback;
            } else if(type === 'end') {
                data.onEnd = callback;
            } else {
                console.error('Drag type ', type, ' not defined.');
            }
        };

        return drag;
    }
}