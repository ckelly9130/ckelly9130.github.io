/**
 * Created by Cameron on 2/9/2016.
 */

/*Global variables*/
var stage = document.getElementById('canvas');
stage.width = 800;
stage.height = 800;
var ctx = stage.getContext('2d');

var lives;
var score;
var player;
var missile;
var laser;
var invaders = [];
var inv_vx = 1;
var inv_vy = 15;
var inv_mode = 0;
var bunkers = [];
var ship;

var clipX;
//var clipY;

var rightDown = false;
var leftDown = false;

var playerImage, gameloop, loader;
var replay = false;
var numHit  = 0;
/*END GLOBAL*/

/* Load opening screen */
function init(){
    //Clear canvas
    ctx.clearRect(0,0,stage.wdith,stage.height);

    //Canvas bg
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,stage.width,stage.height);


    //Space invaders screen
    ctx.fillStyle = "#00FF00";
    ctx.font = GAME_BIG_FONT;
    ctx.textAlign = "center";
    ctx.fillText("Spaces Invaded", stage.width/2, stage.height/4);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = GAME_MED_FONT;
    ctx.fillText("Click to start.", stage.width/2, stage.height/2);

}

/*allow image time to load*/
function setImageReady()
{
    this.ready = true;
}


function onKeyDown(evt)
{
    //Right
    if(evt.keyCode == 39)   rightDown = true;
    //Left
    if(evt.keyCode == 37) leftDown = true;

    //Spacebar
    if(evt.keyCode == 32){
        if(missile.visible == false){
            missile.x = player.x + (player.w/2);
            missile.y = player.y;
            missile.visible = true;
            hit = false;
        }
    }
}

function onKeyUp(evt)
{
    if(evt.keyCode == 39)   rightDown = false;
    if(evt.keyCode == 37) leftDown = false;
}

/*Begin game*/
function startGame(){
    if(!replay) {
        playerImage = new Image();
        playerImage.happy = true;
        playerImage.ready = false;
        playerImage.onload = setImageReady;
        playerImage.src = SPRITE_PATH;
        loader = setInterval(load, FRAME_TIME);
        replay = true;
        lives = 4;
        score = 0;
        window.addEventListener('keydown',onKeyDown,true);
        window.addEventListener('keyup', onKeyUp, true);
    }
}

/*Loading screen*/
function load(){
    if(playerImage.ready)
    {
        if(gameloop)
            clearInterval(gameloop);

        inv_mode = 0;
        inv_vx = 1;

        invaders.length = 0;
        //bunkers.length = 0;


        player = ({x: stage.width/2, y: stage.height - CHAR_HEIGHT, w: CHAR_WIDTH, h: CHAR_HEIGHT, vx: 15});
        ship = ({x: stage.width - player.w, y:15, vx:-10, cx:585, visible: false,hit:false, mode:0, value:0});
        missile = ({x: 0, y: 0,w: 2, h: 20, vy: -40, visible: false});
        laser = ({x: 0, y: 0, w: 2, h: 20, vy:25, cx:650,visible: false});

        //initiate invaders
        var inv_clip_x =  325;
        var rowNum = 1;
        var rowPer = 4;
        var inv_x =  0;
        var inv_value = 40;

        for(var i = 0; i < 55; i++)
        {
            if(i%11 == 0 && i != 0){
                rowNum++;
                inv_x = 0;
                switch(rowNum){
                    case 2:
                        inv_value = 20;
                        inv_clip_x -= 130;
                        break;
                    case 4:
                        inv_value = 10;
                        inv_clip_x -= 130;
                        break;
                }
            }
            invaders.push({x: inv_x, y: (stage.height *((rowNum)/10)),cx: inv_clip_x, value: inv_value, hit: false, exploded: false});
            if(rowPer == 14)
                rowPer = 4;
            else    rowPer++;

            inv_x += 65;
        }
        //end invaders

        //initiate bunkers
        if(bunkers.length == 0)
        {
        var bunk_x = 0;
        for(i = 0; i < 4; i++) {
            var bunk_w = 22;
            bunk_x = stage.width * (i/4)+65;
            var bunk_y = stage.height -100;
            var x_offset = bunk_x;
            var y_offset = bunk_y;
            for(var j = 0; j < 5; j++)
            {
                /*|X|_|_|
                * |_| |_|*/
                if(j==1){
                    y_offset -= bunk_w;
                }

                /*|_|X|_|
                * |_| |_|*/
                if(j==2){
                    y_offset -= bunk_w;
                    x_offset += bunk_w;
                }

                /*|_|_|X|
                * |_| |_|*/
                if(j==3){
                    y_offset -= bunk_w;
                    x_offset += (2*bunk_w);
                }

                /*|_|_|_|
                * |_| |X|*/
                if(j==4){
                    x_offset += (2*bunk_w);
                }

                bunkers.push({condition: 3, x: x_offset, y: y_offset, w: bunk_w});

                x_offset = bunk_x;
                y_offset = bunk_y;
            }
        }
    }

        clipX = CHAR_SPRITE_START_X;


        if(loader)  clearInterval(loader);
        gameloop = setInterval(update,FRAME_TIME);
    }
}

