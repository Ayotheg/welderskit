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
    delay:2,
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
    delay:2,
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
    delay:2,
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
    toggleActions: "play none none none",
    delay:2,
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
    delay:2,
  }
});

//slide in from the left
gsap.from("#slide7", {
  x: -150,
  opacity: 0,
  duration: 2,
  scrollTrigger: {
    trigger: "#slide5",
    start: "top 80%",
    toggleActions: "play none none none",
    delay:2
  }
});

// Slide in from the RIGHT
gsap.from("#slide8", {
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

//slide in from the left
gsap.from("#slide9", {
  x: -150,
  opacity: 0,
  duration: 2,
  scrollTrigger: {
    trigger: "#slide5",
    start: "top 80%",
    toggleActions: "play none none none",
    delay:2
  }
});
