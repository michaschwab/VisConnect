'use strict';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

var VisConnectUtil = /** @class */ (function () {
    function VisConnectUtil() {
    }
    VisConnectUtil.drag = function () {
        var data = {
            elements: null,
            draggingElements: {},
            onStart: function (data) { },
            onEnd: function (data) { },
            onDrag: function (data) { }
        };
        var dragStart = function (element) {
            return function (e) {
                var event = e;
                if (!VisConnectUtil.setCustomEvent(event)) {
                    return;
                }
                data.draggingElements[event.collaboratorId] = element;
                data.onStart.call(element, element['__data__']);
            };
        };
        var dragMove = function (e) {
            var event = e;
            if (!VisConnectUtil.setCustomEvent(event)) {
                return;
            }
            var element = data.draggingElements[event.collaboratorId];
            if (element) {
                data.onDrag.call(element, element['__data__']);
            }
        };
        var dragEnd = function (e) {
            var event = e;
            if (!VisConnectUtil.setCustomEvent(event)) {
                return;
            }
            var element = data.draggingElements[event.collaboratorId];
            if (element) {
                delete data.draggingElements[event.collaboratorId];
                data.onEnd.call(element, element['__data__']);
            }
        };
        var drag = function (selection) {
            var elements = selection._groups[0].filter(function (element) { return element; });
            if (!elements.length) {
                return;
            }
            data.elements = elements;
            for (var _i = 0, _a = data.elements; _i < _a.length; _i++) {
                var element = _a[_i];
                element.addEventListener('mousedown', dragStart(element));
                element.addEventListener('touchstart', dragStart(element));
            }
            window.addEventListener('mousemove', dragMove);
            window.addEventListener('touchmove', dragMove);
            window.addEventListener('mouseup', dragEnd);
            window.addEventListener('touchend', dragEnd);
        };
        drag.on = function (type, callback) {
            if (type === 'start') {
                data.onStart = callback;
            }
            else if (type === 'drag') {
                data.onDrag = callback;
            }
            else if (type === 'end') {
                data.onEnd = callback;
            }
            else {
                console.error('Drag type ', type, ' not defined.');
            }
            return drag;
        };
        return drag;
    };
    VisConnectUtil.setCustomEvent = function (event) {
        var pos = point(event);
        if (!pos) {
            return false;
        }
        window['d3'].event = {
            sourceEvent: event,
            x: pos.x,
            y: pos.y,
        };
        return true;
    };
    VisConnectUtil.brush = function () {
        var data = {
            svg: {},
            onStart: function () { },
            onBrush: function () { },
            onEnd: function () { },
        };
        var collaboratorBrushes = {};
        var d3b = d3.brush()
            .on('brush', function () {
            var evtData = { detail: { event: d3.event.selection, collaboratorId: d3.event.collaboratorId } };
            var event = new CustomEvent('brush-message', evtData);
            document.body.dispatchEvent(event);
            data.onBrush();
        });
        document.body.addEventListener('brush-message', function (e) {
            var event = e;
            if (!collaboratorBrushes[event.collaboratorId]) {
                collaboratorBrushes[event.collaboratorId] = data.svg.append('rect')
                    .attr('fill', event.collaboratorColor)
                    .attr('opacity', '0.4')
                    .style('pointer-events', 'none');
            }
            var rect = collaboratorBrushes[event.collaboratorId];
            var _a = event.detail.event, _b = _a[0], x0 = _b[0], y0 = _b[1], _c = _a[1], x1 = _c[0], y1 = _c[1];
            rect
                .attr('x', x0)
                .attr('y', y0)
                .attr('width', "" + (x1 - x0))
                .attr('height', "" + (y1 - y0));
        });
        var brush = function (svg) {
            data.svg = svg;
            return d3b.call(d3b, svg);
        };
        brush.extent = function () {
            d3b.extent.apply(d3b, arguments);
            return brush;
        };
        brush.on = function (type, callback) {
            if (type === 'start') {
                data.onStart = callback;
            }
            else if (type === 'brush') {
                data.onBrush = callback;
            }
            else if (type === 'end') {
                data.onEnd = callback;
            }
            else {
                console.error('Drag type ', type, ' not defined.');
            }
            return brush;
        };
        return brush;
    };
    VisConnectUtil.lasso = function () {
        var data = {
            svg: {},
            lassoGs: {},
            drawing: {},
            start: {},
            positions: {},
            onStart: function () { },
            onDraw: function () { },
            onEnd: function () { },
        };
        var lasso = function (svg) {
            data.svg = svg;
            var drag = vc.drag();
            drag.on('start', function () {
                var collId = d3.event.collaboratorId;
                data.drawing[collId] = true;
                data.start[collId] = [d3.event.x, d3.event.y];
                data.positions[collId] = [];
                var lassoG = data.lassoGs[collId];
                if (!lassoG) {
                    lassoG = svg.append('g');
                    data.lassoGs[collId] = lassoG;
                }
                lassoG.selectAll('path').remove();
                lassoG.append('path')
                    .attr('stroke', 'grey')
                    .attr('fill', 'rgba(150,150,150,0.5)');
                lassoG.selectAll('circle').remove();
                lassoG.append('circle')
                    .attr('r', 5)
                    .attr('cx', data.start[collId][0])
                    .attr('cy', data.start[collId][1])
                    .attr('fill', 'grey');
            });
            drag.on('drag', function () {
                var collId = d3.event.collaboratorId;
                if (data.drawing[collId]) {
                    data.positions[collId].push([d3.event.x, d3.event.y]);
                    var lassoG = data.lassoGs[collId];
                    lassoG.select('path')
                        .attr('d', function () { return 'M' + data.positions[collId]
                        .map(function (pos) { return pos[0] + "," + pos[1]; })
                        .reduce(function (a, b) { return a + " L" + b; }) + 'Z'; });
                }
            });
            drag.on('end', function () {
                var collId = d3.event.collaboratorId;
                data.drawing[collId] = false;
                data.start[collId] = [0, 0];
                data.positions[collId] = [];
                var lassoG = data.lassoGs[collId];
                lassoG.selectAll('path').remove();
                lassoG.selectAll('circle').remove();
            });
            svg.call(drag);
        };
        lasso.items = function () { return lasso; };
        lasso.closePathDistance = function () { return lasso; };
        lasso.closePathSelect = function () { return lasso; };
        lasso.targetArea = function () { return lasso; };
        lasso.selectedItems = function () { return lasso; };
        lasso.notSelectedItems = function () { return lasso; };
        lasso.on = function () { return lasso; };
        /*const d3l = d3lasso()
            .on('draw', () => {
                const evtData = {detail: {event: d3.event.selection, collaboratorId: d3.event.collaboratorId}};
                const event = new CustomEvent('draw-message', evtData);
                document.body.dispatchEvent(event);
                data.onDraw();
            });

        document.body.addEventListener('draw-message', (e) => {

        });

        lasso.on = (type: string, callback: () => void) => {
            if(type === 'start') {
                data.onStart = callback;
            } else if(type === 'draw') {
                data.onDraw = callback;
            } else if(type === 'end') {
                data.onEnd = callback;
            } else {
                console.error('Lasso type ', type, ' not defined.');
            }
            return lasso;
        };*/
        return lasso;
    };
    VisConnectUtil.mouse = function (node) {
        var coords = window['d3'].mouse(node);
        return [coords[0] - window.scrollX, coords[1] - window.scrollY];
    };
    VisConnectUtil.random = function (leaderId) {
        // string to int hash from https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0.
        var seed = Array.from(leaderId).reduce(function (s, c) { return Math.imul(31, s) + c.charCodeAt(0) | 0; }, 0);
        return function () {
            // Bad but seeded random function
            var x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        };
    };
    // From https://gist.github.com/0x263b/2bdd90886c2036a1ad5bcf06d6e6fb37
    VisConnectUtil.stringToHex = function (string) {
        var hash = 0;
        if (string.length === 0)
            return '#000000';
        for (var i = 0; i < string.length; i++) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash;
        }
        var color = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 255;
            color += ('00' + value.toString(16)).substr(-2);
        }
        return color;
    };
    return VisConnectUtil;
}());
// Adapted from D3.js
function point(event) {
    var node = event.target;
    var svg = node.ownerSVGElement || node;
    var position = event instanceof MouseEvent ? event : event.touches[0];
    if (!position) {
        console.warn(event);
        return null;
    }
    if (svg.createSVGPoint) {
        var point_1 = svg.createSVGPoint();
        point_1.x = position.clientX;
        point_1.y = position.clientY;
        point_1 = point_1.matrixTransform(node.getScreenCTM().inverse());
        return { x: point_1.x, y: point_1.y };
    }
    var rect = node.getBoundingClientRect();
    return { x: position.clientX - rect.left - node.clientLeft, y: position.clientY - rect.top - node.clientTop };
}

