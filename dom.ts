export function delayAddEventListener() {
    // The visualization's event listeners need to be called after DESCVis' event listeners.
    // For this reason, we delay calling event listeners that are added before DESCVis is started.
    (Element as any).prototype['addEventListenerBackup'] = Element.prototype.addEventListener;
    Element.prototype.addEventListener = function(this: Element, eventName: string, callback: () => void) {
        console.log('doing a delayed execution on ', eventName);
        const that = this;
        setTimeout(function() {
            (Element as any).prototype['addEventListenerBackup'].call(that, eventName, callback);
        }, 100);
    } as any;

    // After the visualization code is run, reset the addEventListener function to its normal functionality, and start
    // DESCVis.
    return new Promise<void>(resolve => {
        window.setTimeout(() => {
            console.log('hi');
            Element.prototype.addEventListener = (Element as any).prototype['addEventListenerBackup'];
            resolve();
        }, 20);
    });
}