/**
 * Created by Cameron on 4/13/2016.
 */

var canvas;
var ctx;
var mapTxtArea;

var startSelected;
var endSelected;
var simStarted;
var isPaused;

var rate;
var heuristic;
var algorithm;

var openList = [];
var closedList = [];
var snode;
var enode;

var steps;
var distance;

var nodes = [];

function init(){

    canvas = document.getElementById('myCanvas');
    canvas.width = 600;
    canvas.height = 600;
    canvas.addEventListener('click', function(evt){
        var mousePos = getMousePos(evt);
        ClickedOnNode(mousePos);
    });

    mapTxtArea = document.getElementById('fileInput');

    startSelected = false;
    endSelected = false;
    simStarted = false;
    isPaused = false;

    rate = 1;
    heuristic = "manhattan";
    algorithm = "a*";
    snode = null;
    enode = null;

    steps = 0;
    distance = 0;

    ctx = document.getElementById('myCanvas').getContext('2d');
    ctx.fillStyle = "#00AAFF";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.font = "24px Sans-Serif";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.fillText("Choose a map option from the right.", canvas.width/2, canvas.height/2)

    //ctx.closePath();
}



function Start(){
    var btnType = document.getElementById('start');
    if(btnType.innerText == 'Start' && startSelected && endSelected) {
        isPaused = false;
        if(!simStarted){
            FindStartStop();
            BeginSimulation();
        }
        else
            PickNext();
        btnType.innerText = 'Pause';
    }
    else if(btnType.innerText == "Step" && startSelected && endSelected){
        if(simStarted)
            PickNext();
        else {
            FindStartStop();
            BeginSimulation();
        }
    }
    else if(btnType.innerText == "Pause" && startSelected && endSelected && simStarted && rate > 0){
        isPaused = true;
        btnType.innerText = "Start";
    }
    else if(btnType.innerText == "Reset"){
        location.assign('./');
    }
}

function FindStartStop(){
    for(var i = 0; i < nodes.length; i++)
    {
        for(var j = 0; j < nodes[i].length; j++){
            if(nodes[i][j].isStart){
                snode = nodes[i][j];
            }
            else if(nodes[i][j].isEnd){
                enode = nodes[i][j];
            }
        }
        if(snode != null && enode != null)
            break;

    }
    if(snode == null || enode == null){
        alert("Error: Could not find starting and ending nodes.");
        return;
    }
}

function BeginSimulation(){
    simStarted = true;

    openList.push(snode);
    MarkOpen(snode);
    FindNeighbors(openList.shift());
}

function EndSimulation(node){
        distance = node.g;
    while(node.parent != null){
        steps++;
        ctx.strokeStyle = "#999900";
        ctx.strokeRect(node.x,node.y,node.ndW,node.ndH);
        node = node.parent;
    }
    document.getElementById('start').innerText = "Reset";
    document.getElementById('results').innerHTML = "<strong>Total Steps: " +steps+"<br/>Total Distance: "+distance+"</strong>";
    Show('results');
}

function CheckNeighbor(parentNode, childNode){
    if(childNode && !InOpenList(childNode) && !InClosedList(childNode) && !childNode.isWall){
        if(InOpenList(childNode)){
            var testG;
            if(parentNode.row != childNode.row && parentNode.col != childNode.col)
            {
                testG = parentNode.g + 14;
            }
            else{
                testG = parentNode.g + 10;
            }

            if(testG < childNode.g){
                childNode.parent = parentNode;
            }
        }
        else if(!InClosedList(childNode) && !childNode.isWall) {
            childNode.parent = parentNode;
            openList.push(childNode);
            MarkOpen(childNode);
            CalculateF(childNode);
        }
    }


}

function FindNeighbors(node){
    MarkVisited(node);
    closedList.push(node);

    if(node.isEnd){
        EndSimulation(node);
        return;
    }

    if(node.col + 1 >= nodes[node.row].length)
        var right = null;
    else {
        right = nodes[node.row][node.col + 1];
        CheckNeighbor(node, right);
    }

    if(node.row+1 >= nodes.length || node.col+1 >= nodes[node.row].length)
        var bottom_right = null;
    else {
        bottom_right = nodes[node.row + 1][node.col + 1];
        CheckNeighbor(node, bottom_right);
    }

    if(node.row + 1 >= nodes.length)
        var bottom = null;
    else {
        bottom = nodes[node.row + 1][node.col];
        CheckNeighbor(node, bottom);
    }

    if(node.row + 1 >= nodes.length || node.col-1 < 0)
        var bottom_left = null;
    else {
        bottom_left = nodes[node.row + 1][node.col - 1];
        CheckNeighbor(node, bottom_left);
    }

    if(node.col - 1 < 0)
        var left = null;
    else {
        left = nodes[node.row][node.col - 1];
        CheckNeighbor(node, left);
    }

    if(node.row - 1 < 0 || node.col -1 < 0)
        var top_left = null;
    else {
        top_left = nodes[node.row - 1][node.col - 1];
        CheckNeighbor(node, top_left);
    }

    if(node.row - 1 < 0)
        var top = null;
    else {
        top = nodes[node.row - 1][node.col];
        CheckNeighbor(node, top);
    }


    if(node.row-1 < 0 || node.col + 1 >= nodes[node.row].length)
        var top_right = null;
    else {
        top_right = nodes[node.row - 1][node.col + 1];
        CheckNeighbor(node, top_right);
    }
    if(rate > 0 && !isPaused)
        setTimeout(PickNext, (10000/rate));
}

