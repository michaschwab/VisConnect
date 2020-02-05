import {disableStopPropagation} from "./dom";

export interface StrippedEvent {
    type: string,
    target: string,
    touches: {clientX: number, clientY: number}[],
    [key: string]: string|number|{clientX: number, clientY: number}[];
}

export class DescListener {

    private dragElement: HTMLElement|null = null;

    constructor(private svg: Element, private hearEvent: (e: StrippedEvent, event: Event) => void) {
        this.addListenersToElementAndChildren(this.svg);
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
        element.addEventListener('touchmove', boundCapture);
        element.addEventListener('mouseenter', boundCapture);
        element.addEventListener('mouseout', boundCapture);
        element.addEventListener('click', boundCapture);
        element.addEventListener('touchstart', boundCapture);
        element.addEventListener('touchend', boundCapture);
        element.addEventListener('selectstart', boundCapture);
        element.addEventListener('dragstart', boundCapture);

        // Add listeners to future child elements.
        const appendBackup = element.appendChild;
        const that = this;

        element.appendChild = function<T extends Node>(newChild: T) {
            that.addListenersToElement(newChild as unknown as Element);
            return appendBackup.call(this, newChild) as T;
        }
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
            if(e.type === 'mousedown') {
                this.dragElement = e.target as HTMLElement;
            }
            if(e.type === 'mouseup') {
                this.dragElement = null;
            }
            if(e.type === 'mousemove' && this.dragElement && e.target !== this.dragElement) {
                console.log('changing event target');

                e.stopImmediatePropagation();
                e.stopPropagation();
                (e as any)['stopImmediatePropagationBackup']();
                e.preventDefault();

                Object.defineProperty(e, 'target', {
                    enumerable: false,
                    writable: true,
                    value: this.dragElement,
                });

                const eventCopy = new MouseEvent(e.type, e);
                this.dragElement.dispatchEvent(eventCopy);
            }
            const eventObj = this.getStrippedEvent(e);
            //this.connection.broadcastEvent(eventObj);
            this.hearEvent(eventObj, e);
        };
    }

    getStrippedEvent(e: MouseEvent|TouchEvent|Event) {
        let obj: StrippedEvent = {type: '', target: '', touches: []};
        for(const key in e) {
            const val = (e as any)[key];
            if(typeof val !== 'object' && typeof val !== 'function') {
                obj[key] = val;
            }
        }
        if(e instanceof TouchEvent && e.touches && e.touches.length) {
            for(const touch of e.touches) {
                obj.touches.push({clientX: touch.clientX, clientY: touch.clientY});
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
        if(element === document.body) {
            return 'body';
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
