import {DescUi} from "./ui";
import {DescVis} from "./descvis";
import {delayAddEventListener, disableStopPropagation} from "./dom";
var descUi;

console.log('init vislink');
disableStopPropagation();
delayAddEventListener().then(() => {
    let el: Element;

    const elsWithAttribute = document.querySelectorAll('[collaboration]');
    const svg = document.getElementsByTagName('svg')[0];

    if (elsWithAttribute.length) {
        el = elsWithAttribute[0];
    } else if (svg) {
        el = svg;
    } else {
        el = document.body;
    }

    console.log('start descvis');
    const descvis = new DescVis(el);
    descUi = new DescUi(descvis, el);
});