var VisConnectUi = /** @class */ (function () {
    function VisConnectUi(visconnect, element) {
        this.visconnect = visconnect;
        this.element = element;
        this.cursorResetTimeout = 0;
        this.addTemplate();
        this.initiateCursors();
        this.visconnect.protocol.communication.onConnectionCallback = this.updateConnections.bind(this);
        this.updateConnections();
    }
    VisConnectUi.prototype.initiateCursors = function () {
        this.element.addEventListener('mousemove', this.mouseMoved.bind(this));
        var container = document.createElement('div');
        container.id = 'visconnect-cursors';
        document.body.appendChild(container);
    };
    VisConnectUi.prototype.getCursor = function (participant) {
        var elementId = "visconnect-cursor-" + participant;
        var cursor = document.getElementById(elementId);
        if (!cursor) {
            var cursors = document.getElementById('visconnect-cursors');
            cursor = document.createElement('div');
            cursor.style.background = VisConnectUtil.stringToHex(participant);
            cursor.style.width = '5px';
            cursor.style.height = '5px';
            cursor.style.position = 'absolute';
            cursor.style.borderRadius = '3px';
            cursor.style.pointerEvents = 'none';
            cursor.id = elementId;
            cursors.appendChild(cursor);
        }
        return cursor;
    };
    VisConnectUi.prototype.mouseMoved = function (originalEvent) {
        var event = originalEvent;
        var ownId = this.visconnect.protocol.communication.id;
        var collaborator = event['collaboratorId'];
        if (!collaborator || !ownId || ownId === collaborator) {
            return;
        }
        var cursor = this.getCursor(collaborator);
        cursor.style.left = event.clientX - 2 + "px";
        cursor.style.top = event.clientY - 2 + "px";
    };
    VisConnectUi.prototype.eventCancelled = function (event) {
        clearTimeout(this.cursorResetTimeout);
        var target = document.querySelector(event.target) || document.body;
        target.style.setProperty('cursor', 'not-allowed', 'important');
        this.cursorResetTimeout = window.setTimeout(function () {
            target.style.removeProperty('cursor');
        }, 50);
    };
    VisConnectUi.prototype.updateConnections = function () {
        var connections = this.visconnect.protocol.communication.getNumberOfConnections();
        var collaborators = connections - 1;
        if (collaborators > 0) {
            document.getElementById('visconnect-container').style.height = '70px';
            document.getElementById('visconnect-collab-notice').style.display = 'inline';
            document.getElementById('visconnect-collab-count').innerText = String(collaborators);
        }
        else {
            document.getElementById('visconnect-container').style.height = '50px';
            document.getElementById('visconnect-collab-notice').style.display = 'none';
        }
    };
    VisConnectUi.prototype.invite = function () {
        var communication = this.visconnect.protocol.communication;
        var leaderId = communication.leaderId;
        var logo = document.getElementById('visconnect-logo');
        if (!leaderId) {
            var errorElement_1 = document.getElementById('visconnect-not-ready');
            logo.style.display = 'none';
            errorElement_1.style.display = 'inline';
            setTimeout(function () {
                logo.style.display = 'block';
                errorElement_1.style.display = 'none';
            }, 1000);
            return;
        }
        var url = leaderId === communication.id ? location.href + '?visconnectid=' + leaderId : location.href;
        copyToClipboard(url);
        var inviteLinkCopied = document.getElementById('visconnect-link-copied');
        logo.style.display = 'none';
        inviteLinkCopied.style.display = 'inline';
        setTimeout(function () {
            logo.style.display = 'block';
            inviteLinkCopied.style.display = 'none';
        }, 2000);
    };
    VisConnectUi.prototype.addTemplate = function () {
        var container = document.createElement('div');
        container.id = 'visconnect-container';
        container.innerHTML = "\n<a id=\"visconnect-invite\">\n    <!--<svg id=\"visconnect-logo\" width=\"50\" aria-hidden=\"true\" focusable=\"false\" data-prefix=\"fas\" data-icon=\"link\" role=\"img\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\" class=\"svg-inline&#45;&#45;fa fa-link fa-w-16 fa-2x\"><path fill=\"#fff\" d=\"M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z\" class=\"\"></path></svg>-->\n    <svg id=\"visconnect-logo\" width=\"50\" version=\"1.1\" viewBox=\"0 0 55.55724 55.55724\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:cc=\"http://creativecommons.org/ns#\" xmlns:dc=\"http://purl.org/dc/elements/1.1/\" xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\">\n        <g transform=\"translate(-15.5 -20.905)\">\n            <path d=\"m49.236 53.67s-6.0878-19.94-22.215-6.3478c-10.3 8.6812-12.464 16.499-6.203 23.516 7.1388 8.0014 16.301 3.8953 25.966-10.387\" fill=\"none\" stroke=\"#36b\" stroke-width=\"3\"/>\n            <path d=\"m36.975 38.666s14.57-21.929 26.543-12.407c11.973 9.5217 1.9956 17.866-2.3081 22.362-6.4915 6.7806-14.408 11.996-20.629 5.0494-3.8794-4.3324-4.3277-7.6462-4.3277-7.6462\" fill=\"none\" stroke=\"#36b\" stroke-width=\"3\"/>\n            <path d=\"m61.313 40.246h-3.6787l1.936 4.6647c0.13471 0.32337-0.01958 0.68598-0.32747 0.82317l-1.7049 0.73499c-0.31772 0.13713-0.67422-0.01936-0.80906-0.33321l-1.8397-4.4295-3.0052 3.0575c-0.40047 0.40736-1.05 0.09324-1.05-0.44098v-14.738c0-0.56252 0.69082-0.83679 1.0499-0.44098l9.8624 10.034c0.39783 0.38345 0.10406 1.0682-0.43342 1.0682z\" fill=\"#fff\" stroke=\"#000\"/>\n            <path d=\"m37.341 62.869h-3.6787l1.936 4.6647c0.13472 0.32337-0.01958 0.68598-0.32747 0.82317l-1.7049 0.73499c-0.31772 0.13713-0.67422-0.01936-0.80906-0.33321l-1.8397-4.4295-3.0052 3.0575c-0.40047 0.40736-1.05 0.09324-1.05-0.44098v-14.738c0-0.56253 0.69082-0.83679 1.0499-0.44098l9.8624 10.034c0.39783 0.38345 0.10406 1.0682-0.43342 1.0682z\" fill=\"#fff\" stroke=\"#000\"/>\n        </g>\n    </svg>\n</a>\n<span id=\"visconnect-link-copied\">Invite Link Copied.</span>\n<span id=\"visconnect-not-ready\">Not yet ready...</span>\n<span id=\"visconnect-collab-notice\"><span id=\"visconnect-collab-count\"></span> connected</span>\n\n<style>\n#visconnect-container {\n    position: fixed;\n    right: 10px;\n    bottom: 100px;\n    background: rgba(120,120,120,0.5);\n    border: 1px solid #ccc;\n    border-radius: 10px;\n    width: 80px;\n    height: 50px;\n    padding: 10px;\n    transition: height 500ms;\n    color: #fff;\n    font-family: 'Times New Roman',Times,serif;\n}\n#visconnect-container, #visconnect-container * {\n    box-sizing: content-box;\n}\n#visconnect-logo {\n    padding-left: 15px;\n    display: block;\n    background: transparent;\n}\n#visconnect-invite:hover {\n    cursor: pointer;\n}\n#visconnect-invite:hover #visconnect-logo path {\n    stroke: #000;\n} \n#visconnect-link-copied, #visconnect-collab-notice, #visconnect-not-ready {\n    display: none;\n}\n#visconnect-collab-notice {\n    font-size: 11pt;\n    position: relative;\n    top: 5px;\n    display: inline-block;\n    width: 100px;\n}\n</style>";
        document.body.appendChild(container);
        document.getElementById('visconnect-invite').onclick = this.invite.bind(this);
    };
    return VisConnectUi;
}());
// From https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
var copyToClipboard = function (str) {
    var el = document.createElement('textarea');
    el.value = str;
    //console.log(str);
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    var selection = document.getSelection();
    var selected = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : false;
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    if (selected && selection) {
        selection.removeAllRanges();
        selection.addRange(selected);
    }
};

