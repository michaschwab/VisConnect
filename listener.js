"use strict";
class DescListener {
    constructor(svg, hearEvent) {
        this.svg = svg;
        this.hearEvent = hearEvent;
        this.dragElement = null;
        console.log("step 1");
        this.addListenersToElementAndChildren(this.svg);
        // Prevent d3 from blocking DescVis and other code to have access to events.
        Event.prototype['stopImmediatePropagationBackup'] = Event.prototype.stopImmediatePropagation;
        Event.prototype.stopImmediatePropagation = () => { };
    }
    addListenersToElementAndChildren(element) {
        this.addListenersToElement(element);
        for (const child of element.children) {
            this.addListenersToElementAndChildren(child);
        }
    }
    addListenersToElement(element) {
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
    captureEvent(element) {
        return (e) => {
            if (e.target !== element) {
                // Only capture for the correct target.
                return;
            }
            if (e['desc-received']) {
                // Don't broadcast events that have been received from other clients.
                return;
            }
            if (e.type === 'mousedown') {
                this.dragElement = e.target;
            }
            if (e.type === 'mouseup') {
                this.dragElement = null;
            }
            if (e.type === 'mousemove' && this.dragElement && e.target !== this.dragElement) {
                console.log('changing event target');
                e.stopImmediatePropagation();
                e.stopPropagation();
                e['stopImmediatePropagationBackup']();
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
    getStrippedEvent(e) {
        let obj = { type: '', target: '' };
        for (const key in e) {
            const val = e[key];
            if (typeof val !== 'object' && typeof val !== 'function') {
                obj[key] = val;
            }
        }
        const target = this.getElementSelector(e.target);
        if (target) {
            obj.target = target;
        }
        return obj;
    }
    getElementSelector(element) {
        if (!element) {
            return null;
        }
        if (element === this.svg) {
            return 'svg';
        }
        const parent = element.parentNode;
        if (!parent) {
            return null;
        }
        const index = Array.from(parent.children).indexOf(element);
        const type = element.tagName;
        return this.getElementSelector(parent) + ` > ${type}:nth-child(${index + 1})`;
    }
}
