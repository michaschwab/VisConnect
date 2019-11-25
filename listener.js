"use strict";
class DescListener {
    constructor(svg, hearEvent) {
        this.svg = svg;
        this.hearEvent = hearEvent;
        console.log("step 1");
        this.addListenersToElementAndChildren(this.svg);
        // Prevent d3 from blocking DescVis and other code to have access to events.
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
            const eventObj = this.getStrippedEvent(e);
            //this.connection.broadcastEvent(eventObj);
            this.hearEvent(eventObj);
        };
    }
    getStrippedEvent(e) {
        let obj = { type: '' };
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
