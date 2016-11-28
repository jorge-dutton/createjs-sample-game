/**
 * Created by JorgeDutton on 24/11/2016.
 */
/*jslint unparam: true*/
/*global createjs: true,
 tick: true,
 document: true,
 window: true,
 Image: true,
 startGame: true,
 arriveToEdge: true,
 startWalking: true,
 keydown: true,
 keyup: true,
 getCoin: true,
 startWalkingNpc: true*/
var canvas,
    coins = [],
    bumpingPoints = [],
    keys = [],
    stage,
    imgMonsterARun,
    imgMonsterAIdle,
    screenWidth,
    screenHeight,
    numberOfImagesLoaded = 0,
    bmpAnimation,
    bmpAnimationIdle,
    spriteSheetNpc,
    bmpAnimationNpc,
    spriteSheetNpcIdle,
    bmpAnimationNpcIdle,
    spriteSheetRun,
    spriteSheetIdle,
    clearedSoundID = "Cleared",
    bumpSoundID = "Bump",
    coinSoundID = "Coin",
    f = window.requestAnimationFrame ||
        window.webkitRquestAnimationFrame ||
        window.mozRequestAnimarionFrame ||
        window.msRequestAnimationFrame ||
        window.onRequestAnimationFrame,
    KEYCODE_ENTER = 13,
    KEYCODE_SPACE = 32,
    KEYCODE_UP = 38,
    KEYCODE_DOWN = 40,
    KEYCODE_LEFT = 37,
    KEYCODE_RIGHT = 39,
    KEYCODE_W = 87,
    KEYCODE_A = 65,
    KEYCODE_D = 68,
    KEYCODE_S = 83,
    NPC_MOVES = [90, -90, 10, -10],
    target;

function handleImageLoad(e) {
    numberOfImagesLoaded += 1;
    // We're not starting until all images are loaded
    // otherwise you may start to draw without the resource
    // and rise an IVALID_STATE_ERROR (11) DOM Exception on
    // the drawImage method
    if (numberOfImagesLoaded === 2) {
        numberOfImagesLoaded = 0;
        startGame();
    }
}

function handleImageError(e) {
    console.log("Error loading image " + e.target.src);
}

function init() {

    canvas = document.getElementById("testCanvas");
    coins = [];
    bumpingPoints = [];

    /*
     STARS = new Image();
     STARS.onload = handleImageLoad;
     STARS.onerror = handleImageError;
     STARS.src = 'images/coins.png?v=4';
     */

    imgMonsterAIdle = new Image();
    imgMonsterAIdle.onload = handleImageLoad;
    imgMonsterAIdle.onerror = handleImageError;
    imgMonsterAIdle.src = "images/MonsterAIdle.png";


    imgMonsterARun = new Image();
    imgMonsterARun.onload = handleImageLoad;
    imgMonsterARun.onerror = handleImageError;
    imgMonsterARun.src = "images/MonsterARun.png";


    document.onkeydown = keydown;
    document.onkeyup = keyup;

    createjs.Sound.registerSound("audio/smb_stage_clear.wav", clearedSoundID);
    createjs.Sound.registerSound("audio/smb_bump.wav", bumpSoundID);
    createjs.Sound.registerSound('audio/smb_coin.wav', coinSoundID);
}

function keydown(event) {
    keys[event.keyCode] = true;
}

function keyup(event) {
    delete keys[event.keyCode];
}