var VcListener = /** @class */ (function () {
    function VcListener(svg, hearEvent, customEvents, ignoreEvents) {
        this.svg = svg;
        this.hearEvent = hearEvent;
        this.customEvents = customEvents;
        this.ignoreEvents = ignoreEvents;
        this.addListenersToElementAndChildren(this.svg);
    }
    VcListener.prototype.addListenersToElementAndChildren = function (element) {
        this.addListenersToElement(element);
        for (var _i = 0, _a = element.children; _i < _a.length; _i++) {
            var child = _a[_i];
            this.addListenersToElementAndChildren(child);
        }
    };
    VcListener.prototype.addListenersToElement = function (element) {
        var _this = this;
        var boundCapture = this.captureEvent(element).bind(this);
        var custom = this.customEvents ? this.customEvents : [];
        var eventTypes = ['mousemove', 'mouseup', 'mousedown', 'touchmove', 'mouseenter', 'mouseout', 'mouseover',
            'mouseleave', 'click', 'dblclick', 'touchstart', 'touchend', 'selectstart', 'dragstart']
            .filter(function (type) { return !_this.ignoreEvents || (_this.ignoreEvents[0] !== 'all' && !_this.ignoreEvents.includes(type)); })
            .concat(custom)
            .concat(['brush-message']);
        for (var _i = 0, eventTypes_1 = eventTypes; _i < eventTypes_1.length; _i++) {
            var type = eventTypes_1[_i];
            element.addEventListener(type, boundCapture);
        }
        // Add listeners to future child elements.
        var appendBackup = element.appendChild;
        var insertBeforeBackup = element.insertBefore;
        var that = this;
        element.appendChild = function (newChild) {
            that.addListenersToElement(newChild);
            return appendBackup.call(this, newChild);
        };
        element.insertBefore = function (newChild, nextChild) {
            that.addListenersToElement(newChild);
            return insertBeforeBackup.call(this, newChild, nextChild);
        };
    };
    VcListener.prototype.captureEvent = function (element) {
        var _this = this;
        return function (e) {
            if (e.target !== element) {
                // Only capture for the correct target.
                return;
            }
            if (e['visconnect-received']) {
                // Don't broadcast events that have been received from other clients.
                return;
            }
            var eventObj = _this.getStrippedEvent(e);
            //this.connection.broadcastEvent(eventObj);
            _this.hearEvent(eventObj, e);
        };
    };
    VcListener.prototype.getStrippedEvent = function (e) {
        var obj = { type: '', target: '', targetType: '', touches: [], timeStamp: -1, collaboratorId: '' };
        for (var key in e) {
            var val = e[key];
            if (typeof val !== 'object' && typeof val !== 'function') {
                obj[key] = val;
            }
        }
        if (obj.clientX) {
            obj.clientX = obj.clientX + window.scrollX;
        }
        if (obj.x) {
            obj.x = obj.x + window.scrollX;
        }
        if (obj.clientY) {
            obj.clientY = obj.clientY + window.scrollY;
        }
        if (obj.y) {
            obj.y = obj.y + window.scrollY;
        }
        if (window.TouchEvent && e instanceof TouchEvent && e.touches && e.touches.length) {
            for (var _i = 0, _a = e.touches; _i < _a.length; _i++) {
                var touch = _a[_i];
                obj.touches.push({ clientX: touch.clientX + window.scrollX, clientY: touch.clientY + window.scrollX });
            }
        }
        if (e.detail) {
            obj.detail = e.detail;
        }
        var target = this.getElementSelector(e.target);
        if (target) {
            obj.target = target;
            obj.targetType = e.target.tagName.toLowerCase();
        }
        return obj;
    };
    VcListener.prototype.getElementSelector = function (element) {
        if (!element) {
            return null;
        }
        if (element === document.body) {
            return 'body';
        }
        var parent = element.parentNode;
        if (!parent) {
            return null;
        }
        var index = Array.from(parent.children).indexOf(element);
        var type = element.tagName;
        return this.getElementSelector(parent) + (" > " + type + ":nth-child(" + (index + 1) + ")");
    };
    return VcListener;
}());

