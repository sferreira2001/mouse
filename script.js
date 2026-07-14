const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


// =============================
// SETTINGS
// =============================

const BLOB_COLOR_A = "#ff00ea";
const BLOB_COLOR_B = "#ff0055";

const FUNDO_COLOR = "#f8b842";

const STROKE_COLOR = "#000000";

const STROKE_SIZE = 0.08;

const BLOB_SPEED = 3;


// responsive settings

const MOBILE = window.innerWidth < 900;

const BLOB_COUNT = MOBILE ? 8 : 8;

const SCALE = MOBILE ? 0.4 : 0.4;

const FIELD_THRESHOLD = 1.2;



const buffer = document.createElement("canvas");
const bctx = buffer.getContext("2d");



function resize(){

    canvas.width = innerWidth;
    canvas.height = innerHeight;


    buffer.width =
    Math.floor(canvas.width*SCALE);


    buffer.height =
    Math.floor(canvas.height*SCALE);


    ctx.imageSmoothingEnabled=true;
    ctx.imageSmoothingQuality="high";

}

resize();

window.addEventListener("resize", resize);



// =============================
// COLORS
// =============================

function hexToRgb(hex){

    hex = hex.replace("#","");

    return {
        r:parseInt(hex.substring(0,2),16),
        g:parseInt(hex.substring(2,4),16),
        b:parseInt(hex.substring(4,6),16)
    };

}



function mixColor(a,b,t){

    return {
        r:a.r+(b.r-a.r)*t,
        g:a.g+(b.g-a.g)*t,
        b:a.b+(b.b-a.b)*t
    };

}



const colorA = hexToRgb(BLOB_COLOR_A);
const colorB = hexToRgb(BLOB_COLOR_B);

const stroke = hexToRgb(STROKE_COLOR);

const colorF = hexToRgb(FUNDO_COLOR);



// =============================
// BLOBS
// =============================

const blobs = [];


const MIN_BLOB_SIZE = MOBILE ? 15 : 30;
const MAX_BLOB_SIZE = MOBILE ? 45 : 100;



for(let i=0;i<BLOB_COUNT;i++){

    const r =
    MIN_BLOB_SIZE +
    Math.random() * MAX_BLOB_SIZE;


    blobs.push({

    x:Math.random()*buffer.width,
    y:Math.random()*buffer.height,

    vx:(Math.random()-.5)*0.8,
    vy:(Math.random()-.5)*0.8,

    r:r*SCALE,

    r2:(r*SCALE)*(r*SCALE),

    targetX:null,
    targetY:null

});

}



function updateRadius(){

    blobs.forEach(b=>{

        b.r2=b.r*b.r;

    });

}


updateRadius();




// =============================
// INTERACTION
// =============================

let mouse = {
    x:0,
    y:0
};

let previousMouse = {
    x:0,
    y:0
};

let dragging = null;


let releaseVelocity = {
    x:0,
    y:0
};



function updatePointer(x,y){

    const rect = canvas.getBoundingClientRect();


    mouse.x =
    ((x - rect.left) / rect.width)
    * buffer.width;


    mouse.y =
    ((y - rect.top) / rect.height)
    * buffer.height;



    if(dragging !== null){

        const b = blobs[dragging];


        // calculate throw velocity

        releaseVelocity.x =
        mouse.x - previousMouse.x;


        releaseVelocity.y =
        mouse.y - previousMouse.y;



        // smooth dragging

        b.x += (mouse.x - b.x) * 0.35;
        b.y += (mouse.y - b.y) * 0.35;


        previousMouse.x = mouse.x;
        previousMouse.y = mouse.y;

    }

}





function startDrag(){

    let best = Infinity;


    blobs.forEach((b,i)=>{


        const d = Math.hypot(
            mouse.x-b.x,
            mouse.y-b.y
        );


        if(
            d < b.r * 1.5 &&
            d < best
        ){

            best=d;
            dragging=i;

        }

    });



    if(dragging !== null){

        previousMouse.x = mouse.x;
        previousMouse.y = mouse.y;

    }

}