function CalculateF(node){
    if(node.parent != null && node.parent.g > 0) {
        node.g = node.parent.g;
    }
    if(node.row != node.parent.row && node.col != node.parent.col)
        node.g += 14;
    else
        node.g += 10;

    var xd = Math.abs(node.col - enode.col);
    var yd = Math.abs(node.row - enode.row);

    switch(heuristic){
        case "manhattan":
            node.h = 10*(xd + yd);
            break;
        case "diagonal":

            if(xd > yd){
                node.h = 14*yd + 10*(xd - yd);
            }
            else
            node.h = 14*xd + 10*(yd-xd);
            break;
        case "euclidean":
            node.h = Math.sqrt((xd*xd) + (yd*yd));
            break;
    }

    switch(algorithm){
        case "a*":
            node.f = node.h + node.g;
            break;
        case "dijkstra":
            node.f = node.g;
            break;
        case "bestFirst":
            node.f = node.h;
            break;
    }

}

function PickNext(){
    openList.sort(function(a,b){return a.f- b.f;});
    if(openList[0])
        FindNeighbors(openList.shift());
    else
        EndSimulation();
}

function MarkOpen(node){
    ctx.strokeStyle = "#009999";
    ctx.lineWidth = 5;
    ctx.strokeRect(node.x, node.y, node.ndW, node.ndH);
}

function MarkVisited(node){
    ctx.strokeStyle = "#990099";
    ctx.lineWidth = 5;
    ctx.strokeRect(node.x, node.y, node.ndW, node.ndH);
}

function InOpenList(node){
    for(var i = 0; i<openList.length; i++)
    {
        if(openList[i].row == node.row && openList[i].col == node.col)
            return true;
    }
    return false;
}

function InClosedList(node){
    for(var i = 0; i<closedList.length; i++)
    {
        if(closedList[i].row == node.row && closedList[i].col == node.col)
            return true;
    }
    return false;
}

function LoadMap(mapName){
    mapTxtArea.value = "";
    var map = ReadTextFile("maps/" + mapName);
    if(map){
        mapTxtArea.value = map;
        var temp = [];
        var row = [];
        for(var i = 0; i <= map.length; i++)
        {

            if(map[i] == "\n" || i == map.length){
                temp.push(row);
                row = [];
            }
            else if(map[i] == 'o'){
                var node = CreateNode();
                node.isWall = true;
                row.push(node);
            }
            else if(map[i] == 'e'){
                node = CreateNode();
                row.push(node);
            }
        }
        if(temp){
            nodes = temp;
            Show('options');
            DrawMap();
        }
        else
            mapTxtArea.value = "Error loading map: file "+ mapName+" is not in correct format."
    }
    else
        mapTxtArea.value = "Could not find file " + mapName + " make sure it is located in the 'maps/' directory of the project parent directory.";

}

function ReadTextFile(file)
{
    var out = "";
    var raw = new XMLHttpRequest();
    raw.open("GET", file, false);
    raw.onreadystatechange = function(){
        if(raw.readyState == 4){
            if(raw.status == 200 || raw.status == 0)
            {
                out = raw.responseText;
            }
            else
                return null;
        }
    }
    raw.send(null);
    return out;
}

function GenerateMap(type){
    var cols;
    var rows;
    var temp = [];
    var row = [];
    mapTxtArea.value = "";
    if(type == 'random'){
         cols = Math.random()*32+1;

        if (cols > 32){ cols = 32 ;}
        else if( cols == 0){ cols =  1;}

        rows = Math.random() * 32 + 1;
        if (rows > 32) {rows = 32;}
        else if (rows == 0) {rows = 1;}

        for(var i = 0; i < cols; i++) {
            row = [];
            for (var j = 0; j < rows; j++) {
                var coin = Math.random();
                if (coin < 0.8) {
                    var node = CreateNode();
                    row.push(node);
                }
                else {
                    node = CreateNode();
                    node.isWall = true;
                    row.push(node);
                }
            }
            temp.push(row);

        }
    }
    else{
        rows = document.getElementById('x').value;
        cols = document.getElementById('y').value;

        if (cols > 32 || rows > 32  || cols <= 0 || rows <= 0 ){
            alert("X and Y values must be between 1 and 32");
            document.getElementById('x').value = "";
            document.getElementById('y').value = "";
            document.getElementById('x').focus();
            return;
        }

        for(i = 0; i < cols; i++){
            row = [];
            for(j = 0; j < rows; j++){
                node = CreateNode();
                row.push(node);
            }
            temp.push(row);
        }
    }

    nodes = temp;
    Show('options');
    DrawMap();
    RewriteInputPanel();
}

