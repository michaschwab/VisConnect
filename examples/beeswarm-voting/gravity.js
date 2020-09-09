const gravityForce = (function(centerPoints, height) {
    const force = (alpha) => {
        if(force.savedNodes && force.savedNodes.length) {
            for(const node of force.savedNodes) {
                force.applyGravityToNode(alpha, node);
            }
        }
    };

    force.applyGravityToNode = (alpha, node) => {
        node.lastPos = {x: node.x, y: node.y};

        const dragCoefficient = -.1;
        const drag = !node.gravitySpeed ? {x:0, y:0} : {
            x: node.gravitySpeed.x * dragCoefficient,
            y: node.gravitySpeed.y * dragCoefficient
        };
        node.x += drag.x;
        node.y += drag.y;
        node.gravitySpeed = {x: drag.x, y: drag.y};

        for(const centerPoint of centerPoints) {
            const difference = {
                x: centerPoint.x - node.x,
                y: centerPoint.y - node.y
            };
            const differenceLength = Math.sqrt(Math.pow(difference.x, 2) + Math.pow(difference.y, 2));

            const numberItems = 100;
            const boundaryRadius = Math.sqrt(numberItems) * height * 0.008;
            let speed = {x: 0, y: 0};

            if(differenceLength < boundaryRadius) {
                speed = {
                    x: difference.x * alpha * force.currentStrength / Math.pow(boundaryRadius, 3),
                    y: difference.y * alpha * force.currentStrength / Math.pow(boundaryRadius, 3),
                };
            } else {
                speed = {
                    x: difference.x / Math.pow(differenceLength, 3) * alpha * force.currentStrength,
                    y: difference.y / Math.pow(differenceLength, 3) * alpha * force.currentStrength
                };
            }

            node.x += speed.x;
            node.y += speed.y;

            node.gravitySpeed.x += speed.x;
            node.gravitySpeed.y += speed.y;
        }
    }

    force.savedNodes = [];
    force.currentStrength = 1;

    force.initialize = (nodes) => {
        if(!nodes || !nodes.length) {
            return;
        }
        force.savedNodes = nodes;
    };

    force.strength = (strength) => {
        force.currentStrength = strength;
        return force;
    };

    return force;
});
