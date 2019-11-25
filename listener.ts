class DescListener {
    constructor(private svg: SVGElement, private hearEvent: (e: StrippedEvent, event: Event) => void) {
        console.log("step 1");
        this.addListenersToElementAndChildren(this.svg);

        // Prevent d3 from blocking DescVis and other code to have access to events.
        (Event as any).prototype['stopImmediatePropagationBackup'] = Event.prototype.stopImmediatePropagation;
        Event.prototype.stopImmediatePropagation = () => {};
    }

    addListenersToElementAndChildren(element: Element) {
        
        this.addListenersToElement(element);
        for(const child of element.children) {
            this.addListenersToElementAndChildren(child);
        }
    }

    addListenersToElement(element: Element) {
        const boundCapture = this.captureEvent(element).bind(this);

        element.addEventListener('mousemove', boundCapture);
        element.addEventListener('mouseup', boundCapture);
        element.addEventListener('mousedown', boundCapture);
        element.addEventListener('mouseenter', boundCapture);
        element.addEventListener('mouseout', boundCapture);
        element.addEventListener('click', boundCapture);
        element.addEventListener('touchstart', boundCapture);
        element.addEventListener('touchend', boundCapture);
        element.addEventListener('selectstart', boundCapture);
        element.addEventListener('dragstart', boundCapture);
    }

    captureEvent(element: Element) {
        return (e: MouseEvent|TouchEvent|DragEvent|Event) => {
            if(e.target !== element) {
                // Only capture for the correct target.
                return;
            }
            if((e as any)['desc-received']) {
                // Don't broadcast events that have been received from other clients.
                return;
            }
            const eventObj = this.getStrippedEvent(e);
            //this.connection.broadcastEvent(eventObj);
            this.hearEvent(eventObj, e);
        };
    }

    getStrippedEvent(e: MouseEvent|TouchEvent|Event) {
        let obj: StrippedEvent = {type: '', target: ''};
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
