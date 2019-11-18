"use strict";
class DescVis {
    constructor(svg) {
        this.svg = svg;
        this.connection = new DescConnection(this.receiveEvent.bind(this));
        this.svg.addEventListener('mousemove', this.captureEvent.bind(this));
        this.svg.addEventListener('mouseup', this.captureEvent.bind(this));
        this.svg.addEventListener('mousedown', this.captureEvent.bind(this));
        this.svg.addEventListener('click', this.captureEvent.bind(this));
    }
    captureEvent(e) {
        if (e['desc-received']) {
            // Don't broadcast events that have been received from other clients.
            return;
        }
        const eventObj = this.getSerializedEvent(e);
        this.connection.broadcastEvent(eventObj);
    }
    receiveEvent(eventObject) {
        const targetSelector = eventObject.target;
        let target = this.svg;
        const e = new MouseEvent(eventObject.type, eventObject);
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
            value: target
        });
        e['desc-received'] = true;
        target.dispatchEvent(e);
        console.log(e);
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
            //console.log(target);
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
    combineElementSelectors(parentSelector, elementType, childIndex) {
        return parentSelector + ' > ' + elementType + ':nth-child(' + childIndex + ')';
    }
}