function startGame() {

    var c;

    stage = new createjs.Stage(canvas);

    if (canvas) {
        screenWidth = canvas.width;
        screenHeight = canvas.height;
    }

    /*     coins   */
    for (c = 0; c < 10; c += 1) {
        target = stage.addChild(new createjs.Shape());
        target.graphics.beginFill("yellow").drawCircle(0, 0, 5);
        target.x = parseInt(Math.random() * canvas.width, 10);
        target.y = parseInt(Math.random() * canvas.height, 10);
        if (target.x > stage.canvas.width - 16) {
            target.x = stage.canvas.width + 5;
        } else if (target.x < 16) {
            target.x = 21;
        }

        if (target.y > stage.canvas.height - 32) {
            target.y = stage.canvas.height + 5;
        } else if (target.y < 32) {
            target.y = 37;
        }
        coins.push(target);
    }

    for (c = 0; c < 100; c += 1) {
        target = stage.addChild(new createjs.Shape());
        target.graphics.drawCircle(0, 0, 5);
        target.x = parseInt(Math.random() * canvas.width, 10);
        target.y = parseInt(Math.random() * canvas.height, 10);
        for (var i = 0; i < bumpingPoints.length; i += 1) {
            if (target.x === bumpingPoints[i].x ||
                target.y === bumpingPoints[i].y) {
                target.x = parseInt(Math.random() * canvas.width, 10);
                target.y = parseInt(Math.random() * canvas.height, 10);
            }
        }
        bumpingPoints.push(target);
    }

    /* NPC */
    spriteSheetNpc = new createjs.SpriteSheet({
        images: [imgMonsterARun],
        frames: {
            width: 64,
            height: 64,
            regX: 32,
            regY: 32,
            count: 10
        },
        animations: {
            walkNpc: [0, 9, 'walkNpc', 0.1]
        }
    });

    bmpAnimationNpc = new createjs.Sprite(spriteSheetNpc);
    bmpAnimationNpc.shadow = new createjs.Shadow("#454", 0, 5, 4);
    bmpAnimationNpc.name = "monsterNpc";
    bmpAnimationNpc.direction = NPC_MOVES[Math.floor(Math.random() * NPC_MOVES.length)];
    bmpAnimationNpc.vX = 4;
    bmpAnimationNpc.vY = 4;
    bmpAnimationNpc.y = 300;
    bmpAnimationNpc.x = 500;

    bmpAnimationNpc.gotoAndPlay('walkNpc');
    stage.addChild(bmpAnimationNpc);


    /* player animations */
    spriteSheetRun = new createjs.SpriteSheet({
        images: [imgMonsterARun],
        frames: {
            width: 64,
            height: 64,
            regX: 32,
            regY: 32,
            count: 10
        },
        animations: {
            walk: [0, 9, 'walk', 0.25]
        }
    });

    spriteSheetIdle = new createjs.SpriteSheet({
        images: [imgMonsterAIdle],
        frames: {
            width: 64,
            height: 64,
            regX: 32,
            regY: 32,
            count: 11
        },
        animations: {
            idle: [0, 10, 'idle', 0.25]
        }
    });


    bmpAnimationIdle = new createjs.Sprite(spriteSheetIdle, "idle");
    bmpAnimationIdle.shadow = new createjs.Shadow("#454", 0, 5, 4);
    bmpAnimationIdle.name = "monsteridle1";
    bmpAnimationIdle.x = 200;
    bmpAnimationIdle.y = 200;

    bmpAnimationIdle.gotoAndPlay("idle");

    stage.addChild(bmpAnimationIdle);


    bmpAnimation = new createjs.Sprite(spriteSheetRun);
    bmpAnimation.shadow = new createjs.Shadow("#454", 0, 5, 4);
    bmpAnimation.name = "monster1";
    bmpAnimation.direction = 90;
    bmpAnimation.vX = 4;
    bmpAnimation.vY = 4;
    bmpAnimation.x = 16;
    bmpAnimation.y = 32;

    bmpAnimation.gotoAndPlay("walk");

    stage.addChild(bmpAnimation);

    createjs.Ticker.addEventListener("tick", npcTick);
    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.useRAF = true;

}
function npcTick(event) {
    //bmpAnimationNpc.direction = NPC_MOVES[Math.floor(Math.random() * NPC_MOVES.length)];


    if (getCoinNpc()) {
        bmpAnimationNpc.direction = NPC_MOVES[Math.floor(Math.random() * NPC_MOVES.length)];
        if (bmpAnimationNpc.direction === 90) {
            bmpAnimationNpc.scaleX = -1;
        } else {
            bmpAnimationNpc.scaleX = 1;
        }
        startWalkingNpc(bmpAnimationNpc, 'walkNpc', bmpAnimationNpc.direction, bmpAnimationNpc.scaleX);
    }
    npcCollision();
    if (bumpCollision()) {
        bmpAnimationNpc.direction = NPC_MOVES[Math.floor(Math.random() * NPC_MOVES.length)];
        if (bmpAnimationNpc.direction === 90) {
            bmpAnimationNpc.scaleX = -1;
        } else {
            bmpAnimationNpc.scaleX = 1;
        }
        startWalkingNpc(bmpAnimationNpc, 'walkNpc', bmpAnimationNpc.direction, bmpAnimationNpc.scaleX);
    }

    if (bmpAnimationNpc.x >= stage.canvas.width - 16) {
        bmpAnimationNpc.direction = -90;
        bmpAnimationNpc.scaleX = 1;
        startWalkingNpc(bmpAnimationNpc, 'walkNpc', bmpAnimationNpc.direction, bmpAnimationNpc.scaleX);
    }
    if (bmpAnimationNpc.x < 16) {
        bmpAnimationNpc.direction = 90;
        bmpAnimationNpc.scaleX = -1;
        startWalkingNpc(bmpAnimationNpc, 'walkNpc', bmpAnimationNpc.direction, bmpAnimationNpc.scaleX);
    }
    if (bmpAnimationNpc.y >= stage.canvas.height - 32) {

        bmpAnimationNpc.direction = -10;
        bmpAnimationNpc.scaleX = 1;
        startWalkingNpc(bmpAnimationNpc, 'walkNpc', bmpAnimationNpc.direction, bmpAnimationNpc.scaleX);
    }
    if (bmpAnimationNpc.y <= 32) {

        bmpAnimationNpc.direction = 10;
        bmpAnimationNpc.scaleX = -1;
        startWalkingNpc(bmpAnimationNpc, 'walkNpc', bmpAnimationNpc.direction, bmpAnimationNpc.scaleX);
    }

    if (bmpAnimationNpc.direction === 90) {
        bmpAnimationNpc.x += bmpAnimationNpc.vX;
    }
    if (bmpAnimationNpc.direction === -90) {
        bmpAnimationNpc.x -= bmpAnimationNpc.vX;
    }
    if (bmpAnimationNpc.direction === 10) {
        bmpAnimationNpc.y = bmpAnimationNpc.y + bmpAnimationNpc.vY;
    }
    if (bmpAnimationNpc.direction === -10) {
          bmpAnimationNpc.y = bmpAnimationNpc.y - bmpAnimationNpc.vY;
    }

    stage.update();


}

