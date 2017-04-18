import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import '../imports/api/db.js';
import { UI_DB } from '../imports/api/db.js';

import './main.html';

var Engine = Matter.Engine,
    Events = Matter.Events,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Constraint = Matter.Constraint,
    Composites = Matter.Composites,
    Composite = Matter.Composite,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Bodies = Matter.Bodies,
    Common = Matter.Common,
    World = Matter.World;

var engine = Engine.create(),
    world = engine.world;

var render,
    mouse,
    paddleConstraint;

var leftGoal,
    rightGoal;






var REDPADDLE;
var BLUEPADDLE;
var redColor = "#BA0C00";
var redColorActive = "#FF3727";
var blueColor = "#00AEBA";
var blueColorActive = "#27EFFF";

var RED_SCORE = 0,
    BLUE_SCORE = 0;

var num_bluePlayers = 0,
    num_redPlayers = 0;








Template.game.rendered = function gameRendered() {
  engine.world.gravity.y = 0;

  // create renderer
  render = Render.create({
      element: $("#game-container").get(0),//document.body,
      engine: engine,
      options: {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight,
          showVelocity: true,
          wireframes: false
      }
  });

  Render.run(render);

  // create runner
  var runner = Runner.create();
  Runner.run(runner, engine);


  World.add(world, [
      // walls
      Bodies.rectangle(0, -10, render.options.width*2, 10, { isStatic: true, restitution: 1 }),
      Bodies.rectangle(0, render.options.height+5, render.options.width*2, 10, { isStatic: true, restitution: 1 }),
      //Bodies.rectangle(render.options.width+10, 0, 10, render.options.height*2, { isStatic: true }),
      //Bodies.rectangle(-10, 0, 10, render.options.height*2, { isStatic: true })
  ]);

  rightGoal = Bodies.rectangle(
    render.options.width-15, 
    0, 
    30, 
    render.options.height*2, 
    { 
      isStatic: true,
      isSensor: true,
      render: {
        strokeStyle: redColor,
        fillStyle: redColor,
        lineWidth: 1
      }
    }
  );
  
  leftGoal = Bodies.rectangle(
    15, 
    0, 
    30, 
    render.options.height*2, 
    { 
      isStatic: true,
      isSensor: true,
      render: {
        strokeStyle: blueColor,
        fillStyle: blueColor,
        lineWidth: 1
      }
    }
  );

  World.add(world, [rightGoal,leftGoal]);

  // add some bodies that to be attracted
  for (var i = 0; i < 2; i += 1) {
    var body = Bodies.polygon(
      Common.random(50, render.options.width-50), 
      Common.random(50, render.options.height-50),
      Common.random(10, 50),
      Common.random() > 0.9 ? Common.random(15, 25) : Common.random(5, 10),
      { restitution: 1, frictionAir: 0.0 }
    );

    Body.setVelocity( body, {x:getRandomArbitrary(-10,10), y:getRandomArbitrary(-2,2)} );

    World.add(world, body);
  }

  REDPADDLE = Bodies.rectangle(
      100, 
      render.options.height/2, 
      50, 
      150, 
      {
        render:{fillStyle:redColor},
        //isStatic: true,
        restitution: 1.2,
        frictionAir: 0.1
      }
    );

  BLUEPADDLE = Bodies.rectangle(
      render.options.width-100, 
      render.options.height/2, 
      50, 
      150, 
      {
        render:{fillStyle:blueColor},
        //isStatic: true,
        restitution: 1.2,
        frictionAir: 0.1
      }
    );

  World.add(world, REDPADDLE);
  World.add(world, BLUEPADDLE);

  // add mouse control
  mouse = Mouse.create(render.canvas),
  mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
          stiffness: 0.2,
          render: {
              visible: false
          }
      }
  });

  World.add(world, mouseConstraint);

  // keep the mouse in sync with rendering
  render.mouse = mouse;

  // fit the render viewport to the scene
  // Render.lookAt(render, {
  //     min: { x: 0, y: 50 },
  //     max: { x: 800, y: 600 }
  // });

  // context for MatterTools.Demo
  return {
      engine: engine,
      runner: runner,
      render: render,
      canvas: render.canvas,
      stop: function() {
          Matter.Render.stop(render);
          Matter.Runner.stop(runner);
      }
  };
};

Template.game.events({

});

