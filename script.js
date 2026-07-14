const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


// cores das blobs
const BLOB_COLOR_A = "#ff00ea";
const BLOB_COLOR_B = "#ff0055";

const FUNDO_COLOR = "#f8b842";

// cor do stroke
const STROKE_COLOR = "#000000";

// espessura do stroke
const STROKE_SIZE = 0.08;

// velocidade das blobs
const BLOB_SPEED = 1.4;


// resolução interna
const scale = 0.8;



const buffer = document.createElement("canvas");
const bctx = buffer.getContext("2d");



function resize() {

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    buffer.width = Math.floor(canvas.width * scale);
    buffer.height = Math.floor(canvas.height * scale);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

}

resize();
addEventListener("resize", resize);



// converter hex para rgb
function hexToRgb(hex){

    hex = hex.replace("#","");

    return {
        r:parseInt(hex.substring(0,2),16),
        g:parseInt(hex.substring(2,4),16),
        b:parseInt(hex.substring(4,6),16)
    };

}


// mistura de cores
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



const blobs = [];

for (let i = 0; i < 10; i++) {

    blobs.push({

        x: Math.random() * buffer.width,
        y: Math.random() * buffer.height,

        vx:(Math.random()-.5)*0.8,
        vy:(Math.random()-.5)*0.8,

        r:20+Math.random()*60

    });

}



let mouse = {
    x:0,
    y:0
};


let dragging=null;



canvas.onmousemove=e=>{


    mouse.x=e.clientX*scale;
    mouse.y=e.clientY*scale;



    if(dragging!==null){

        blobs[dragging].x +=
        (mouse.x-blobs[dragging].x)*0.25;


        blobs[dragging].y +=
        (mouse.y-blobs[dragging].y)*0.25;

    }

};



canvas.onmousedown=()=>{

    let best=Infinity;


    blobs.forEach((b,i)=>{


        let d=Math.hypot(
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





function physics(){


    blobs.forEach((b,i)=>{


        if(i!==dragging){


            b.x += b.vx * BLOB_SPEED;
            b.y += b.vy * BLOB_SPEED;


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





function draw(){


    const img=bctx.createImageData(
        buffer.width,
        buffer.height
    );


    const data=img.data;



    // posição horizontal do rato controla a cor

    const mouseMix =
    Math.min(
        1,
        Math.max(
            0,
            mouse.x / buffer.width
        )
    );


    const blobColor =
    mixColor(
        colorA,
        colorB,
        mouseMix
    );




    for(let y=0;y<buffer.height;y++){


        for(let x=0;x<buffer.width;x++){



            let field=0;



            for(const b of blobs){


                let dx=x-b.x;
                let dy=y-b.y;



                field +=
                (b.r*b.r) /
                (dx*dx+dy*dy+1);


            }




            let inside =
            field > 1.2;



            let outline =
            field > (1.2-STROKE_SIZE)
            &&
            !inside;



            let i =
            (y*buffer.width+x)*4;



            if(inside){


                data[i]=blobColor.r;
                data[i+1]=blobColor.g;
                data[i+2]=blobColor.b;


            }
            else if(outline){


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





function animate(){

    physics();

    draw();

    requestAnimationFrame(animate);

}



animate();
