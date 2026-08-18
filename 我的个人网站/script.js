// 获取画布

const canvas = document.getElementById("particles");

const ctx = canvas.getContext("2d");


// 设置大小

canvas.width = window.innerWidth;

canvas.height = window.innerHeight;



// 粒子数量

let particles = [];

const count = 120;



// 创建粒子

for(let i = 0; i < count; i++){

    particles.push({

        x:Math.random()*canvas.width,

        y:Math.random()*canvas.height,

        size:Math.random()*2+0.5,

        speedX:(Math.random()-0.5)*0.5,

        speedY:(Math.random()-0.5)*0.5

    });

}



// 绘制

function draw(){


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


        ctx.fillStyle="#00eaff";


        ctx.fill();



        // 移动

        p.x += p.speedX;

        p.y += p.speedY;



        // 边界返回

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



    requestAnimationFrame(draw);


}



draw();




// 窗口变化

window.addEventListener(
"resize",
()=>{


canvas.width=window.innerWidth;

canvas.height=window.innerHeight;


});




// 鼠标移动光效

document.addEventListener(
"mousemove",
(e)=>{


document.body.style.background=

`
radial-gradient(
600px at ${e.clientX}px ${e.clientY}px,
rgba(0,120,255,.12),
#050505
)
`;



});

// ===== Suze v3 打字机效果 =====


const typingText = document.getElementById("typing");


const words = [

"I create with AI.",

"I explore technology.",

"I share digital ideas.",

"Building the future with creativity."

];



let wordIndex = 0;

let charIndex = 0;

let deleting = false;



function typeEffect(){


const current = words[wordIndex];



if(!deleting){


typingText.textContent =

current.substring(0,charIndex++);



if(charIndex > current.length){


deleting = true;


setTimeout(typeEffect,1500);


return;


}



}else{


typingText.textContent =

current.substring(0,charIndex--);



if(charIndex === 0){


deleting = false;


wordIndex++;


if(wordIndex >= words.length){

wordIndex = 0;

}


}


}



setTimeout(
typeEffect,
deleting ? 60 : 120
);



}



typeEffect();