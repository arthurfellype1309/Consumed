const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
 
/* Header: troca de cor ao rolar */
const hd = document.getElementById('hd');
function atualizaHeader() {
    hd.classList.toggle('scrolled', window.scrollY > 40);
}
addEventListener('scroll', atualizaHeader, { passive: true });
atualizaHeader();
 
/* Triagem: mostra o painel do chip escolhido */
const chips = [...document.querySelectorAll('.chips .chip')];
chips.forEach((chip) => {
    chip.addEventListener('click', () => {
        chips.forEach((c) => {
            const ativo = c === chip;
            c.setAttribute('aria-pressed', ativo);
            const painel = document.getElementById(c.getAttribute('aria-controls'));
            if (painel) painel.hidden = !ativo;
        });
    });
});
 
/* Filtros de acesso */
document.querySelectorAll('.tog').forEach((b) => {
    b.addEventListener('click', () => {
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
    });
});
 
/* Menu mobile */
const burger = document.querySelector('.burger');
function menu(abrir) {
    hd.classList.toggle('open', abrir);
    if (burger) burger.setAttribute('aria-expanded', abrir);
}
if (burger) burger.addEventListener('click', () => menu(!hd.classList.contains('open')));
const navegacao = document.getElementById('menu');
if (navegacao) {
    navegacao.addEventListener('click', (e) => {
        if (e.target.closest('a')) menu(false);
    });
}
 
/* Abas dos profissionais */
const abas = [...document.querySelectorAll('.tab')];
abas.forEach((aba) => {
    aba.addEventListener('click', () => {
        abas.forEach((a) => a.setAttribute('aria-pressed', a === aba));
        document.querySelectorAll('#feat .pro').forEach((c) => {
            c.hidden = aba.dataset.f !== 'todos' && !c.classList.contains(aba.dataset.f);
        });
    });
});
 
/* Parallax da moldura e do cartão flutuante */
const camadas = [...document.querySelectorAll('[data-d]')];
let mx = 0;
function parallax() {
    if (RM) return;
    const y = Math.min(scrollY, 700);
    camadas.forEach((el) => {
        const d = +el.dataset.d;
        el.style.transform = `translate(${mx * d * -80}px, ${y * d * 0.35}px)`;
    });
}
addEventListener('scroll', parallax, { passive: true });
addEventListener(
    'pointermove',
    (e) => {
        mx = e.clientX / innerWidth - 0.5;
        parallax();
    },
    { passive: true },
);
 
/* shader */
(function () {
    const cv = document.getElementById('sh');
    if (!cv) return;
    const gl = cv.getContext('webgl');
    if (!gl) return;
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(p);p*=2.02;a*=.5;}return s;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*2.3+(m-.5)*.4;
 float q=fbm(p+vec2(t*.04,0.));float w=fbm(p+2.*q+vec2(0.,t*.03));
 vec3 paper=vec3(.98,.969,.949),mint=vec3(.82,.91,.87),sky=vec3(.81,.87,.94),amb=vec3(.96,.82,.52);
 vec3 c=mix(paper,mint,smoothstep(.3,.7,w));
 c=mix(c,sky,smoothstep(.4,.85,q)*.85);
 c=mix(c,amb,smoothstep(.62,.85,w*q*2.)*.35);
 c+=(h(gl_FragCoord.xy+fract(t))-.5)*.025;
 gl_FragColor=vec4(c,1.);}`;
    const sh = (ty, src) => {
        const s = gl.createShader(ty);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
    };
    const pg = gl.createProgram();
    gl.attachShader(pg, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pg);
    if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) return;
    gl.useProgram(pg);
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pg, 'p');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const ur = gl.getUniformLocation(pg, 'r'),
        ut = gl.getUniformLocation(pg, 't'),
        um = gl.getUniformLocation(pg, 'm');
    let vis = true,
        T0 = performance.now(),
        mm = [0.5, 0.5],
        sm = [0.5, 0.5];
    function size() {
        const k = 0.5;
        cv.width = Math.max(2, (cv.clientWidth * k) | 0);
        cv.height = Math.max(2, (cv.clientHeight * k) | 0);
        gl.viewport(0, 0, cv.width, cv.height);
    }
    function draw(now) {
        sm[0] += (mm[0] - sm[0]) * 0.05;
        sm[1] += (mm[1] - sm[1]) * 0.05;
        gl.uniform2f(ur, cv.width, cv.height);
        gl.uniform1f(ut, RM ? 8 : (now - T0) / 1000 + 8);
        gl.uniform2f(um, sm[0], sm[1]);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function loop(now) {
        if (vis) draw(now);
        requestAnimationFrame(loop);
    }
    size();
    addEventListener('resize', () => {
        size();
        draw(performance.now());
    });
    addEventListener(
        'pointermove',
        (e) => {
            mm = [e.clientX / innerWidth, 1 - e.clientY / innerHeight];
        },
        { passive: true },
    );
    new IntersectionObserver((e) => (vis = e[0].isIntersecting)).observe(cv);
    if (RM) {
        draw(0);
    } else {
        requestAnimationFrame(loop);
    }
})();
 