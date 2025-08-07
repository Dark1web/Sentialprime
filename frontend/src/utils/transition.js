import barba from '@barba/core';
import gsap from 'gsap';

const pageTransition = () => {
  const tl = gsap.timeline();

  tl.to('.page-transition', {
    duration: 0.5,
    height: '100%',
    top: '0%',
  });

  tl.to('.page-transition', {
    duration: 0.5,
    height: '100%',
    top: '100%',
    delay: 0.3,
  });

  tl.set('.page-transition', {
    top: '-100%',
  });
};

const contentAnimation = () => {
  const tl = gsap.timeline();
  tl.from('.fade-in', {
    duration: 0.5,
    opacity: 0,
    y: 30,
    stagger: 0.2,
  });
};

barba.init({
  sync: true,
  transitions: [
    {
      name: 'default-transition',
      leave(data) {
        const done = this.async();
        pageTransition();
        gsap.to(data.current.container, {
          opacity: 0,
          onComplete: () => {
            done();
          },
        });
      },
      enter(data) {
        contentAnimation();
        gsap.from(data.next.container, {
          opacity: 0,
        });
      },
    },
  ],
});