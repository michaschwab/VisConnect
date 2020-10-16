# VisConnect 

### Live collaboration for web based visualizations. Events, such as clicking, are synchronized across collaborators. For more information check out the website at [visconnect.us](https://visconnect.us).


----

## Installation

To use VisConnect, simply include the the script tag for VisConnect. 

```<script src="https://unpkg.com/visconnect@latest/visconnect-bundle.js"></script>```

## Basic Usage

After including the script tags in your HTML, VisConnect will automatically inject the collaboration interface. To start collaborating click the VisConnect logo on the bottom right and a custom link will be copied to your clipboard. Send this link to anyone you want and wait for them to join. Once connected all your interaction events one SVG elements should be synchronized! 
<p align="center">
<img src="https://i.imgur.com/LfjnzeO.gif"/>
</p>


## Advanced Usage

To enable VisConnect to work with as many use cases as possible we’ve included a number of optional settings and methods for developers to leverage.

### UI Synchronization 
To synchronize events on non-SVG (e.g. HTML UI) include the `collaboration` attribute in your Body tag.

```<body collaboration>```

[Example](https://visconnect.us/ff0f1abebb0a72520411940bf82cbedf/)

### Lock System Bypass
VisConnect uses a [distributed lock manager](https://en.wikipedia.org/wiki/Distributed_lock_manager) to ensure DOM elements can only be manipulated by one client at a time. To disable the lock manager, and allow all events to be synchronized as soon as they happen, set the `collaboration` attribute to `live`.

```<body collaboration='live'>```

### Ignoring Events 
By default, Visconnect listens to all standard JavaScript events. If you want to ignore particular events you can list them in the Body tag with the `ignore-events` attribute.

```<body ignore-events='mousedown, mouseup, mousemove'>```

### Custom Events 
VisConnect can even synchronize your custom events! Custom events can even send a payload over the network. To sync custom events add them to the Body tag with the `custom-events` attribute. 

```<body custom-events='myEvent'>```

```
const myEvent = new CustomEvent ('myEvent', { payload: data });

document.body.addEventListener('myEvent', (e) => { console.log(e.payload) });
```

[Example](https://visconnect.us/d29cd8bb5b596697d92f5da2e6d5c49c/)

### Collaborative Methods
Commonly used visualiation methods are not made with collaboration in mind and do not work well with VisConnect. VisConnect provides drop in replacements for several of these methods to improve compatibility. 

1. `vc.random()`: Seeded drop in replacement for Math.random() 
1. `vc.drag()`: Drop in replacement for d3.drag() [Example](https://visconnect.us/9129f44cea5aabd962b54e93b523e632/)
2. `vc.brush()`: Drop in replacement for d3.brush() [Example](https://visconnect.us/b2d66e94bf90016cb285ebc9515ebc0a/)
3. `vc.lasso()`: Custom lasso implmentation for VisConnect [Example](https://visconnect.us/994a1ab12de6fb4bf21ee5c7a2461466/)



