"use strict";
class DescVis {
    constructor(svg) {
        this.svg = svg;
        this.connection = new DescConnection(this.receiveEvent.bind(this));
        this.addListenersToElementAndChildren(this.svg);
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
            const eventObj = this.getSerializedEvent(e);
            this.connection.broadcastEvent(eventObj);
        };
    }
    receiveEvent(eventObject) {
        const targetSelector = eventObject.target;
        let target = this.svg;
        let e;
        if (eventObject.type.substr(0, 5) === 'touch') {
            e = new TouchEvent(eventObject.type, eventObject);
        }
        else if (eventObject.type.substr(0, 5) === 'mouse') {
            e = new MouseEvent(eventObject.type, eventObject);
        }
        else if (eventObject.type.substr(0, 4) === 'drag') {
            e = new DragEvent(eventObject.type, eventObject);
        }
        else {
            e = new Event(eventObject.type, eventObject);
        }
        if (targetSelector) {
            let newTarget = document.querySelector(targetSelector);
            if (!newTarget) {
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
        e['desc-received'] = true;
        target.dispatchEvent(e);
    }
    getSerializedEvent(e) {
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