function addARandomBall(){
  console.log("add a ball");
  var body = Bodies.polygon(
    Common.random(50, render.options.width-50), 
    Common.random(50, render.options.height-50),
    Common.random(10, 50),
    Common.random() > 0.9 ? Common.random(15, 25) : Common.random(5, 10),
    { restitution: 1, frictionAir: 0.0 }
  );

  Body.setVelocity( body, {x:getRandomArbitrary(-10,10), y:getRandomArbitrary(-2,2)} );

  World.add(world, body);
}

function getRandomArbitrary(min, max) {
  return (Math.random() * (max - min)) + min;
}

function triggerGoal(which){
  var obj = UI_DB.findOne( { "name":"score" } );
  if ( obj.red === undefined ){
    obj.red = 0;
  }
  if ( obj.blue === undefined ){
    obj.blue = 0;
  }

  if ( which === "blue" ){
    obj.blue += 1;
  }
  if ( which === "red" ){
    obj.red += 1;
  }

  Meteor.call( 'ui_db.update', obj );

  setTimeout( addARandomBall, 1000 );
}

Events.on(engine, 'collisionStart', function(event) {
  var pairs = event.pairs;
  
  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];

    if ( pair.bodyA === leftGoal || pair.bodyB === leftGoal ){
      pair.bodyB.render.fillStyle = blueColorActive;
      pair.bodyA.render.fillStyle = blueColorActive;
      triggerGoal("blue");
      if ( pair.bodyA != leftGoal ){
        World.remove( world, pair.bodyA );
      }
      else if ( pair.bodyB != leftGoal ){
        World.remove( world, pair.bodyB );
      }
    }
    else if ( pair.bodyA === rightGoal || pair.bodyB === rightGoal ){
      pair.bodyB.render.fillStyle = redColorActive;
      pair.bodyA.render.fillStyle = redColorActive;
      triggerGoal("red");
      if ( pair.bodyA != rightGoal ){
        World.remove( world, pair.bodyA );
      }
      else if ( pair.bodyB != rightGoal ){
        World.remove( world, pair.bodyB );
      }
    }
  }
});

Events.on(engine, 'collisionEnd', function(event) {
  var pairs = event.pairs;
  
  for (var i = 0, j = pairs.length; i != j; ++i) {
    var pair = pairs[i];

    if ( pair.bodyA === leftGoal || pair.bodyB === leftGoal ){
      pair.bodyB.render.fillStyle = blueColor;
      pair.bodyA.render.fillStyle = blueColor;
    }
    else if ( pair.bodyA === rightGoal || pair.bodyB === rightGoal ){
      pair.bodyB.render.fillStyle = redColor;
      pair.bodyA.render.fillStyle = redColor;
    }
  }
});

Events.on(engine, 'afterUpdate', function() {
  //console.log(REDPADDLE);
  // if (!mouse.position.x) {
  //   return;
  // }

  // smoothly move the attractor body towards the mouse
  Body.setPosition(REDPADDLE, {
      x: 100,
      y: REDPADDLE.position.y
  });
  Body.setAngle(REDPADDLE, 0);
  Body.setPosition(BLUEPADDLE, {
      x: render.options.width-100,
      y: BLUEPADDLE.position.y
  });
  Body.setAngle(BLUEPADDLE, 0);
});


window.addEventListener('devicemotion', function(event) {
  console.log(window.location.pathname);
  if ( window.location.pathname === "/red" ){
    if ( Math.abs(event.acceleration.z - obj.accz) > 1 ){
      $("#accz").html(Math.round(event.acceleration.z));
      var obj = UI_DB.findOne( {"name":"redPlayer"} );
      obj.accz = event.acceleration.z;
      Meteor.call('ui_db.update',obj);
    }
    
  }
  else if ( window.location.pathname === "/blue" ){
    if ( Math.abs(event.acceleration.z - obj.accz) > 1 ){
      $("#accz").html(Math.round(event.acceleration.z));
      var obj = UI_DB.findOne( {"name":"bluePlayer"} );
      obj.accz = event.acceleration.z;
      Meteor.call('ui_db.update',obj);
    }
  }
  
});

window.addEventListener("deviceorientation", handleOrientation, true);


function handleOrientation(event) {
  var absolute = event.absolute;
  var alpha    = event.alpha;
  var beta     = event.beta;
  var gamma    = event.gamma;

  // Do stuff with the new orientation data
  $("#ori-container").html(absolute, alpha, beta, gamma);
}


