let container;
let camera, scene, raycaster, renderer,id;
let highscore = localStorage.getItem("highscore");

let mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
let radius = 100, theta = 0;
let score = 0;

let floorUrl = "../images/checker_large.gif";
let covidModel = {obj:'./models/Coronavirus_Lowpoly.obj'};
let humanModel = {obj:'./models/FinalBaseMesh.obj'};
let humanObj = null;
let texture1Url = "./models/covid1.png";
let texture2Url = "./models/covid2.png";
let texture3Url = "./models/covid3.png";
let textures = [texture1Url,texture2Url, texture3Url];
let gameObjects = [];
let covids = [];

function promisifyLoader ( loader, onProgress ) 
{
    function promiseLoader ( url ) {
  
      return new Promise( ( resolve, reject ) => {
  
        loader.load( url, resolve, onProgress, reject );
  
      } );
    }
  
    return {
      originalLoader: loader,
      load: promiseLoader,
    };
}

const onError = ( ( err ) => { console.error( err ); } );

async function loadHuman(){

    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        //const covid = await objPromiseLoader.load(covidModel.obj);
        const object = await objPromiseLoader.load(humanModel.obj);
        
        let texture = humanModel.hasOwnProperty('map') ? new THREE.TextureLoader().load(humanModel.map) : null;
        let normalMap = humanModel.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(humanModel.normalMap) : null;
        let specularMap = humanModel.hasOwnProperty('specularMap') ? new THREE.TextureLoader().load(humanModel.specularMap) : null;

        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material.color.setHex(0xb30c00);
            }
        });

        object.scale.set(2, 2, 2);
        object.position.set( 0,10, -200);
        //console.log("X: ", object.position.x, "Y: ", object.position.y, "Z: ", object.position.z);
        object.name = "humanObject";
        scene.add(object);
        humanObj = object;

    }
    catch (err) {
        return onError(err);
    }
}

async function loadCovid(i){

    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        const object = await objPromiseLoader.load(covidModel.obj);
        var randomnumber = Math.floor(Math.random() * (2 - 0 + 1)) + 0;
        let map = new THREE.TextureLoader().load(textures[randomnumber]);
        var material = new THREE.MeshPhongMaterial({map: map});

        let normalMap = covidModel.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(covidModel.normalMap) : null;
        let specularMap = covidModel.hasOwnProperty('specularMap') ? new THREE.TextureLoader().load(covidModel.specularMap) : null;

        // For any meshes in the model, add our material.
        object.traverse( function ( node ) {

            if ( node.isMesh ) node.material = material;

        } );

        object.scale.set(0.2,0.2,0.2);

        var rx = Math.floor(Math.random() * (window.innerWidth-200 - window.innerWidth-400 + 1)) + window.innerWidth-400;
        var ry = Math.floor(Math.random() * (window.innerHeight-200 - window.innerHeight-400 + 1)) + window.innerHeight-400;
    

        var choose1 = Math.floor(Math.random()*Math.floor(2));
        var choose2 = Math.floor(Math.random()*Math.floor(2));

        if (choose1 >0)
            rx = -rx;
        if (choose2>0)
            ry = -ry
    
        //console.log(choose1, choose2)

        object.position.set(rx , ry , -200);
        //console.log(object.position);
        
        //console.log("X: ", object.position.x, "Y: ", object.position.y, "Z: ", object.position.z);
        object.name = "Covid_"+i;
        scene.add(object);
        covids.push(object);
        gameObjects.push(object);
        console.log(object.position)
        
    }
    catch (err) {
        return onError(err);
    }
} 

