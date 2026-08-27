// 打字效果

const text = [
"探索 AI 与未来科技",
"创造属于自己的数字世界",
"Keep Learning, Keep Creating"
];


let index = 0;
let char = 0;

const typing =
document.getElementById("typing");


function type(){

if(char < text[index].length){

typing.innerHTML += text[index][char];

char++;

setTimeout(type,100);

}

else{

setTimeout(erase,1500);

}

}


function erase(){

if(char>0){

typing.innerHTML =
text[index].substring(0,char-1);

char--;

setTimeout(erase,50);

}

else{

index++;

if(index>=text.length){

index=0;

}

setTimeout(type,500);

}

}


type();




// 粒子背景


const canvas =
document.getElementById("particles");


const ctx =
canvas.getContext("2d");


canvas.width =
window.innerWidth;


canvas.height =
window.innerHeight;



let particles=[];



for(let i=0;i<100;i++){


particles.push({

x:Math.random()*canvas.width,

y:Math.random()*canvas.height,

size:Math.random()*3+1,

speedX:(Math.random()-0.5),

speedY:(Math.random()-0.5)

});


}



function animate(){


ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);



particles.forEach(p=>{


ctx.beginPath();

ctx.arc(
p.x,
p.y,
p.size,
0,
Math.PI*2
);


ctx.fillStyle="#00ffff";


ctx.fill();


p.x+=p.speedX;

p.y+=p.speedY;



if(
p.x<0 ||
p.x>canvas.width
){

p.speedX*=-1;

}


if(
p.y<0 ||
p.y>canvas.height
){

p.speedY*=-1;

}


});



requestAnimationFrame(animate);


}



animate();



window.addEventListener(
"resize",
()=>{

canvas.width=
window.innerWidth;

canvas.height=
window.innerHeight;

}
);
