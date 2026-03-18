gsap.from("#text-home",
    {
        opacity:0,
        duration:3,
    }
);

// Animate multiple texts sequentially on #header
const texts = [
  { value: "Maraba, Masu Welding", newClass: "text2" },
  { value: "Nnọọ, Ndị Welders", newClass: "text3" },
  { value: "Welcome,Welders!", newClass: "text4" }
];

let tl = gsap.timeline({ delay: 1 });

texts.forEach(textObj => {
  tl.to("#header", {
    duration: 3,
    text: {
      value: textObj.value,
      newClass: textObj.newClass,
      delimiter: "",
    }
  });
});

gsap.from("#menu-grid-main",{
    delay:1,
    x:-400,
    duration:3,

});
gsap.from("#menu-grid-main2",{
    delay:1,
    x:400,
    duration:3
});
gsap.from("menu-grid-main3",{
    delay:1,
    x:-400,
    duration:3
});
gsap.from("#menu-grid-main-4",{
    delay:1,
    x:400,
    duration:3
});


gsap.registerPlugin(ScrollTrigger);

// Slide in from the LEFT
gsap.from("#slide", {
  x: -150,
  opacity: 0,
  duration: 2,
  scrollTrigger: {
    trigger: "#slide",
    start: "top 80%",  // when element is 80% down viewport
    toggleActions: "play none none none",
    delay:2
  }
});

// Slide in from the RIGHT
gsap.from("#slide2", {
  x: 150,
  opacity: 0,
  duration: 2,
  scrollTrigger: {
    trigger: "#slide2",
    start: "top 80%",
    toggleActions: "play none none none",
    delay:2
  }
});

// Slide in from the LEFT
gsap.from("#slide3", {
  x: -150,
  opacity: 0,
  duration: 2,
  scrollTrigger: {
    trigger: "#slide3",
    start: "top 80%",
    toggleActions: "play none none none",
    delay:2
  }
});

// Slide in from the RIGHT
gsap.from("#slide4", {
  x: 150,
  opacity: 0,
  duration: 2,
  scrollTrigger: {
    trigger: "#slide4",
    start: "top 80%",
    toggleActions: "play none none none",
    delay:2
  }
});

// Slide in from the LEFT
gsap.from("#slide5", {
  x: -150,
  opacity: 0,
  duration: 2,
  scrollTrigger: {
    trigger: "#slide5",
    start: "top 80%",
    toggleActions: "play none none none"
  }
});

// Slide in from the RIGHT
gsap.from("#slide6", {
  x: 150,
  opacity: 0,
  duration: 2,
  scrollTrigger: {
    trigger: "#slide4",
    start: "top 80%",
    toggleActions: "play none none none",
    delay:2
  }
});


gsap.to("#animate",{
    opacity:1,
    duration:3,
    y:30
});
