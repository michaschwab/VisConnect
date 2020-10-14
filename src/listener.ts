export interface StrippedEvent {
    type: string;
    target: string;
    targetType: string;
    timeStamp: number;
    touches: {clientX: number; clientY: number}[];
    collaboratorId: string;
    [key: string]: string | number | {clientX: number; clientY: number}[];
}

export class VcListener {
    private registeredElements: Element[] = [];
    constructor(
        private svg: Element,
        private hearEvent: (e: StrippedEvent, event: Event) => void,
        private customEvents?: string[],
        private ignoreEvents?: string[]
    ) {
        this.addListenersToElementAndChildren(this.svg);
    }

    stop() {
        for (const element of this.registeredElements) {
            const listener = (element as any)['visconnect-listener'];
            const eventTypes = this.getRelevantEventTypes();
            for (const type of eventTypes) {
                element.removeEventListener(type, listener);
            }
        }
    }

    addListenersToElementAndChildren(element: Element) {
        this.addListenersToElement(element);
        for (const child of element.children) {
            this.addListenersToElementAndChildren(child);
        }
    }

    addListenersToElement(element: Element) {
        const boundCapture = this.captureEvent(element).bind(this);
        const eventTypes = this.getRelevantEventTypes();

        this.registeredElements.push(element);
        (element as any)['visconnect-listener'] = boundCapture;
        for (const type of eventTypes) {
            element.addEventListener(type, boundCapture);
        }

        // Add listeners to future child elements.
        const appendBackup = element.appendChild;
        const insertBeforeBackup = element.insertBefore;
        const that = this;

        element.appendChild = function <T extends Node>(newChild: T) {
            that.addListenersToElement((newChild as unknown) as Element);
            return appendBackup.call(this, newChild) as T;
        };

        element.insertBefore = function <T extends Node>(newChild: T, nextChild: Node | null) {
            that.addListenersToElement((newChild as unknown) as Element);
            return insertBeforeBackup.call(this, newChild, nextChild) as T;
        };
    }

    getRelevantEventTypes() {
        const custom = this.customEvents ? this.customEvents : [];
        return [
            'mousemove',
            'mouseup',
            'mousedown',
            'touchmove',
            'mouseenter',
            'mouseout',
            'mouseover',
            'mouseleave',
            'click',
            'dblclick',
            'touchstart',
            'touchend',
            'selectstart',
            'dragstart',
        ]
            .filter(
                (type) =>
                    !this.ignoreEvents ||
                    (this.ignoreEvents[0] !== 'all' && !this.ignoreEvents.includes(type))
            )
            .concat(custom)
            .concat(['brush-message']);
    }

    captureEvent(element: Element) {
        return (e: MouseEvent | TouchEvent | DragEvent | Event) => {
            if (e.target !== element) {
                // Only capture for the correct target.
                return;
            }
            if ((e as any)['visconnect-received']) {
                // Don't broadcast events that have been received from other clients.
                return;
            }
            const eventObj = this.getStrippedEvent(e);
            //this.connection.broadcastEvent(eventObj);
            this.hearEvent(eventObj, e);
        };
    }

    getStrippedEvent(e: MouseEvent | TouchEvent | Event | CustomEvent) {
        let obj: StrippedEvent = {
            type: '',
            target: '',
            targetType: '',
            touches: [],
            timeStamp: -1,
            collaboratorId: '',
        };
        for (const key in e) {
            const val = (e as any)[key];
            if (typeof val !== 'object' && typeof val !== 'function') {
                obj[key] = val;
            }
        }
        if (obj.clientX) {
            obj.clientX = (obj.clientX as number) + window.scrollX;
        }
        if (obj.x) {
            obj.x = (obj.x as number) + window.scrollX;
        }
        if (obj.clientY) {
            obj.clientY = (obj.clientY as number) + window.scrollY;
        }
        if (obj.y) {
            obj.y = (obj.y as number) + window.scrollY;
        }

        if (window.TouchEvent && e instanceof TouchEvent && e.touches && e.touches.length) {
            for (const touch of e.touches) {
                obj.touches.push({
                    clientX: touch.clientX + window.scrollX,
                    clientY: touch.clientY + window.scrollX,
                });
            }
        }
        if ((e as CustomEvent).detail) {
            obj.detail = (e as CustomEvent).detail;
        }
        const target = this.getElementSelector(e.target as Element);
        if (target) {
            obj.target = target;
            obj.targetType = (e.target as Element).tagName.toLowerCase();
        }
        return obj;
    }

    getElementSelector(element: Element | null): string | null {
        if (!element) {
            return null;
        }
        if (element === document.body) {
            return 'body';
        }
        const parent = element.parentNode;
        if (!parent) {
            return null;
        }

        const index = Array.from(parent.children).indexOf(element);
        const type = element.tagName;

        return this.getElementSelector(parent as Element) + ` > ${type}:nth-child(${index + 1})`;
    }
}