var shakeScene = function() {
  console.log("shake scene");
  console.log(Composite);
  var bodies = Composite.allBodies(world);

  for (var i = 0; i < bodies.length; i++) {
    var body = bodies[i];

    if (!body.isStatic) {
      var forceMagnitude = 0.02 * body.mass;

      Body.applyForce(body, body.position, { 
        x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]), 
        y: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1])
      });
    }
  }
};

window.addEventListener('keyup', function(e) {
    //console.log('keyup');
    //console.log(e);
    if ( e.key === "ArrowUp" ){
      Body.applyForce(REDPADDLE,
        REDPADDLE.position,
        {
          x:0,
          y:-0.5
        }
      );
    }
    else if ( e.key === "ArrowDown" ){
      Body.applyForce(REDPADDLE,
        REDPADDLE.position,
        {
          x:0,
          y:0.5
        }
      );
    }
    else if (e.key === "b" ){
      addARandomBall();
    }
    // if ( e.key === "t" ){
    //   triggerTemperatureAlert();
    // }
    // else if ( e.key === "s" ){
    //   stirPan();
    // }
    // else {
    //   activeEvent(e);
    // }
  });


Template.game.helpers({
  paddleHelper() {
    var obj = UI_DB.findOne( {"name":"redPlayer"} );
    if ( obj != undefined ){
      var z = obj.accz;
      z /= 100;
      z = Math.min(Math.max(z, -2), 2);
      if ( Math.abs(obj.accz) > 1 ){
        Body.applyForce(REDPADDLE,
          REDPADDLE.position,
          {
            x:0,
            y:z
          }
        );
      }
    }
    

    obj = UI_DB.findOne( {"name":"bluePlayer"} );
    if ( obj != undefined ){
      z = obj.accz;
      z /= 100;
      z = Math.min(Math.max(z, -2), 2);
      if ( Math.abs(obj.accz) > 1 ){
        Body.applyForce(BLUEPADDLE,
          BLUEPADDLE.position,
          {
            x:0,
            y:z
          }
        );
      }
    }
  }
  ,
  scoreHelper() {
    var obj = UI_DB.findOne( {"name":"score" } );
    if ( obj != undefined ){
      if ( obj.red != undefined && obj.blue != undefined ){
        //$("#score-container").html( obj.red + " - " + obj.blue );
        $(".redScore").html(obj.red);
        $(".blueScore").html(obj.blue);
      }
    }
  }
  ,
  triggerHelper() {
    var obj = UI_DB.findOne( {"name":"triggers" } );
    if ( obj != undefined ){
      if ( obj.addaball != undefined && obj.addaball === true ){
        addARandomBall();
        obj.addaball = false;
        Meteor.call('ui_db.update',obj);
      }
      if ( obj.shakescene != undefined && obj.shakescene === true ){
        shakeScene();
        obj.shakescene = false;
        Meteor.call('ui_db.update',obj);
      }
    }
  }
});




Template.welcome.events({
  'touchend #redTeam'(e,t) {
    e.preventDefault();
    window.location = "/red";
  },
  'click #redTeam'(e,t) {
    e.preventDefault();
    window.location = "/red";
  },
  'click #blueTeam'(e,t) {
    e.preventDefault();
    window.location = "/blue";
  },
  'touchend #blueTeam'(e,t) {
    e.preventDefault();
    window.location = "/blue";
  },

  'click #addaball'(e,t) {
    var obj = UI_DB.findOne({"name":"triggers"});
    if ( obj != undefined ){
      obj.addaball = true;
      Meteor.call('ui_db.update',obj);
    }
  },
  'touchend #addaball'(e,t) {
    var obj = UI_DB.findOne({"name":"triggers"});
    if ( obj != undefined ){
      obj.addaball = true;
      Meteor.call('ui_db.update',obj);
    }
  },

  'click #shakescene'(e,t) {
    var obj = UI_DB.findOne({"name":"triggers"});
    if ( obj != undefined ){
      obj.shakescene = true;
      Meteor.call('ui_db.update',obj);
    }
  },
  'touchend #shakescene'(e,t) {
    var obj = UI_DB.findOne({"name":"triggers"});
    if ( obj != undefined ){
      obj.shakescene = true;
      Meteor.call('ui_db.update',obj);
    }
  },
});





Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
  },
});










Router.route('/', function () {
  // render the Home template with a custom data context
  this.render('welcome', {data: {title: 'Maverick'}});
});
Router.route('/game');
Router.route('/red');
Router.route('/blue');