function update(){
    //Draw
    //Clear stage

    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,stage.width,stage.height);

    //Draw game properties
    ctx.fillStyle = "#00FF00";
    ctx.font= GAME_SMALL_FONT;
    ctx.textAlign = "left";
    ctx.fillText("Lives: " + lives.toString(),15,15);

    ctx.textAlign = 'right';
    ctx.fillText("Score: " + score.toString().replace(/\B(?=(\d{3})+(?!\d))/g,","),stage.width-15,15);

    /*Draw player*/
    ctx.drawImage(playerImage,clipX,0,player.w,player.h,player.x,player.y,player.w,player.h);

    /*Draw enemy array*/
    for(var i = 0; i<invaders.length; i++)
    {
         ctx.drawImage(playerImage,invaders[i].cx,0,player.w,player.h,invaders[i].x,invaders[i].y,player.w,player.h);
    }

    /*Draw bunkers*/
    for(i = 0; i < bunkers.length; i++)
    {
        switch(bunkers[i].condition){
            case 3:
                ctx.fillStyle = "#00FF00";
                break;

            case 2:
                ctx.fillStyle = "#FFFF00";
                break;

            case 1:
                ctx.fillStyle = "#FF0000";
                break;

            default:
                ctx.fillStyle = "#000";
                break;
        }

        ctx.fillRect(bunkers[i].x,bunkers[i].y,bunkers[i].w,bunkers[i].w);
    }

    /*Spaceship*/
    if(ship.visible)
    {
        ctx.drawImage(playerImage,ship.cx,0,player.w,player.h,ship.x,ship.y,player.w,player.h);
    }

    /*Player projectile*/
    if(missile.visible)
    {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(missile.x, missile.y, missile.w, missile.h);
    }

    /*Enemy projectile*/
    if(laser.visible)
    {
        ctx.fillStyle = "#FFF";
        ctx.font = GAME_SMALL_FONT;
        if(Math.round(Math.random()))
            ctx.fillText("~",laser.x,laser.y);
        else
            ctx.fillText("|",laser.x,laser.y);
    }

    if(clipX == 455 && lives > 0)
        clipX = 390;

    if(lives <= 0)
            EndGame(false);
    else {
        UpdatePositions();
        CalculateCollisions();
        GenerateEnemyAttack();
    }
}


function UpdatePositions() {
    /*Player*/
    if (rightDown)   player.x += player.vx;
    if (leftDown) player.x -= player.vx;

    if (player.x + player.w > stage.width)
        player.x = stage.width - player.w;
    if (player.x < 0)
        player.x = 0;

    /*Invaders*/
    if ((invaders[10].x + inv_vx + player.w) > (stage.width) || invaders[0].x + inv_vx < 0) {
        inv_vx *= -1.1;
        for (var i = 0; i < invaders.length; i++) {
            invaders[i].x += inv_vx;
            invaders[i].y += inv_vy;
            if (inv_mode == 1 && invaders[i].hit == false) {
                invaders[i].cx += 65;
                ship.cx += 65;
            }
            else if (inv_mode == -1 && invaders[i].hit == false) {
                invaders[i].cx -= 65;
                ship.cx -= 65;
            }
        }
    }
    else {
        for (i = 0; i < invaders.length; i++) {
            invaders[i].x += inv_vx;
            if (inv_mode == 1 && invaders[i].hit == false)
                invaders[i].cx += 65;
            else if (inv_mode == -1 && invaders[i].hit == false)
                invaders[i].cx -= 65;
        }
    }


    if (inv_mode == 0)
        inv_mode = -1;
    else if (inv_mode == 1 || inv_mode == -1)
        inv_mode *= -1;

    for (i = 0; i < invaders.length; i++) {
        if (invaders[i].hit && invaders[i].exploded)
            invaders[i].cx = 715;
        else if (invaders[i].hit) {
            invaders[i].cx = 455;
            invaders[i].exploded = true;
        }
    }

    if(ship.visible){

        ship.x += ship.vx;
        switch(ship.mode){
            case 0,1:
                ship.cx = 585;
                break;
            case -1:
                ship.cx = 520;
                break;
        }
        if(ship.x <= 0 || ship.hit)
        {
            ship.visible = false;
            ship.hit = false;
           ship.value = 0;
        }
    }
    if(ship.mode == 0)
        ship.mode = -1;
    else{
        ship.mode *= -1;
    }

    /*Player projectile*/
     if (missile.visible) {
        missile.y += missile.vy;
        if (missile.y <= 0)
        {
            missile.x = 0;
            missile.y = 0;
            missile.visible = false;
        }
    }

    /*Enemy projectile*/
    if (laser.visible) {
        laser.y += laser.vy;
        if (laser.y >= stage.height)
        {
            laser.x = 0;
            laser.y = 0;
            laser.visible = false;
        }
    }
}