function delayAddEventListener() {
    // The visualization's event listeners need to be called after VisConnect's event listeners.
    // For this reason, we delay calling event listeners that are added before VisConnect is started.
    Element.prototype['addEventListenerBackup'] = Element.prototype.addEventListener;
    Element.prototype.addEventListener = function (eventName, callback) {
        //console.log('doing a delayed execution on ', eventName, this);
        var that = this;
        setTimeout(function () {
            Element.prototype['addEventListenerBackup'].call(that, eventName, callback);
        }, 110);
    };
    // After the visualization code is run, reset the addEventListener function to its normal functionality, and start
    // VisConnect.
    return new Promise(function (resolve) {
        window.setTimeout(function () {
            Element.prototype.addEventListener = Element.prototype['addEventListenerBackup'];
            resolve();
        }, 100);
    });
}
function disableStopPropagation() {
    // Prevent d3 from blocking VisConnect and other code to have access to events.
    Event.prototype['stopImmediatePropagationBackup'] = Event.prototype.stopImmediatePropagation;
    Event.prototype.stopImmediatePropagation = function () { };
}
function stopPropagation(event) {
    event['stopImmediatePropagationBackup']();
    event.stopPropagation();
}
function recreateEvent(eventObject, target) {
    var targetSelector = eventObject.target;
    var e;
    if (eventObject.type.substr(0, 5) === 'touch') {
        try {
            e = document.createEvent('TouchEvent');
            e.initEvent(eventObject.type, true, false);
            for (var prop in eventObject) {
                if (prop !== 'isTrusted' && eventObject.hasOwnProperty(prop)) {
                    Object.defineProperty(e, prop, {
                        writable: true,
                        value: eventObject[prop],
                    });
                }
            }
        }
        catch (error) {
            // Touch probably not supported.
            var newType = 'mousemove';
            if (eventObject.type === 'touchstart') {
                newType = 'mousedown';
            }
            else if (eventObject.type === 'touchend') {
                newType = 'mouseup';
            }
            eventObject.type = newType;
            if (eventObject.touches[0]) {
                eventObject.clientX = eventObject.touches[0].clientX;
                eventObject.clientY = eventObject.touches[0].clientY;
            }
            e = new MouseEvent(eventObject.type, eventObject);
        }
        //e = new TouchEvent(eventObject.type, eventObject as any);
    }
    else if (eventObject.type.substr(0, 5) === 'mouse' || eventObject.type === 'click') {
        e = new MouseEvent(eventObject.type, eventObject);
    }
    else if (eventObject.type.substr(0, 4) === 'drag') {
        e = new DragEvent(eventObject.type, eventObject);
    }
    else {
        e = new Event(eventObject.type, eventObject);
    }
    if (eventObject.detail) {
        Object.defineProperty(e, 'detail', {
            writable: true,
            value: eventObject.detail,
        });
    }
    if (targetSelector) {
        var newTarget = document.querySelector(targetSelector);
        if (!newTarget) {
            console.error('element not found', targetSelector);
            //throw new Error('element not found');
            newTarget = document.body;
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
    return e;
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isFunction(x) {
    return typeof x === 'function';
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var _enable_super_gross_mode_that_will_cause_bad_things = false;
var config = {
    Promise: undefined,
    set useDeprecatedSynchronousErrorHandling(value) {
        if (value) {
            var error = /*@__PURE__*/ new Error();
            /*@__PURE__*/ console.warn('DEPRECATED! RxJS was set to use deprecated synchronous error handling behavior by code at: \n' + error.stack);
        }
        _enable_super_gross_mode_that_will_cause_bad_things = value;
    },
    get useDeprecatedSynchronousErrorHandling() {
        return _enable_super_gross_mode_that_will_cause_bad_things;
    },
};

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function hostReportError(err) {
    setTimeout(function () { throw err; }, 0);
}

/** PURE_IMPORTS_START _config,_util_hostReportError PURE_IMPORTS_END */
var empty = {
    closed: true,
    next: function (value) { },
    error: function (err) {
        if (config.useDeprecatedSynchronousErrorHandling) {
            throw err;
        }
        else {
            hostReportError(err);
        }
    },
    complete: function () { }
};

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var isArray = /*@__PURE__*/ (function () { return Array.isArray || (function (x) { return x && typeof x.length === 'number'; }); })();

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function isObject(x) {
    return x !== null && typeof x === 'object';
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var UnsubscriptionErrorImpl = /*@__PURE__*/ (function () {
    function UnsubscriptionErrorImpl(errors) {
        Error.call(this);
        this.message = errors ?
            errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ') : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
        return this;
    }
    UnsubscriptionErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return UnsubscriptionErrorImpl;
})();
var UnsubscriptionError = UnsubscriptionErrorImpl;

/** PURE_IMPORTS_START _util_isArray,_util_isObject,_util_isFunction,_util_UnsubscriptionError PURE_IMPORTS_END */
var Subscription = /*@__PURE__*/ (function () {
    function Subscription(unsubscribe) {
        this.closed = false;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (unsubscribe) {
            this._unsubscribe = unsubscribe;
        }
    }
    Subscription.prototype.unsubscribe = function () {
        var errors;
        if (this.closed) {
            return;
        }
        var _a = this, _parentOrParents = _a._parentOrParents, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
        this.closed = true;
        this._parentOrParents = null;
        this._subscriptions = null;
        if (_parentOrParents instanceof Subscription) {
            _parentOrParents.remove(this);
        }
        else if (_parentOrParents !== null) {
            for (var index = 0; index < _parentOrParents.length; ++index) {
                var parent_1 = _parentOrParents[index];
                parent_1.remove(this);
            }
        }
        if (isFunction(_unsubscribe)) {
            try {
                _unsubscribe.call(this);
            }
            catch (e) {
                errors = e instanceof UnsubscriptionError ? flattenUnsubscriptionErrors(e.errors) : [e];
            }
        }
        if (isArray(_subscriptions)) {
            var index = -1;
            var len = _subscriptions.length;
            while (++index < len) {
                var sub = _subscriptions[index];
                if (isObject(sub)) {
                    try {
                        sub.unsubscribe();
                    }
                    catch (e) {
                        errors = errors || [];
                        if (e instanceof UnsubscriptionError) {
                            errors = errors.concat(flattenUnsubscriptionErrors(e.errors));
                        }
                        else {
                            errors.push(e);
                        }
                    }
                }
            }
        }
        if (errors) {
            throw new UnsubscriptionError(errors);
        }
    };
    Subscription.prototype.add = function (teardown) {
        var subscription = teardown;
        if (!teardown) {
            return Subscription.EMPTY;
        }
        switch (typeof teardown) {
            case 'function':
                subscription = new Subscription(teardown);
            case 'object':
                if (subscription === this || subscription.closed || typeof subscription.unsubscribe !== 'function') {
                    return subscription;
                }
                else if (this.closed) {
                    subscription.unsubscribe();
                    return subscription;
                }
                else if (!(subscription instanceof Subscription)) {
                    var tmp = subscription;
                    subscription = new Subscription();
                    subscription._subscriptions = [tmp];
                }
                break;
            default: {
                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
            }
        }
        var _parentOrParents = subscription._parentOrParents;
        if (_parentOrParents === null) {
            subscription._parentOrParents = this;
        }
        else if (_parentOrParents instanceof Subscription) {
            if (_parentOrParents === this) {
                return subscription;
            }
            subscription._parentOrParents = [_parentOrParents, this];
        }
        else if (_parentOrParents.indexOf(this) === -1) {
            _parentOrParents.push(this);
        }
        else {
            return subscription;
        }
        var subscriptions = this._subscriptions;
        if (subscriptions === null) {
            this._subscriptions = [subscription];
        }
        else {
            subscriptions.push(subscription);
        }
        return subscription;
    };
    Subscription.prototype.remove = function (subscription) {
        var subscriptions = this._subscriptions;
        if (subscriptions) {
            var subscriptionIndex = subscriptions.indexOf(subscription);
            if (subscriptionIndex !== -1) {
                subscriptions.splice(subscriptionIndex, 1);
            }
        }
    };
    Subscription.EMPTY = (function (empty) {
        empty.closed = true;
        return empty;
    }(new Subscription()));
    return Subscription;
}());
function flattenUnsubscriptionErrors(errors) {
    return errors.reduce(function (errs, err) { return errs.concat((err instanceof UnsubscriptionError) ? err.errors : err); }, []);
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var rxSubscriber = /*@__PURE__*/ (function () {
    return typeof Symbol === 'function'
        ? /*@__PURE__*/ Symbol('rxSubscriber')
        : '@@rxSubscriber_' + /*@__PURE__*/ Math.random();
})();

/** PURE_IMPORTS_START tslib,_util_isFunction,_Observer,_Subscription,_internal_symbol_rxSubscriber,_config,_util_hostReportError PURE_IMPORTS_END */
var Subscriber = /*@__PURE__*/ (function (_super) {
    __extends(Subscriber, _super);
    function Subscriber(destinationOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this.syncErrorValue = null;
        _this.syncErrorThrown = false;
        _this.syncErrorThrowable = false;
        _this.isStopped = false;
        switch (arguments.length) {
            case 0:
                _this.destination = empty;
                break;
            case 1:
                if (!destinationOrNext) {
                    _this.destination = empty;
                    break;
                }
                if (typeof destinationOrNext === 'object') {
                    if (destinationOrNext instanceof Subscriber) {
                        _this.syncErrorThrowable = destinationOrNext.syncErrorThrowable;
                        _this.destination = destinationOrNext;
                        destinationOrNext.add(_this);
                    }
                    else {
                        _this.syncErrorThrowable = true;
                        _this.destination = new SafeSubscriber(_this, destinationOrNext);
                    }
                    break;
                }
            default:
                _this.syncErrorThrowable = true;
                _this.destination = new SafeSubscriber(_this, destinationOrNext, error, complete);
                break;
        }
        return _this;
    }
    Subscriber.prototype[rxSubscriber] = function () { return this; };
    Subscriber.create = function (next, error, complete) {
        var subscriber = new Subscriber(next, error, complete);
        subscriber.syncErrorThrowable = false;
        return subscriber;
    };
    Subscriber.prototype.next = function (value) {
        if (!this.isStopped) {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (!this.isStopped) {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        this.destination.error(err);
        this.unsubscribe();
    };
    Subscriber.prototype._complete = function () {
        this.destination.complete();
        this.unsubscribe();
    };
    Subscriber.prototype._unsubscribeAndRecycle = function () {
        var _parentOrParents = this._parentOrParents;
        this._parentOrParents = null;
        this.unsubscribe();
        this.closed = false;
        this.isStopped = false;
        this._parentOrParents = _parentOrParents;
        return this;
    };
    return Subscriber;
}(Subscription));
var SafeSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(_parentSubscriber, observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        _this._parentSubscriber = _parentSubscriber;
        var next;
        var context = _this;
        if (isFunction(observerOrNext)) {
            next = observerOrNext;
        }
        else if (observerOrNext) {
            next = observerOrNext.next;
            error = observerOrNext.error;
            complete = observerOrNext.complete;
            if (observerOrNext !== empty) {
                context = Object.create(observerOrNext);
                if (isFunction(context.unsubscribe)) {
                    _this.add(context.unsubscribe.bind(context));
                }
                context.unsubscribe = _this.unsubscribe.bind(_this);
            }
        }
        _this._context = context;
        _this._next = next;
        _this._error = error;
        _this._complete = complete;
        return _this;
    }
    SafeSubscriber.prototype.next = function (value) {
        if (!this.isStopped && this._next) {
            var _parentSubscriber = this._parentSubscriber;
            if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                this.__tryOrUnsub(this._next, value);
            }
            else if (this.__tryOrSetError(_parentSubscriber, this._next, value)) {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.error = function (err) {
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            var useDeprecatedSynchronousErrorHandling = config.useDeprecatedSynchronousErrorHandling;
            if (this._error) {
                if (!useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(this._error, err);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, this._error, err);
                    this.unsubscribe();
                }
            }
            else if (!_parentSubscriber.syncErrorThrowable) {
                this.unsubscribe();
                if (useDeprecatedSynchronousErrorHandling) {
                    throw err;
                }
                hostReportError(err);
            }
            else {
                if (useDeprecatedSynchronousErrorHandling) {
                    _parentSubscriber.syncErrorValue = err;
                    _parentSubscriber.syncErrorThrown = true;
                }
                else {
                    hostReportError(err);
                }
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.complete = function () {
        var _this = this;
        if (!this.isStopped) {
            var _parentSubscriber = this._parentSubscriber;
            if (this._complete) {
                var wrappedComplete = function () { return _this._complete.call(_this._context); };
                if (!config.useDeprecatedSynchronousErrorHandling || !_parentSubscriber.syncErrorThrowable) {
                    this.__tryOrUnsub(wrappedComplete);
                    this.unsubscribe();
                }
                else {
                    this.__tryOrSetError(_parentSubscriber, wrappedComplete);
                    this.unsubscribe();
                }
            }
            else {
                this.unsubscribe();
            }
        }
    };
    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            this.unsubscribe();
            if (config.useDeprecatedSynchronousErrorHandling) {
                throw err;
            }
            else {
                hostReportError(err);
            }
        }
    };
    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
        if (!config.useDeprecatedSynchronousErrorHandling) {
            throw new Error('bad call');
        }
        try {
            fn.call(this._context, value);
        }
        catch (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                parent.syncErrorValue = err;
                parent.syncErrorThrown = true;
                return true;
            }
            else {
                hostReportError(err);
                return true;
            }
        }
        return false;
    };
    SafeSubscriber.prototype._unsubscribe = function () {
        var _parentSubscriber = this._parentSubscriber;
        this._context = null;
        this._parentSubscriber = null;
        _parentSubscriber.unsubscribe();
    };
    return SafeSubscriber;
}(Subscriber));

/** PURE_IMPORTS_START _Subscriber PURE_IMPORTS_END */
function canReportError(observer) {
    while (observer) {
        var _a = observer, closed_1 = _a.closed, destination = _a.destination, isStopped = _a.isStopped;
        if (closed_1 || isStopped) {
            return false;
        }
        else if (destination && destination instanceof Subscriber) {
            observer = destination;
        }
        else {
            observer = null;
        }
    }
    return true;
}

/** PURE_IMPORTS_START _Subscriber,_symbol_rxSubscriber,_Observer PURE_IMPORTS_END */
function toSubscriber(nextOrObserver, error, complete) {
    if (nextOrObserver) {
        if (nextOrObserver instanceof Subscriber) {
            return nextOrObserver;
        }
        if (nextOrObserver[rxSubscriber]) {
            return nextOrObserver[rxSubscriber]();
        }
    }
    if (!nextOrObserver && !error && !complete) {
        return new Subscriber(empty);
    }
    return new Subscriber(nextOrObserver, error, complete);
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var observable = /*@__PURE__*/ (function () { return typeof Symbol === 'function' && Symbol.observable || '@@observable'; })();

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
function noop() { }

/** PURE_IMPORTS_START _noop PURE_IMPORTS_END */
function pipeFromArray(fns) {
    if (!fns) {
        return noop;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}

/** PURE_IMPORTS_START _util_canReportError,_util_toSubscriber,_symbol_observable,_util_pipe,_config PURE_IMPORTS_END */
var Observable = /*@__PURE__*/ (function () {
    function Observable(subscribe) {
        this._isScalar = false;
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var operator = this.operator;
        var sink = toSubscriber(observerOrNext, error, complete);
        if (operator) {
            sink.add(operator.call(sink, this.source));
        }
        else {
            sink.add(this.source || (config.useDeprecatedSynchronousErrorHandling && !sink.syncErrorThrowable) ?
                this._subscribe(sink) :
                this._trySubscribe(sink));
        }
        if (config.useDeprecatedSynchronousErrorHandling) {
            if (sink.syncErrorThrowable) {
                sink.syncErrorThrowable = false;
                if (sink.syncErrorThrown) {
                    throw sink.syncErrorValue;
                }
            }
        }
        return sink;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            if (config.useDeprecatedSynchronousErrorHandling) {
                sink.syncErrorThrown = true;
                sink.syncErrorValue = err;
            }
            if (canReportError(sink)) {
                sink.error(err);
            }
            else {
                console.warn(err);
            }
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscription;
            subscription = _this.subscribe(function (value) {
                try {
                    next(value);
                }
                catch (err) {
                    reject(err);
                    if (subscription) {
                        subscription.unsubscribe();
                    }
                }
            }, reject, resolve);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var source = this.source;
        return source && source.subscribe(subscriber);
    };
    Observable.prototype[observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        if (operations.length === 0) {
            return this;
        }
        return pipeFromArray(operations)(this);
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
function getPromiseCtor(promiseCtor) {
    if (!promiseCtor) {
        promiseCtor =  Promise;
    }
    if (!promiseCtor) {
        throw new Error('no Promise impl found');
    }
    return promiseCtor;
}

/** PURE_IMPORTS_START  PURE_IMPORTS_END */
var ObjectUnsubscribedErrorImpl = /*@__PURE__*/ (function () {
    function ObjectUnsubscribedErrorImpl() {
        Error.call(this);
        this.message = 'object unsubscribed';
        this.name = 'ObjectUnsubscribedError';
        return this;
    }
    ObjectUnsubscribedErrorImpl.prototype = /*@__PURE__*/ Object.create(Error.prototype);
    return ObjectUnsubscribedErrorImpl;
})();
var ObjectUnsubscribedError = ObjectUnsubscribedErrorImpl;

/** PURE_IMPORTS_START tslib,_Subscription PURE_IMPORTS_END */
var SubjectSubscription = /*@__PURE__*/ (function (_super) {
    __extends(SubjectSubscription, _super);
    function SubjectSubscription(subject, subscriber) {
        var _this = _super.call(this) || this;
        _this.subject = subject;
        _this.subscriber = subscriber;
        _this.closed = false;
        return _this;
    }
    SubjectSubscription.prototype.unsubscribe = function () {
        if (this.closed) {
            return;
        }
        this.closed = true;
        var subject = this.subject;
        var observers = subject.observers;
        this.subject = null;
        if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
            return;
        }
        var subscriberIndex = observers.indexOf(this.subscriber);
        if (subscriberIndex !== -1) {
            observers.splice(subscriberIndex, 1);
        }
    };
    return SubjectSubscription;
}(Subscription));

/** PURE_IMPORTS_START tslib,_Observable,_Subscriber,_Subscription,_util_ObjectUnsubscribedError,_SubjectSubscription,_internal_symbol_rxSubscriber PURE_IMPORTS_END */
var SubjectSubscriber = /*@__PURE__*/ (function (_super) {
    __extends(SubjectSubscriber, _super);
    function SubjectSubscriber(destination) {
        var _this = _super.call(this, destination) || this;
        _this.destination = destination;
        return _this;
    }
    return SubjectSubscriber;
}(Subscriber));
var Subject = /*@__PURE__*/ (function (_super) {
    __extends(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.observers = [];
        _this.closed = false;
        _this.isStopped = false;
        _this.hasError = false;
        _this.thrownError = null;
        return _this;
    }
    Subject.prototype[rxSubscriber] = function () {
        return new SubjectSubscriber(this);
    };
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype.next = function (value) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        if (!this.isStopped) {
            var observers = this.observers;
            var len = observers.length;
            var copy = observers.slice();
            for (var i = 0; i < len; i++) {
                copy[i].next(value);
            }
        }
    };
    Subject.prototype.error = function (err) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        this.hasError = true;
        this.thrownError = err;
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].error(err);
        }
        this.observers.length = 0;
    };
    Subject.prototype.complete = function () {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        this.isStopped = true;
        var observers = this.observers;
        var len = observers.length;
        var copy = observers.slice();
        for (var i = 0; i < len; i++) {
            copy[i].complete();
        }
        this.observers.length = 0;
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = true;
        this.closed = true;
        this.observers = null;
    };
    Subject.prototype._trySubscribe = function (subscriber) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else {
            return _super.prototype._trySubscribe.call(this, subscriber);
        }
    };
    Subject.prototype._subscribe = function (subscriber) {
        if (this.closed) {
            throw new ObjectUnsubscribedError();
        }
        else if (this.hasError) {
            subscriber.error(this.thrownError);
            return Subscription.EMPTY;
        }
        else if (this.isStopped) {
            subscriber.complete();
            return Subscription.EMPTY;
        }
        else {
            this.observers.push(subscriber);
            return new SubjectSubscription(this, subscriber);
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(Observable));
var AnonymousSubject = /*@__PURE__*/ (function (_super) {
    __extends(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        _this.source = source;
        return _this;
    }
    AnonymousSubject.prototype.next = function (value) {
        var destination = this.destination;
        if (destination && destination.next) {
            destination.next(value);
        }
    };
    AnonymousSubject.prototype.error = function (err) {
        var destination = this.destination;
        if (destination && destination.error) {
            this.destination.error(err);
        }
    };
    AnonymousSubject.prototype.complete = function () {
        var destination = this.destination;
        if (destination && destination.complete) {
            this.destination.complete();
        }
    };
    AnonymousSubject.prototype._subscribe = function (subscriber) {
        var source = this.source;
        if (source) {
            return this.source.subscribe(subscriber);
        }
        else {
            return Subscription.EMPTY;
        }
    };
    return AnonymousSubject;
}(Subject));

var PeerjsConnection = /** @class */ (function () {
    function PeerjsConnection(connection) {
        var _this = this;
        this.connection = connection;
        this.messages = new Subject();
        this.connection.on('data', function (message) {
            _this.receiveMessage(message);
        });
    }
    PeerjsConnection.prototype.send = function (message) {
        var _this = this;
        // The testdelay URL flag can be used to test bad network conditions.
        if (location.href.includes('testdelay')) {
            setTimeout(function () { return _this.connection.send(message); }, Math.round(Math.random() * 100));
        }
        else {
            this.connection.send(message);
        }
    };
    PeerjsConnection.prototype.getPeer = function () {
        return this.connection.peer;
    };
    PeerjsConnection.prototype.receiveMessage = function (message) {
        this.messages.next(message);
    };
    PeerjsConnection.prototype.open = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.connection.on('open', resolve);
        });
    };
    return PeerjsConnection;
}());

var PeerjsNetwork = /** @class */ (function () {
    function PeerjsNetwork() {
        this.onOpen = function () { return 0; };
    }
    PeerjsNetwork.prototype.init = function (id, onOpen, onConnection, onDisconnection) {
        this.onOpen = onOpen;
        this.peer = new Peer(id, {
            host: 'michaschwab.de',
            port: 9000,
            secure: true,
            path: '/visconnect',
            config: { 'iceServers': [
                    { urls: 'stun:stun.l.google.com:19302' },
                    {
                        'urls': 'turn:numb.viagenie.ca',
                        'credential': "a/j'/9CmxTCa",
                        'username': 'saffo.d@husky.neu.edu'
                    }
                ] }
        });
        if (this.peer._open) {
            this.onOpen(); // In case it was done too fast.
        }
        else {
            this.peer.on('open', this.onOpen);
        }
        this.peer.on('connection', function (connection) {
            console.log("connection!");
            onConnection(new PeerjsConnection(connection));
        });
        this.peer.on('disconnected', function () {
            onDisconnection();
        });
        window.addEventListener("beforeunload", function () { return onDisconnection(); });
    };
    PeerjsNetwork.prototype.getId = function () {
        return this.peer.id;
    };
    PeerjsNetwork.prototype.connect = function (peerId) {
        var _this = this;
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var conn, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conn = this.peer.connect(peerId);
                        connection = new PeerjsConnection(conn);
                        return [4 /*yield*/, connection.open()];
                    case 1:
                        _a.sent();
                        resolve(connection);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    return PeerjsNetwork;
}());

var VcCommunication = /** @class */ (function () {
    function VcCommunication(data) {
        this.connections = [];
        this.peers = [];
        this.onConnectionCallback = function () { };
        this.id = '';
        this.lastEventsMessageTime = -1;
        this.throttleTimeout = -1;
        this.leaderId = data.leaderId;
        this.id = data.ownId;
        this.onEventReceived = data.onEventReceived;
        this.onNewLockOwner = data.onNewLockOwner;
        this.getPastEvents = data.getPastEvents;
        this.onLockRequested = data.onLockRequested;
        this.onOpenCallback = data.onOpenCallback;
        this.peer = new PeerjsNetwork();
    }
    VcCommunication.prototype.init = function () {
        this.peer.init(this.id, this.onOpen.bind(this), this.onConnection.bind(this), this.onDisconnection.bind(this));
    };
    /**
     * Requests all clients to vote to agree that this client gets the lock on the element.
     */
    VcCommunication.prototype.requestLock = function (targetSelector) {
        if (!this.id) {
            return false;
        }
        if (!this.leaderConnection && this.id !== this.leaderId) {
            return false;
        }
        var msg = {
            type: VC_MESSAGE_TYPE.LOCK_REQUESTED,
            targetSelector: targetSelector,
            requester: this.id,
            sender: this.id,
        };
        if (this.id === this.leaderId) {
            // Ask itself, the leader, for permission.
            this.receiveMessage(msg);
        }
        else {
            // Ask the leader for permission.
            this.leaderConnection.send(msg);
        }
        return true;
    };
    /**
     * This message is sent by the leader to inform clients that an element's lock owner has changed.
     */
    VcCommunication.prototype.changeLockOwner = function (targetSelector, owner, seqNum) {
        var msg = {
            type: VC_MESSAGE_TYPE.LOCK_OWNER_CHANGED,
            targetSelector: targetSelector,
            owner: owner,
            sender: this.id,
            seqNum: seqNum
        };
        for (var _i = 0, _a = this.connections; _i < _a.length; _i++) {
            var conn = _a[_i];
            conn.send(msg);
        }
        this.receiveMessage(msg); // Tell itself that the lock owner has changed.
    };
    VcCommunication.prototype.getId = function () {
        return this.peer.getId();
    };
    VcCommunication.prototype.onOpen = function () {
        this.id = this.getId();
        if (!this.leaderId) {
            this.leaderId = this.id;
        }
        //console.log("originID", this.leaderId);
        //console.log("myID", this.id);
        this.connectToPeer(this.id);
        if (this.leaderId && this.leaderId !== this.id) {
            this.connectToPeer(this.leaderId);
        }
        this.onOpenCallback();
        this.onConnectionCallback();
    };
    VcCommunication.prototype.getNumberOfConnections = function () {
        return this.connections.length;
    };
    VcCommunication.prototype.onConnection = function (connection) {
        return __awaiter(this, void 0, void 0, function () {
            var peer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        peer = connection.getPeer();
                        this.peers.push(peer);
                        this.connections.push(connection);
                        //console.log("New incoming connection", this.peers, this.connections.length);
                        this.onConnectionCallback();
                        if (peer === this.leaderId) {
                            // This is in case this client is the leader.
                            this.leaderConnection = connection;
                        }
                        return [4 /*yield*/, connection.open()];
                    case 1:
                        _a.sent();
                        connection.messages.subscribe(this.receiveMessage.bind(this));
                        if (this.leaderId === this.id) {
                            this.sendNewConnection(connection);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    VcCommunication.prototype.onDisconnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.sendDisconnectMessage();
                return [2 /*return*/];
            });
        });
    };
    VcCommunication.prototype.connectToPeer = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, peer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.peer.connect(id)];
                    case 1:
                        connection = _a.sent();
                        this.connections.push(connection);
                        this.peers.push(id);
                        //console.log("New outgoing connection", this.peers, this.connections.length);
                        this.onConnectionCallback();
                        peer = connection.getPeer();
                        if (peer === this.leaderId) {
                            this.leaderConnection = connection;
                        }
                        connection.messages.subscribe(this.receiveMessage.bind(this));
                        return [2 /*return*/];
                }
            });
        });
    };
    VcCommunication.prototype.receiveMessage = function (data) {
        if (data.type === VC_MESSAGE_TYPE.NEW_CONNECTION) {
            this.receiveNewConnection(data);
        }
        else if (data.type === VC_MESSAGE_TYPE.EVENT) {
            var msg = data;
            this.onEventReceived(msg.data, msg.sender);
        }
        else if (data.type === VC_MESSAGE_TYPE.LOCK_REQUESTED) {
            var msg = data;
            this.onLockRequested(msg.targetSelector, msg.requester);
        }
        else if (data.type === VC_MESSAGE_TYPE.LOCK_OWNER_CHANGED) {
            var msg = data;
            this.onNewLockOwner(msg.targetSelector, msg.owner, msg.seqNum);
        }
        else if (data.type === VC_MESSAGE_TYPE.DISCONNECTION) {
            var msg = data;
            this.recieveDisconnectMessage(msg);
        }
    };
    VcCommunication.prototype.broadcastEvent = function (e) {
        if (!this.eventsMsg) {
            this.eventsMsg = {
                'type': VC_MESSAGE_TYPE.EVENT,
                'sender': this.id,
                data: [],
            };
        }
        this.eventsMsg.data.push(e);
        this.throttledSendEvents();
    };
    VcCommunication.prototype.throttledSendEvents = function () {
        var _this = this;
        if (!this.eventsMsg) {
            return;
        }
        var onSend = function () {
            if (!_this.eventsMsg) {
                return;
            }
            for (var _i = 0, _a = _this.connections; _i < _a.length; _i++) {
                var conn = _a[_i];
                conn.send(_this.eventsMsg);
            }
            _this.lastEventsMessageTime = Date.now();
            _this.eventsMsg = undefined;
            _this.throttleTimeout = -1;
        };
        window.requestAnimationFrame(onSend);
    };
    VcCommunication.prototype.sendNewConnection = function (conn) {
        //console.log("Sending new connection message");
        var decoratedMessage = {
            'type': VC_MESSAGE_TYPE.NEW_CONNECTION,
            'sender': this.id,
            'peers': this.peers,
            'eventsLedger': this.getPastEvents(),
        };
        conn.send(decoratedMessage);
    };
    VcCommunication.prototype.receiveNewConnection = function (data) {
        //console.log("New connection message", data);
        for (var i = 0; i < data.peers.length; i++) {
            if (this.peers.indexOf(data.peers[i]) === -1) {
                console.log("connecting to new peer", data.peers[i]);
                this.connectToPeer(data.peers[i]);
            }
        }
        this.onEventReceived(data.eventsLedger, data.sender, true);
    };
    VcCommunication.prototype.sendDisconnectMessage = function () {
        var decoratedMessage = {
            'type': VC_MESSAGE_TYPE.DISCONNECTION,
            'sender': this.id
        };
        for (var _i = 0, _a = this.connections; _i < _a.length; _i++) {
            var conn = _a[_i];
            conn.send(decoratedMessage);
        }
    };
    VcCommunication.prototype.recieveDisconnectMessage = function (msg) {
        console.log("Peer", msg.sender, "is disconnecting");
        for (var _i = 0, _a = this.connections; _i < _a.length; _i++) {
            var conn = _a[_i];
            //console.log('Requesting lock', msg);
            if (conn.getPeer() === msg.sender) {
                console.log("Removing peer and connection");
                this.peers.splice(this.peers.indexOf(msg.sender), 1);
                this.connections.splice(this.connections.indexOf(conn), 1);
            }
        }
        this.onConnectionCallback();
    };
    return VcCommunication;
}());
var VC_MESSAGE_TYPE;
(function (VC_MESSAGE_TYPE) {
    VC_MESSAGE_TYPE[VC_MESSAGE_TYPE["NEW_CONNECTION"] = 0] = "NEW_CONNECTION";
    VC_MESSAGE_TYPE[VC_MESSAGE_TYPE["EVENT"] = 1] = "EVENT";
    VC_MESSAGE_TYPE[VC_MESSAGE_TYPE["LOCK_REQUESTED"] = 2] = "LOCK_REQUESTED";
    VC_MESSAGE_TYPE[VC_MESSAGE_TYPE["LOCK_VOTE"] = 3] = "LOCK_VOTE";
    VC_MESSAGE_TYPE[VC_MESSAGE_TYPE["LOCK_OWNER_CHANGED"] = 4] = "LOCK_OWNER_CHANGED";
    VC_MESSAGE_TYPE[VC_MESSAGE_TYPE["DISCONNECTION"] = 5] = "DISCONNECTION";
})(VC_MESSAGE_TYPE || (VC_MESSAGE_TYPE = {}));

