class DescVis {
    private connection: DescConnection = new DescConnection(this.receiveEvent.bind(this));

    constructor(private svg: SVGElement) {
        this.addListenersToElement(this.svg);
    }

    addListenersToElement(element: SVGElement) {
        const boundCapture = this.captureEvent.bind(this);

        element.addEventListener('mousemove', boundCapture);
        element.addEventListener('mouseup', boundCapture);
        element.addEventListener('mousedown', boundCapture);
        element.addEventListener('click', boundCapture);
        element.addEventListener('touchstart', boundCapture);
        element.addEventListener('touchend', boundCapture);
        element.addEventListener('selectstart', boundCapture);
        element.addEventListener('dragstart', boundCapture);
    }

    captureEvent(e: MouseEvent|TouchEvent|DragEvent|Event) {
        if((e as any)['desc-received']) {
            // Don't broadcast events that have been received from other clients.
            return;
        }
        const eventObj = this.getSerializedEvent(e);
        this.connection.broadcastEvent(eventObj);
    }

    receiveEvent(eventObject: SerializedEvent) {
        const targetSelector = eventObject.target;
        let target: Element = this.svg;
        let e: Event;
        if(eventObject.type.substr(0, 5) === 'touch') {
            e = new TouchEvent(eventObject.type, eventObject as any);
        } else if(eventObject.type.substr(0, 5) === 'mouse') {
            e = new MouseEvent(eventObject.type, eventObject as any);
        } else if(eventObject.type.substr(0, 4) === 'drag') {
            e = new DragEvent(eventObject.type, eventObject as any);
        } else {
            e = new Event(eventObject.type, eventObject as any);
        }

        if(targetSelector) {
            let newTarget: Element|null = document.querySelector(targetSelector as string);
            if(!newTarget) {
                console.error('element not found', targetSelector);
                return;
            }
            target = newTarget;
        }
        Object.defineProperty(e, 'target', {
            writable: true,
            value: target,
        });
        Object.defineProperty(e, 'view', {
            writable: true,
            value: window,
        });
        (e as any)['desc-received'] = true;
        target.dispatchEvent(e);
    }

    getSerializedEvent(e: MouseEvent|TouchEvent|Event) {
        let obj: SerializedEvent = {type: ''};
        for(const key in e) {
            const val = (e as any)[key];
            if(typeof val !== 'object' && typeof val !== 'function') {
                obj[key] = val;
            }
        }
        const target = this.getElementSelector(e.target as Element);
        if(target) {
            obj.target = target;
        }
        return obj;
    }

    getElementSelector(element: Element|null): string|null {
        if(!element) {
            return null;
        }
        if(element === this.svg) {
            return 'svg';
        }
        const parent = element.parentNode;
        if(!parent) {
            return null;
        }

        const index = Array.from(parent.children).indexOf(element);
        const type = element.tagName;

        return this.getElementSelector(parent as Element) + ` > ${type}:nth-child(${index+1})`;
    }
}

interface SerializedEvent {
    type: string,
    [key: string]: string|number;
}