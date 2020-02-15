import {delayAddEventListener, disableStopPropagation} from "./dom";
import {DescUi} from "./ui";
import {DescVis} from "./descvis";
var descUi;

disableStopPropagation();
delayAddEventListener().then(() => {
//(function() {
    let el: Element;

    const elsWithAttribute = document.querySelectorAll('[collaboration]');
    const svg = document.getElementsByTagName('svg')[0];

    if(elsWithAttribute.length) {
        el = elsWithAttribute[0];
    } else if(svg) {
        el = svg;
    } else {
        el = document.body;
    }

    const descvis = new DescVis(el);
    descUi = new DescUi(descvis);
//})();
});