var VcProtocol = /** @class */ (function () {
    function VcProtocol(leaderId, ownId, executeEvent, cancelEvent, unsafeElements, MockCommunication) {
        this.leaderId = leaderId;
        this.ownId = ownId;
        this.executeEvent = executeEvent;
        this.cancelEvent = cancelEvent;
        this.unsafeElements = unsafeElements;
        this.ledgers = new Map();
        this.lockOwners = new Map();
        this.requestedLocks = new Set();
        this.heldEvents = new Map();
        this.heldRemoteEvents = new Map();
        this.collaboratorId = '';
        var Communication = MockCommunication ? MockCommunication : VcCommunication;
        this.communication = new Communication({
            leaderId: leaderId,
            ownId: ownId,
            onEventReceived: this.receiveRemoteEvents.bind(this),
            onNewLockOwner: this.lockOwnerChanged.bind(this),
            getPastEvents: this.getPastEvents.bind(this),
            onLockRequested: this.receiveLockRequest.bind(this),
            onOpenCallback: this.init.bind(this)
        });
        this.communication.init();
    }
    VcProtocol.prototype.init = function () {
        this.collaboratorId = this.communication.getId();
    };
    VcProtocol.prototype.getPastEvents = function () {
        var events = Array.from(this.ledgers.values()).reduce(function (a, b) { return a.concat(b); }, []);
        return events.sort(function (a, b) { return a.event.timeStamp - b.event.timeStamp; });
    };
    VcProtocol.prototype.localEvent = function (stripped) {
        var selector = stripped.target;
        stripped.collaboratorId = this.communication.getId();
        //console.log('local event on ', selector, this.lockOwners.get(selector), this.collaboratorId);
        // All clients are allowed to interact with the unsafe elements.
        var allAllowed = this.unsafeElements.includes(stripped.targetType) || this.unsafeElements.includes('*');
        var lockOwner = this.lockOwners.get(selector);
        if (allAllowed || (lockOwner && lockOwner === this.collaboratorId)) {
            var vcEvent = this.makeVcEvent(stripped);
            var success = this.addEventToLedger(vcEvent, this.collaboratorId);
            if (success) {
                this.communication.broadcastEvent(vcEvent);
            }
        }
        else if (lockOwner && lockOwner !== this.collaboratorId) {
            // Do nothing - do not execute the event.
            this.cancelEvent(stripped);
        }
        else {
            if (!this.heldEvents.has(selector)) {
                this.heldEvents.set(selector, []);
            }
            this.heldEvents.get(selector).push(stripped);
            //console.log('held', this.heldEvents.get(selector));
            this.requestLock(selector);
        }
    };
    VcProtocol.prototype.receiveRemoteEvents = function (events, sender, catchup) {
        if (catchup === void 0) { catchup = false; }
        for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
            var event = events_1[_i];
            var ledger = this.ledgers.get(event.event.target);
            var lastSeqNum = ledger && ledger.length ? ledger[ledger.length - 1].seqNum : -1;
            this.playHeldRemoteEvents(event.event.target, lastSeqNum);
            lastSeqNum = ledger && ledger.length ? ledger[ledger.length - 1].seqNum : -1;
            if (event.seqNum !== lastSeqNum + 1) {
                this.holdRemoteEvent(event);
            }
            else {
                var success = this.addEventToLedger(event, sender, catchup);
                if (!success && !this.lockOwners.has(event.event.target)) {
                    this.holdRemoteEvent(event);
                }
            }
        }
    };
    VcProtocol.prototype.holdRemoteEvent = function (event) {
        if (!this.heldRemoteEvents.has(event.event.target)) {
            this.heldRemoteEvents.set(event.event.target, []);
        }
        this.heldRemoteEvents.get(event.event.target).push(event);
        //console.log('adding event to held remote events on ', this.collaboratorId);
    };
    VcProtocol.prototype.receiveLockRequest = function (selector, requester) {
        console.error('Clients are not supposed to receive lock requests.');
    };
    VcProtocol.prototype.lockOwnerChanged = function (selector, owner, seqNum) {
        //console.log('Lock owner changed', selector, owner, this.collaboratorId, this.heldEvents.has(selector), this.heldEvents.get(selector));
        this.requestedLocks.delete(selector);
        if (!owner) {
            this.lockOwners.delete(selector);
            return;
        }
        this.lockOwners.set(selector, owner);
        if (owner === this.collaboratorId && this.heldEvents.has(selector)) {
            // Finally, trigger these held up events.
            var events = this.heldEvents.get(selector);
            //console.log('Triggering some held up events', events);
            for (var _i = 0, events_2 = events; _i < events_2.length; _i++) {
                var stripped = events_2[_i];
                if (this.canExecuteEvent(stripped, this.collaboratorId)) {
                    var vcEvent = this.makeVcEvent(stripped);
                    var success = this.addEventToLedger(vcEvent, this.collaboratorId);
                    if (success) {
                        this.communication.broadcastEvent(vcEvent);
                    }
                }
            }
            //this.heldEvents.delete(selector);
        }
        else if (this.heldRemoteEvents.has(selector)) {
            this.playHeldRemoteEvents(selector, seqNum);
        }
    };
    VcProtocol.prototype.playHeldRemoteEvents = function (selector, seqNum) {
        var held = this.heldRemoteEvents.get(selector);
        if (!held) {
            return;
        }
        var filtered = held.filter(function (e) { return e.seqNum >= seqNum; }).sort(function (a, b) { return a.seqNum - b.seqNum; });
        for (var _i = 0, filtered_1 = filtered; _i < filtered_1.length; _i++) {
            var event = filtered_1[_i];
            this.addEventToLedger(event, event.sender, false);
        }
        //this.heldRemoteEvents.delete(selector);
    };
    VcProtocol.prototype.requestLock = function (selector) {
        if (this.requestedLocks.has(selector)) {
            return;
        }
        //console.log('Requesting lock on ', selector);
        var success = this.communication.requestLock(selector);
        if (success) {
            this.requestedLocks.add(selector);
        }
    };
    VcProtocol.prototype.canExecuteEvent = function (stripped, sender, catchup) {
        if (catchup === void 0) { catchup = false; }
        var selector = stripped.target;
        var allAllowed = this.unsafeElements.includes(stripped.targetType) || this.unsafeElements.includes('*');
        // Skip ownership check for catchup events, and for background events.
        if (!catchup && !allAllowed) {
            var lockOwner = this.lockOwners.get(selector);
            if (!lockOwner) {
                return false;
            }
            else if (lockOwner !== sender) {
                console.error('Trying to execute event on element with different lock owner', selector, lockOwner, sender);
                return false;
            }
        }
        return true;
    };
    VcProtocol.prototype.makeVcEvent = function (stripped) {
        var ledger = this.ledgers.get(stripped.target);
        var seqNum = 0;
        if (ledger && ledger.length) {
            var lastEvent = ledger[ledger.length - 1];
            seqNum = lastEvent.seqNum + 1;
        }
        return {
            seqNum: seqNum,
            event: stripped,
            sender: this.collaboratorId
        };
    };
    VcProtocol.prototype.addEventToLedger = function (event, sender, catchup) {
        if (catchup === void 0) { catchup = false; }
        var stripped = event.event;
        var selector = stripped.target;
        if (!this.canExecuteEvent(stripped, sender, catchup)) {
            return false;
        }
        if (!this.ledgers.has(selector)) {
            this.ledgers.set(selector, []);
        }
        var ledger = this.ledgers.get(selector);
        var seqNum = 0;
        if (ledger.length) {
            var lastEvent = ledger[ledger.length - 1];
            seqNum = lastEvent.seqNum + 1;
        }
        if (event.seqNum === seqNum) {
            ledger.push(event);
            //console.log(seqNum, stripped.type);
            this.executeEvent(stripped);
            return true;
        }
        else {
            // The order is not right.
            //console.log('cant execute this', event.seqNum);
            return false;
        }
    };
    return VcProtocol;
}());

