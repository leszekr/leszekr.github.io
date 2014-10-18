/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var View = require('famous/core/View');
    var Surface = require('famous/core/Surface');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var ScrollSync = require('famous/inputs/ScrollSync');
    var TouchSync = require('famous/inputs/TouchSync');

    var PhysicsEngine = require('famous/physics/PhysicsEngine');
    var Body = require('famous/physics/bodies/Body');
    var Spring = require('famous/physics/forces/Spring');
    var RotationalDrag = require('famous/physics/forces/RotationalDrag');
    var Vector = require('famous/math/Vector');

    // create the main context
    var mainContext = Engine.createContext();
    mainContext.setPerspective(900);

    var background = new Surface({
        properties: {
            background: "#234"
        }
    });
    mainContext.add(background)

    var cube = new View();

    var engine = new PhysicsEngine;
    var body = new Body();
    var drag = new RotationalDrag({
        strength: 0.00001
    });
    var spring = new Spring({
        strength: 0.0001,
        anchor: [0, 0, 0]
    });
    engine.attach([drag, spring], body);
    engine.addBody(body);

    var scroll = new ScrollSync({
        scale: 0.1
    });
    var touch = new TouchSync({
        scale: 5
    });
    cube._eventInput.pipe(touch);

    function _handleTouch(e) {
        var force = new Vector(e.delta[1], -e.delta[0], 0);
        var rotation = body.orientation.inverse().rotateVector(force);
        body.setOrientation(body.orientation.add(rotation));
    }

    function _handleEnd(e) {
        console.log(e);
        var force = new Vector(100 * e.velocity[1], -100 * e.velocity[0], 0);
        var rotation = body.orientation.inverse().rotateVector(force);
        body.setOrientation(body.orientation.add(rotation));
    }
    scroll.on('update', _handleTouch.bind(this));
    touch.on('update', _handleTouch.bind(this));
    touch.on('end', _handleEnd.bind(this));

    cube._eventInput.on('click', function() {
        body.applyForce(new Vector(0, 0, -0.1));
    })

    scroll.on('end', function(e) {
        body.setAngularVelocity(new Vector(0, 0, 0));
    }.bind(this));

    var phi = 0,
        tau = 0;

    background.pipe(scroll);

    function makeFace(color, x, y, z, content) {
        var face = new Surface({
            size: [199, 199],
            content: content,
            // classes: ['backfaceVisibility'],
            properties: {
                background: 'rgba(0, 0, 0, 0.5)',
                lineHeight: '190px',
                textAlign: 'center',
                color: 'white',
                textShadow: '0 0 20px white',
                fontSize: '200px',
            }
        });
        var faceModifier = new Modifier({
            transform: Transform.translate(0, 0, 100)
        });
        var rotModifier = new Modifier({
            transform: Transform.rotate(Math.PI * x * 0.5, Math.PI * y * 0.5, Math.PI * z * 0.5)
        })
        face.pipe(scroll);
        cube.add(rotModifier).add(faceModifier).add(face);
        face.pipe(cube._eventInput);
    }

    makeFace('#0cf', 0, 0, 0, '&#x2680;');
    makeFace('#f0c', 2, 0, 0, '&#x2681;');
    makeFace('#0fc', 1, 0, 0, '&#x2682;');
    makeFace('#fc0', 1, 2, 0, '&#x2683;');
    makeFace('#c0f', 0, -1, 0, '&#x2684;');
    makeFace('#cf0', 0, 1, 2, '&#x2685;');

    var initialTime = Date.now();

    body.applyTorque(new Vector(0.0001, 0.0002, 0));
    var cubeModifier = new Modifier({
        origin: [0.5, 0.5],
        transform: function() {
            return body.getTransform();
        }
    });

    var linkSurface = new Surface({
        content: '<a href="http://nadsumatal.github.com">@nadsumatal</a>',
        size: [100, 30],
        properties: {
            color: 'white',
            background: 'rgba(0, 0, 0, 0.5)',
            textAlign: 'right',
            padding: '5px',
            font: '15px sans-serif'
        }
    });

    mainContext.add(cubeModifier).add(cube);

    mainContext.add(new Modifier({
        origin: [0, 0],
        align: [0, 0],
        transform: Transform.translate(0, 20, 0)
    })).add(linkSurface);
});