function CalculateCollisions(){
    for(var i = 0; i < bunkers.length; i++)
    {
        if(bunkers[i].x+bunkers[i].w > missile.x
            && bunkers[i].x < missile.x + bunkers[i].w
            && bunkers[i].y + bunkers[i].w > missile.y
            && bunkers[i].y < missile.y + bunkers[i].w
            && bunkers[i].condition > 0){
            missile.x = 0;
            missile.y = 0;
            missile.visible = false;
            bunkers[i].condition--;
        }
        else if(bunkers[i].x+bunkers[i].w > laser.x
            && bunkers[i].x < laser.x + bunkers[i].w
            && bunkers[i].y + bunkers[i].w > laser.y
            && bunkers[i].y < laser.y + bunkers[i].w
            && bunkers[i].condition > 0){
            laser.x = 0;
            laser.y = 0;
            laser.visible = false;
            bunkers[i].condition--;
        }
    }


    for(i=0; i < invaders.length; i++)
    {
          if(invaders[i].x + player.w > missile.x
            && invaders[i].x < missile.x + player.w/2
            && invaders[i].y + player.w > missile.y
            && invaders[i].y < missile.y + player.h
            && invaders[i].hit == false){
              missile.x = 0;
              missile.y = 0;
            invaders[i].hit = true;
            missile.visible = false;
            score += invaders[i].value;
            numHit++;
            break;
        }
          else if(invaders[i].y + player.h > stage.height && invaders[i].hit == false){
              EndGame(false);
          }
    }

    if(numHit == 55)
    {EndGame(true);}

    if(player.x+player.w > laser.x
        &&player.x < laser.x + player.w/2
        &&player.y + player.h-25 > laser.y
        &&player.y < laser.y + player.h){
        clipX = 455;
        laser.x = 0;
        laser.y = 0;
        laser.visible = false;
        ResetPlayer();
    }

    if(ship.x + player.w > missile.x
        && ship.x < missile.x + player.w/2
        && ship.y + player.h > missile.y
        && ship.y < missile.y + player.h
        && ship.visible && missile.visible)
    {
        ship.cx = 650;
        ship.hit = true;
        score += ship.value;
    }


}

function GenerateEnemyAttack(){
    var attackCol = Math.round(Math.random()*50);
    if(attackCol > 0 && attackCol < 10 && laser.visible == false)
    {
        var attackRow = Math.round(Math.random()*8);
        var index = attackRow * 11 + attackCol;
        laser.x = invaders[index].x+(player.w/2);
        laser.y = invaders[index].y;
        laser.visible = true;
    }

    else if(attackCol > 45 && attackCol <= 50 && ship.visible == false)
    {
        ship.visible = true;
        ship.x = stage.width - player.w;
        ship.value = 100 * Math.floor(Math.random()*25)+1;
    }
}

function ResetPlayer(){
    player = ({x: stage.width/2, y: stage.height - CHAR_HEIGHT, w: CHAR_WIDTH, h: CHAR_HEIGHT, vx: 15});
    lives--;
}

function EndGame(didWin){
    bunkers.length = 0;
    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,stage.width,stage.height);

    ctx.fillStyle = "#0F0";
    ctx.textAlign = "center";
    ctx.font = GAME_BIG_FONT;

    if(!didWin)
        ctx.fillText("You have been invaded!", stage.width / 2, stage.height / 8);
    else {
        ctx.fillText("Congratulations!", stage.width / 2, stage.height / 8 - 60);
        ctx.fillText("You got em'!!", stage.width/2, stage.height/8);
    }

    numHit = 0;
    ctx.font = GAME_MED_FONT;
    ctx.fillText("Score: " + score.toString().replace(/\B(?=(\d{3})+(?!\d))/g,","),stage.width/2,stage.height/4);

    ctx.font = GAME_SMALL_FONT;
    ctx.fillText("Click to play again.",stage.width/2,stage.height/2);
    clearInterval(gameloop);
    replay=false;

}