function DrawMap(){
    startSelected = false;
    endSelected = false;
    simStarted = false;
    isPaused = false;

    snode = null;
    enode = null;

    openList = [];
    closedList = [];
    Start();


    Show('instStart');
    Show('instEnd');

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0,canvas.width,canvas.height);


    for(var i = 0; i < nodes.length; i++ ){
        var nodeWidth = (canvas.width/nodes[i].length);
        var nodeHeight = (canvas.height/nodes.length);

        for(var j = 0; j < nodes[i].length; j++){
            nodes[i][j].ndW = nodeWidth - 5;
            nodes[i][j].ndH = nodeHeight - 5;
            nodes[i][j].x = (j * nodeWidth) + 2.5;
            nodes[i][j].y = (i * nodeHeight) + 2.5;
            nodes[i][j].row = i;
            nodes[i][j].col = j;
            if(nodes[i][j].isWall) {
                ctx.fillStyle = "#0000FF";
            }
            else{
                ctx.fillStyle = "#000000";
            }
            ctx.fillRect(nodes[i][j].x, nodes[i][j].y, nodes[i][j].ndW, nodes[i][j].ndH);

        }
    }

}

function CreateNode(){
    return newNode = {
        x:-1,
        y:-1,
        ndW: -1,
        ndH: -1,
        f: 0,
        g: 0,
        h: 0,
        row: -1,
        col: -1,
        isStart: false,
        isEnd: false,
        isWall: false,
        parent: null
    };
}

function SetNode(node){
    if(!node.isWall && !startSelected){
        if(node.isEnd) { alert("Starting point and ending point cannot be the same node."); return;}
        node.isStart = true;
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(node.x, node.y, node.ndW, node.ndH);
        startSelected = true;
        Hide('instStart');
    }
    else if(!node.isWall && !endSelected)
    {
        if(node.isStart) { alert("Starting point and ending point cannot be the same node."); return;}
        node.isEnd = true;
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(node.x, node.y, node.ndW, node.ndH);
        endSelected = true;
        Hide('instEnd');
    }
    else if(!node.isWall && !node.isStart && !node.isEnd && startSelected && endSelected)
    {
        node.isWall = true;
        ctx.fillStyle = "#0000FF";
        ctx.fillRect(node.x, node.y, node.ndW, node.ndH);
        RewriteInputPanel();
    }
    else{
        ctx.fillStyle = "#000000";
        if(node.isStart)
        {
            startSelected = false;
            node.isStart = false;
            ctx.fillRect(node.x, node.y, node.ndW, node.ndH);
            Show('instStart');
        }
        else if(node.isEnd)
        {
            endSelected = false;
            node.isEnd = false;
            ctx.fillRect(node.x, node.y, node.ndW, node.ndH);
            Show('instEnd');
        }
        else if(node.isWall){
            node.isWall = false;
            ctx.fillRect(node.x, node.y, node.ndW, node.ndH);
            RewriteInputPanel();
        }
    }
}

function ClickedOnNode(mousePos){
    for(var i = 0; i < nodes.length; i++){

        for(var j =0; j< nodes[i].length; j++){
            if(nodes[i][j].x + nodes[i][j].ndW > mousePos.x && nodes[i][j].x < mousePos.x &&
                nodes[i][j].y + nodes[i][j].ndH >= mousePos.y && nodes[i][j].y < mousePos.y){
                SetNode(nodes[i][j]);
            }
        }
    }
}

function Hide(id){document.getElementById(id).className = "hidden";}


function Show(id){
    document.getElementById(id).className = "visible";
    switch(id) {
        case 'defaults':
            Hide('generate');
            Hide('custom');
            Hide('options');
            break;
        case 'generate':
            Hide('defaults');
            Hide('custom');
            Hide('options');
            break;
        case 'custom':
            Hide('defaults');
            Hide('generate');
            Hide('options');
            break;
        case 'options':
            Hide('defaults');
            Hide('generate');
            Hide('custom');
            break;
        default:

            break;
    }
}

function RewriteInputPanel(){
    mapTxtArea.value = "";
    for(var i = 0; i < nodes.length; i++){
        for(var j = 0; j < nodes[i].length; j++){
            if(nodes[i][j].isWall)
                mapTxtArea.value += "o";
            else
                mapTxtArea.value += "e";
        }
        mapTxtArea.value += "\n";
    }
}

function getMousePos(evt){
    var rect = canvas.getBoundingClientRect();
    return{
        x: Math.floor((evt.clientX-rect.left)/(rect.right-rect.left)*canvas.width),
        y: Math.round((evt.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height)
    }
}

function SetAlgorithm() {algorithm = document.getElementById('algorithm').value;}

function SetHeuristic() {heuristic = document.getElementById("heuristic").value;}

function DisplayValue(){
    var speed = document.getElementById('speed').value;
    if(speed > 0) {
        document.getElementById('speedLabel').innerHTML = "Animation Speed: " + speed;
        document.getElementById('start').innerText = "Start";

    }
    else {
        document.getElementById('speedLabel').innerHTML = "Animation Speed: Step";
        document.getElementById('start').innerText = "Step";
    }
    rate = speed;
}