function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );
    
    let light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 1, 1, 1 );
    scene.add( light );
    
    // floor

    let map = new THREE.TextureLoader().load(floorUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    let floorGeometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    let floor = new THREE.Mesh(floorGeometry, new THREE.MeshPhongMaterial({color:0xffffff, map:map, side:THREE.DoubleSide}));
    floor.rotation.x = -Math.PI / 2;
    scene.add( floor );

    let geometry = new THREE.BoxBufferGeometry( 20, 20, 20 );
    
    for ( let i = 0; i < 7; i ++ ) 
    {
        loadCovid(i);
    }
    

    loadHuman();
    
    raycaster = new THREE.Raycaster();
        
    //document.addEventListener('mousemove', onDocumentMouseMove);
    document.addEventListener('mousedown', onDocumentMouseDown);
    
    window.addEventListener( 'resize', onWindowResize);

    console.log(covids);
    console.log(gameObjects);
    //initPointerLock();
}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
/*
function onDocumentMouseMove( event ) 
{
    event.preventDefault();
    //Marca el centro como (0,0) y los bounds como (1,1) (-1,1) (1,-1) (-1,-1)
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    let intersects = raycaster.intersectObjects( scene.children );
    
    if ( intersects.length > 0 ) 
    {
        let closer = intersects.length - 1;

        if ( INTERSECTED != intersects[ closer ].object ) 
        {
            if ( INTERSECTED)
            {
                INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
            }

            INTERSECTED = intersects[ closer ].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
    } 
    else 
    {
        if ( INTERSECTED ) 
            INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

        INTERSECTED = null;
    }
}
*/
function onDocumentMouseDown(event)
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    console.log( event.clientX, event.clientY);

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    let intersects = raycaster.intersectObjects( gameObjects, true);

    //console.log("intersects", intersects);
    if ( intersects.length > 0 ) 
    {
        //Por alguna razon el parent es el objecto real
        CLICKED = intersects[ intersects.length - 1 ].object;
        //CLICKED.material.emissive.setHex( 0x00ff00 );
        clickedObject = intersects[ intersects.length - 1 ].object.parent;
        //console.log("CLICKEADO LOL -----------------------");
        console.log(clickedObject.name);

        //METER COSA PARA QUE REGRESEN A UN CIERTO PUNTO FUERA DEL CANVAS
        var rx = Math.floor(Math.random() * (window.innerWidth-200 - window.innerWidth-400 + 1)) + window.innerWidth-400;
        var ry = Math.floor(Math.random() * (window.innerHeight-200 - window.innerHeight-400 + 1)) + window.innerHeight-400;
    

        var choose1 = Math.floor(Math.random()*Math.floor(2));
        var choose2 = Math.floor(Math.random()*Math.floor(2));

        if (choose1 >0)
            rx = -rx;
        if (choose2>0)
            ry = -ry
    
        //console.log(choose1, choose2)

        clickedObject.position.set(rx , ry , -200);
        //console.log(object.position);
        document.getElementById("score").innerHTML = "Score: " + (score+=1);

    } 
    else 
    {
        if ( CLICKED ) 
            CLICKED.material.emissive.setHex( CLICKED.currentHex );

        CLICKED = null;
    }
}

function moveCovid(covid,speed){
    let human = humanObj;
    let obj =  covid;


    if(obj.position.x > human.position.x){
        obj.position.x -= speed
    }

    if( obj.position.y > human.position.y+20){
        obj.position.y -= speed
    } 
    
    if(obj.position.x < human.position.x){
        obj.position.x += speed;
    }
 
    if(obj.position.y < human.position.y+20){
        obj.position.y += speed;
    }
    
    if(Math.floor(obj.position.y) ===  human.position.y+20 && Math.floor(obj.position.x) === human.position.x){
        console.log("YA LLEGUEEEE");
        
        if (score> 0)
            score -=1;
            document.getElementById("score").innerHTML = "Score: " + (score);
    }

}

function startTimer(duration) {
    var timer = duration, minutes, seconds;
    setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        document.getElementById("timer").innerHTML = "Timer: " + seconds + " seconds";

        if (--timer < 0) {
            timer = duration;
            gameOver();
        }
    }, 1000);
}

function gameOver(){
    cancelAnimationFrame(id);

            timer = document.getElementById("timer");
            timer.style.display = "none";
            gameScore = document.getElementById("score");
            gameScore.style.display = "none"

            if(highscore !== null){
                if (score > highscore) {
                    localStorage.setItem("highscore", score);
                    document.getElementById("gg").innerHTML = "New High Score! : " + score;    
                }else{
                    document.getElementById("gg").innerHTML = "Your score is: " + score + " -- High Score: " + highscore;
                }
            }
            else{
                localStorage.setItem("highscore", score);
                document.getElementById("gg").innerHTML = "Your score is: " + score + " -- High Score: " + score;
            }

           // boton =  document.getElementById('lol');
            //boton.style.display = "flex";
            
            canvasGO = document.getElementById('webglcanvas');
            canvasGO.style.display = "none";

            goIMG = document.getElementById('goIMG');
            goIMG.style.display = "flex"
            //localStorage.clear();
}


//
function run() 
{
    speed = 0.4;
    id = requestAnimationFrame( run );
    moveCovid(covids[0],speed);
    moveCovid(covids[1],speed);
    moveCovid(covids[2],speed);
    moveCovid(covids[3],speed);
    moveCovid(covids[4],speed);
    moveCovid(covids[5],speed);
    moveCovid(covids[6],speed);
    render();
    
}

function render() 
{
    renderer.render( scene, camera );
}