function tick(event) {


    if (keys[KEYCODE_A]) {
        if (bmpAnimation.x < 16) {
            arriveToEdge();
            return;
        }
        stage.removeChild(bmpAnimationIdle);
        startWalking(bmpAnimation, 'walk', -90, 1);
        bmpAnimation.x -= bmpAnimation.vX;
        getCoin();

    } else if (keys[KEYCODE_D]) {
        if (bmpAnimation.x >= stage.canvas.width - 16) {
            arriveToEdge();
            return;
        }
        stage.removeChild(bmpAnimationIdle);
        startWalking(bmpAnimation, 'walk', 90, -1);
        bmpAnimation.x += bmpAnimation.vX;
        getCoin();

    } else if (keys[KEYCODE_W]) {

        if (bmpAnimation.y <= 32) {
            arriveToEdge();
            return;
        }
        stage.removeChild(bmpAnimationIdle);
        startWalking(bmpAnimation, 'walk', -0);
        bmpAnimation.y -= bmpAnimation.vY;
        getCoin();

    } else if (keys[KEYCODE_S]) {

        if (bmpAnimation.y >= screenHeight - 32) {
            arriveToEdge();
            return;
        }
        stage.removeChild(bmpAnimationIdle);
        startWalking(bmpAnimation, 'walk', 0);
        bmpAnimation.y += bmpAnimation.vY;
        getCoin();

    } else {

        bmpAnimation.gotoAndStop("walk");
        stage.removeChild(bmpAnimation);
        bmpAnimationIdle.x = bmpAnimation.x;
        bmpAnimationIdle.y = bmpAnimation.y;

        bmpAnimationIdle.play("idle");
        stage.addChild(bmpAnimationIdle);
    }

    stage.update();

}

function reset() {
    stage.removeAllChildren();
    createjs.Ticker.removeAllEventListeners();
    stage.update();
}

function startWalking(animation, action, direction, scalex) {
    animation.direction = direction;
    animation.scaleX = scalex || 1;
    animation.play(action);
    stage.addChild(animation);
}

function startWalkingNpc(animation, action, direction, scalex) {
    animation.stop(action);
    animation.direction = direction;
    animation.scaleX = scalex || 1;
    animation.play(action);
}

function arriveToEdge() {
    bmpAnimation.gotoAndStop("walk");
    stage.removeChild(bmpAnimation);
    bmpAnimationIdle.play("idle");
    stage.addChild(bmpAnimationIdle);
}

function getCoin() {
    var i, pt;
    for (i = 0; i < coins.length; i += 1) {
        pt = coins[i].globalToLocal(bmpAnimation.x, bmpAnimation.y);
        if (bmpAnimation.hitTest(pt.x, pt.y)) {
            createjs.Sound.play(coinSoundID);
            stage.removeChild(coins[i]);
            coins.splice(i, 1);
        }
    }
    if (coins.length == 0) {
        createjs.Sound.play(clearedSoundID);
    }
}

function bumpCollision() {
    var i, pt;
    for (i = 0; i < bumpingPoints.length; i += 1) {
        pt = bumpingPoints[i].globalToLocal(bmpAnimationNpc.x, bmpAnimationNpc.y);
        if (bmpAnimationNpc.hitTest(pt.x, pt.y)) {
            return true;
        }
    }
    return false;
}

function getCoinNpc() {
    var i, pt;
    for (i = 0; i < coins.length; i += 1) {
        pt = coins[i].globalToLocal(bmpAnimationNpc.x, bmpAnimationNpc.y);
        if (bmpAnimationNpc.hitTest(pt.x, pt.y)) {
            createjs.Sound.play(bumpSoundID);
            stage.removeChild(coins[i]);
            coins.splice(i, 1);
            return true;
        }
    }
    return false;
}

function npcCollision() {
    var i, pt;
    pt = bmpAnimation.globalToLocal(bmpAnimationNpc.x, bmpAnimationNpc.y);
    if (bmpAnimationNpc.hitTest(pt.x, pt.y)) {
        console.log("GAME OVER");
        init();
    }
}