var LockService = /** @class */ (function () {
    function LockService(communication) {
        this.communication = communication;
        this.lockOwners = new Map();
        this.lockTimeouts = new Map();
        this.expireTimeoutMs = 1000;
    }
    LockService.prototype.requestLock = function (selector, client, seqNum) {
        if (this.lockOwners.has(selector)) {
            return;
        }
        this.lockOwners.set(selector, client);
        this.communication.changeLockOwner(selector, client, seqNum);
    };
    LockService.prototype.extendLock = function (selector) {
        // Delete any previous timeouts
        var prevTimeout = this.lockTimeouts.get(selector);
        if (prevTimeout) {
            clearTimeout(prevTimeout);
        }
        var timeout = setTimeout(this.expireLock(selector), this.expireTimeoutMs);
        this.lockTimeouts.set(selector, timeout);
    };
    LockService.prototype.expireLock = function (selector) {
        var _this = this;
        return function () {
            _this.lockOwners.delete(selector);
            _this.communication.changeLockOwner(selector, '', -1);
        };
    };
    return LockService;
}());

var VcLeaderProtocol = /** @class */ (function (_super) {
    __extends(VcLeaderProtocol, _super);
    function VcLeaderProtocol(leaderId, ownId, executeEvent, cancelEvent, unsafeElements, mockCommunication) {
        var _this = _super.call(this, leaderId, ownId, executeEvent, cancelEvent, unsafeElements, mockCommunication) || this;
        _this.leaderId = leaderId;
        _this.ownId = ownId;
        _this.executeEvent = executeEvent;
        _this.cancelEvent = cancelEvent;
        _this.unsafeElements = unsafeElements;
        _this.lockService = new LockService(_this.communication);
        return _this;
    }
    VcLeaderProtocol.prototype.receiveLockRequest = function (selector, requester) {
        var ledger = this.ledgers.get(selector);
        var seqNum = !ledger ? 0 : ledger[ledger.length - 1].seqNum + 1;
        this.lockService.requestLock(selector, requester, seqNum);
    };
    VcLeaderProtocol.prototype.addEventToLedger = function (event, sender) {
        var success = _super.prototype.addEventToLedger.call(this, event, sender);
        if (success) {
            this.lockService.extendLock(event.event.target);
        }
        return success;
    };
    return VcLeaderProtocol;
}(VcProtocol));

