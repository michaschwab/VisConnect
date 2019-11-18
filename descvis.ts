class DescVis {
    private connection: DescConnection = new DescConnection(this.receiveEvent.bind(this));

    constructor(private svg: SVGElement) {
        this.svg.addEventListener('mousemove', this.captureEvent.bind(this));
        this.svg.addEventListener('mouseup', this.captureEvent.bind(this));
        this.svg.addEventListener('mousedown', this.captureEvent.bind(this));
        this.svg.addEventListener('click', this.captureEvent.bind(this));
    }

    captureEvent(e: MouseEvent) {
        const eventObj = this.getSerializedEvent(e);
        this.connection.broadcastEvent(eventObj);
    }

    receiveEvent(eventObject: SerializedEvent) {
        const targetSelector = eventObject.target;
        let target: Element = this.svg;
        const e = new MouseEvent(eventObject.type, eventObject as any);
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
            value: target
        });
        target.dispatchEvent(e);
        console.log(e);
    }

    getSerializedEvent(e: MouseEvent) {
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
            //console.log(target);
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

        return this.getElementSelector(parent) + ` > ${type}:nth-child(${index+1})`;
    }

    combineElementSelectors(parentSelector: string, elementType: string, childIndex: number) {
        return parentSelector + ' > ' + elementType + ':nth-child(' + childIndex + ')';
    }
}

interface SerializedEvent {
    type: string,
    [key: string]: string|number;
}