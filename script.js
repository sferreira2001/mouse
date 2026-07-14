const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas")
});

renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const uniforms = {

    uTime: {
        value: 0
    },

    uResolution: {
        value: new THREE.Vector2(
            window.innerWidth,
            window.innerHeight
        )
    },

    uMouse: {
        value: new THREE.Vector2(0.5, 0.5)
    }

};

const material = new THREE.ShaderMaterial({

    uniforms,

    vertexShader: `

        void main() {

            gl_Position = vec4(position, 1.0);

        }

    `,

   fragmentShader:`

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTime;

float hash(vec2 p){
    return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);
}

float noise(vec2 p){

    vec2 i=floor(p);
    vec2 f=fract(p);

    f=f*f*(3.0-2.0*f);

    float a=hash(i);
    float b=hash(i+vec2(1,0));
    float c=hash(i+vec2(0,1));
    float d=hash(i+vec2(1,1));

    return mix(
        mix(a,b,f.x),
        mix(c,d,f.x),
        f.y
    );

}

void main(){

    vec2 uv=gl_FragCoord.xy/uResolution;

    uv-=0.5;

    uv.x*=uResolution.x/uResolution.y;

    //----------------------------------
    // mouse force
    //----------------------------------

    vec2 m=uMouse;

    m-=0.5;
    m.x*=uResolution.x/uResolution.y;

    vec2 dir=uv-m;

    float dist=length(dir);

    uv+=normalize(dir)*0.25*exp(-dist*10.0);

    //----------------------------------
    // domain warp
    //----------------------------------

    uv+=0.25*vec2(

        noise(uv*4.0+uTime*.15),

        noise(uv*4.0+20.0+uTime*.15)

    )-.125;

    //----------------------------------
    // noise

    float n=noise(uv*10.0);

    //----------------------------------
    // silhouettes

    n=step(.55,n);

    //----------------------------------
    // grain

    n+=hash(gl_FragCoord.xy+uTime)*0.05;

    gl_FragColor=vec4(vec3(n),1.0);

}
`

});

const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    material
);

scene.add(mesh);

window.addEventListener("mousemove", (event) => {

    uniforms.uMouse.value.set(

        event.clientX / window.innerWidth,

        1.0 - event.clientY / window.innerHeight

    );

});

window.addEventListener("resize", () => {

    renderer.setSize(window.innerWidth, window.innerHeight);

    uniforms.uResolution.value.set(
        window.innerWidth,
        window.innerHeight
    );

});

function animate(time) {

    uniforms.uTime.value = time * 0.001;

    renderer.render(scene, camera);

    requestAnimationFrame(animate);

}

requestAnimationFrame(animate);