var Visconnect = /** @class */ (function () {
    function Visconnect(svg, ownId, leaderId, safeMode, customEvents, ignoreEvents) {
        if (safeMode === void 0) { safeMode = true; }
        this.svg = svg;
        this.safeMode = safeMode;
        this.onEventCancelled = function () { };
        var isLeader = leaderId === ownId;
        var Protocol = isLeader ? VcLeaderProtocol : VcProtocol;
        var unsafeElements = safeMode ? ['body', 'svg', 'g'] : ['*'];
        this.protocol = new Protocol(leaderId, ownId, this.executeEvent.bind(this), this.cancelEvent.bind(this), unsafeElements);
        this.listener = new VcListener(this.svg, this.localEvent.bind(this), customEvents, ignoreEvents);
    }
    Visconnect.prototype.localEvent = function (stripped, event) {
        stopPropagation(event);
        event.preventDefault();
        this.protocol.localEvent(stripped);
    };
    Visconnect.prototype.cancelEvent = function (event) {
        this.onEventCancelled(event);
    };
    Visconnect.prototype.executeEvent = function (stripped) {
        var event = recreateEvent(stripped, this.svg);
        //console.log('executing event', stripped, event);
        event['visconnect-received'] = true;
        event['collaboratorId'] = stripped.collaboratorId;
        event['collaboratorColor'] = VisConnectUtil.stringToHex(stripped.collaboratorId);
        event['isLocalEvent'] = stripped.collaboratorId === this.protocol.communication.getId();
        if (event.target) {
            event.target.dispatchEvent(event);
            if (event.type === 'click') {
                event.target.focus();
            }
        }
    };
    return Visconnect;
}());

