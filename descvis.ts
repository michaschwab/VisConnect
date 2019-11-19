class DescVis {
    private connection: DescConnection = new DescConnection(this.receiveEvent.bind(this));
    
    constructor(private svg: SVGElement) {
        const listener: DescListener = new DescListener(this.svg, this.hearEvent.bind(this));
            
    }

    hearEvent(eventObj: SerializedEvent) {
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
}

interface SerializedEvent {
    type: string,
    [key: string]: string|number;
}