function stopDrag(){

    if(dragging !== null){

        const b = blobs[dragging];


        // throw blob

        b.vx = releaseVelocity.x * 0.5;
        b.vy = releaseVelocity.y * 0.5;

    }


    dragging=null;

}

// mouse

canvas.addEventListener(
"mousemove",
e=>{
    updatePointer(
        e.clientX,
        e.clientY
    );
});


canvas.addEventListener(
"mousedown",
()=>{
    startDrag();
});


canvas.addEventListener(
"mouseup",
()=>{
    stopDrag();
});


canvas.addEventListener(
"mouseleave",
()=>{
    stopDrag();
});



// touch

canvas.addEventListener(
"touchstart",
e=>{

    e.preventDefault();

    const t=e.touches[0];

    updatePointer(
        t.clientX,
        t.clientY
    );

    startDrag();

},
{
    passive:false
});


canvas.addEventListener(
"touchmove",
e=>{

    e.preventDefault();

    const t=e.touches[0];

    updatePointer(
        t.clientX,
        t.clientY
    );

},
{
    passive:false
});


canvas.addEventListener(
"touchend",
()=>{
    stopDrag();
});
function physics(){

    blobs.forEach((b,i)=>{


        if(i !== dragging){

            b.x += b.vx * BLOB_SPEED;
            b.y += b.vy * BLOB_SPEED;

        }


        // friction
        b.vx *= 0.985;
        b.vy *= 0.985;



        // minimum movement
        const minVelocity = 0.15;


        if(Math.abs(b.vx) < minVelocity){
            b.vx = b.vx < 0 ? -minVelocity : minVelocity;
        }


        if(Math.abs(b.vy) < minVelocity){
            b.vy = b.vy < 0 ? -minVelocity : minVelocity;
        }



        // walls
        if(b.x < b.r){

            b.x = b.r;
            b.vx *= -0.8;

        }


        if(b.x > buffer.width-b.r){

            b.x = buffer.width-b.r;
            b.vx *= -0.8;

        }


        if(b.y < b.r){

            b.y = b.r;
            b.vy *= -0.8;

        }


        if(b.y > buffer.height-b.r){

            b.y = buffer.height-b.r;
            b.vy *= -0.8;

        }


    });

}






// =============================
// DRAW
// =============================

function draw(){


    const img=bctx.createImageData(
        buffer.width,
        buffer.height
    );


    const data=img.data;



    // mouse controls colour

    const mouseMix =
    Math.max(
        0,
        Math.min(
            1,
            mouse.x/buffer.width
        )
    );



    const blobColor=mixColor(
        colorA,
        colorB,
        mouseMix
    );



    const width=buffer.width;



    for(let y=0;y<buffer.height;y++){


        for(let x=0;x<width;x++){


            let field=0;



            for(let j=0;j<BLOB_COUNT;j++){


                const b=blobs[j];


                const dx=x-b.x;
                const dy=y-b.y;



                field +=
                b.r2 /
                (dx*dx+dy*dy+1);


            }



            const index =
            (y*width+x)*4;



            if(field>FIELD_THRESHOLD){


                data[index]=blobColor.r;
                data[index+1]=blobColor.g;
                data[index+2]=blobColor.b;


            }


            else if(
                field >
                FIELD_THRESHOLD-STROKE_SIZE
            ){


                data[index]=stroke.r;
                data[index+1]=stroke.g;
                data[index+2]=stroke.b;


            }


            else{


                data[index]=colorF.r;
                data[index+1]=colorF.g;
                data[index+2]=colorF.b;


            }



            data[index+3]=255;


        }

    }



    bctx.putImageData(
        img,
        0,
        0
    );



    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );



    ctx.drawImage(
        buffer,
        0,
        0,
        canvas.width,
        canvas.height
    );


}







// =============================
// LOOP
// =============================

let lastPhysics=0;


function animate(time){


    // physics slightly slower than rendering

    if(time-lastPhysics>20){

        physics();

        lastPhysics=time;

    }



    draw();


    requestAnimationFrame(animate);

}



requestAnimationFrame(animate);
