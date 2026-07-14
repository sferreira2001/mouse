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

const BLOB_SPEED = 2;

const BLOB_COUNT = 15;

const SCALE = 0.8;

const FIELD_THRESHOLD = 1.2;



const buffer = document.createElement("canvas");
const bctx = buffer.getContext("2d");



function resize(){

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    buffer.width = Math.floor(canvas.width*SCALE);
    buffer.height = Math.floor(canvas.height*SCALE);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality="high";

}

resize();
addEventListener("resize",resize);




// =============================
// COLORS
// =============================

function hexToRgb(hex){

    hex=hex.replace("#","");

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


const colorA=hexToRgb(BLOB_COLOR_A);
const colorB=hexToRgb(BLOB_COLOR_B);

const stroke=hexToRgb(STROKE_COLOR);

const colorF=hexToRgb(FUNDO_COLOR);




// =============================
// BLOBS
// =============================

const blobs=[];


for(let i=0;i<BLOB_COUNT;i++){

    blobs.push({

        x:Math.random()*buffer.width,
        y:Math.random()*buffer.height,

        vx:(Math.random()-.5)*0.8,
        vy:(Math.random()-.5)*0.8,

        r:30+Math.random()*100,

        r2:0

    });

}


// precompute radius squared

function updateRadius(){

    blobs.forEach(b=>{
        b.r2=b.r*b.r;
    });

}

updateRadius();





// =============================
// MOUSE
// =============================

let mouse={
    x:0,
    y:0
};


let dragging=null;



canvas.onmousemove=e=>{

    mouse.x=e.clientX*SCALE;
    mouse.y=e.clientY*SCALE;


    if(dragging!==null){

        let b=blobs[dragging];

        b.x+=(mouse.x-b.x)*0.25;
        b.y+=(mouse.y-b.y)*0.25;

    }

};



canvas.onmousedown=()=>{

    let best=Infinity;


    blobs.forEach((b,i)=>{

        const d=Math.hypot(
            mouse.x-b.x,
            mouse.y-b.y
        );


        if(d<b.r && d<best){

            best=d;
            dragging=i;

        }


    });

};



canvas.onmouseup=()=>dragging=null;
canvas.onmouseleave=()=>dragging=null;






// =============================
// PHYSICS
// =============================

function physics(){

    blobs.forEach((b,i)=>{


        if(i!==dragging){

            b.x+=b.vx*BLOB_SPEED;
            b.y+=b.vy*BLOB_SPEED;

        }


        if(
            b.x<b.r ||
            b.x>buffer.width-b.r
        )
            b.vx*=-1;


        if(
            b.y<b.r ||
            b.y>buffer.height-b.r
        )
            b.vy*=-1;


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



    const mouseMix=
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


                // ignore far away blobs
                const dist2=dx*dx+dy*dy;


                field += 
b.r2 /
(dist2+1);


            }



            let i=(y*width+x)*4;



            if(field>FIELD_THRESHOLD){


                data[i]=blobColor.r;
                data[i+1]=blobColor.g;
                data[i+2]=blobColor.b;


            }
            else if(field>FIELD_THRESHOLD-STROKE_SIZE){


                data[i]=stroke.r;
                data[i+1]=stroke.g;
                data[i+2]=stroke.b;


            }
            else{


                data[i]=colorF.r;
                data[i+1]=colorF.g;
                data[i+2]=colorF.b;


            }


            data[i+3]=255;


        }

    }


    bctx.putImageData(img,0,0);



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




let lastPhysics=0;


function animate(time){


    // physics at ~50fps
    if(time-lastPhysics>20){

        physics();

        lastPhysics=time;

    }


    draw();


    requestAnimationFrame(animate);

}


requestAnimationFrame(animate);