var visconnect;
var visconnectUi;
var parts = window.location.href.match(/\?visconnectid=([a-z0-9\-]+)/);
var ownId = __spreadArrays(Array(10)).map(function (i) { return (~~(Math.random() * 36)).toString(36); }).join('');
var leaderId = parts ? parts[1] : ownId;
window.vc = {
    drag: VisConnectUtil.drag,
    brush: VisConnectUtil.brush,
    mouse: VisConnectUtil.mouse,
    lasso: VisConnectUtil.lasso,
    random: VisConnectUtil.random(leaderId)
};
console.log('init vislink');
disableStopPropagation();
delayAddEventListener().then(function () {
    var el;
    var elsWithAttribute = document.querySelectorAll('[collaboration]');
    var svg = document.getElementsByTagName('svg')[0];
    var safeMode = true;
    var customEvents = undefined;
    var ignoreEvents = undefined;
    if (elsWithAttribute.length) {
        el = elsWithAttribute[0];
        var val = el.getAttribute('collaboration');
        if (val && val === 'live') {
            safeMode = false;
        }
        var customEventsVal = el.getAttribute('custom-events');
        if (customEventsVal) {
            customEvents = customEventsVal.replace(/ /g, '').split(',');
        }
        var ignoreEventsVal = el.getAttribute('ignore-events');
        if (ignoreEventsVal) {
            ignoreEvents = ignoreEventsVal.replace(/ /g, '').split(',');
        }
    }
    else if (svg) {
        el = svg;
    }
    else {
        el = document.body;
    }
    console.log('start visconnect');
    visconnect = new Visconnect(el, ownId, leaderId, safeMode, customEvents, ignoreEvents);
    visconnectUi = new VisConnectUi(visconnect, el);
    visconnect.onEventCancelled = visconnectUi.eventCancelled.bind(visconnectUi);
});
