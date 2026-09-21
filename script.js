const portfolio = document.querySelector('.portfolio');
const divider = document.querySelector('.divider');
const visualButton = document.querySelector('.visual-button');
const visualArrow = document.querySelector('.visual-arrow');
const advertisingButton = document.querySelector('.advertising-button');
const advertisingArrow = document.querySelector('.advertising-arrow');
const contactButton = document.querySelector('.contact-name-button');
const infoView = document.querySelector('.info-view');
const topTrack = document.querySelector('.top-track');
const bottomTrack = document.querySelector('.bottom-track');
const projectView = document.querySelector('.project-view');
const projectMedia = document.querySelector('.project-view-media');
const projectName = document.querySelector('.project-view-name');
const projectType = document.querySelector('.project-view-type');
const projectYear = document.querySelector('.project-view-year');
const projectScrollHint = document.querySelector('.project-scroll-hint');
const projectDetailCopy = document.querySelector('.project-detail-copy');
const projectDetail = document.querySelector('.project-detail-text');
const projectDetailToggle = document.querySelector('.project-detail-toggle');
const projectDetailToggleArrow = document.querySelector('.project-detail-toggle-arrow');
const projectDetailToggleLabel = document.querySelector('.project-detail-toggle-label');
const projectGallery = document.querySelector('.project-gallery');

document.addEventListener('dragstart', (event) => {
  if (event.target.closest('img')) event.preventDefault();
});

document.querySelectorAll('img').forEach((image) => {
  image.draggable = false;
});

function setProjectImagesCondensed(condensed) {
  projectMedia.classList.toggle('is-condensed', condensed);
  projectGallery.querySelectorAll(':scope > *').forEach((item) => {
    item.classList.toggle('is-condensed', condensed);
  });
  syncProjectMediaHeight();
}

function syncProjectMediaHeight() {
  if (projectView.hidden) return;
  void projectDetail.offsetHeight;
  const availableHeight = `${window.innerHeight - divider.offsetHeight - projectDetail.offsetHeight}px`;
  projectMedia.style.setProperty('height', availableHeight, 'important');
  projectGallery.querySelectorAll(':scope > *').forEach((item) => {
    item.style.setProperty('height', availableHeight, 'important');
  });
}

const projectDetailResizeObserver = new ResizeObserver(syncProjectMediaHeight);
projectDetailResizeObserver.observe(projectDetail);

function resetProjectDetail() {
  projectEndReached = false;
  projectView.classList.remove('is-at-end');
  // snap instantly when opening a project, the toggle transition is only for Read More/Read Less
  projectDetail.style.transition = 'none';
  projectDetail.classList.remove('is-visible');
  projectDetail.classList.add('is-collapsed');
  projectDetail.style.opacity = '1';
  projectDetail.style.transform = 'translateY(0)';
  projectDetailToggleArrow.textContent = '↓';
  projectDetailToggleLabel.textContent = 'Read More';
  projectDetailToggle.setAttribute('aria-label', 'Projektbeschreibung ausklappen');
  setProjectImagesCondensed(false);
  void projectDetail.offsetHeight;
  projectDetail.style.transition = '';
}

function setProjectDetailExpanded(expanded) {
  projectDetail.classList.toggle('is-visible', expanded);
  projectDetail.classList.toggle('is-collapsed', !expanded);
  projectDetail.style.opacity = '1';
  projectDetail.style.transform = 'translateY(0)';
  projectDetailToggleArrow.textContent = expanded ? '→' : '↓';
  projectDetailToggleLabel.textContent = expanded ? 'Read Less' : 'Read More';
  projectDetailToggle.setAttribute(
    'aria-label',
    expanded ? 'Projektbeschreibung einklappen' : 'Projektbeschreibung ausklappen',
  );
  setProjectImagesCondensed(expanded);
}

projectDetail.addEventListener('click', (event) => {
  event.stopPropagation();
});

projectDetailToggle.addEventListener('click', (event) => {
  event.stopPropagation();
  setProjectDetailExpanded(!projectDetail.classList.contains('is-visible'));
});

projectView.addEventListener('wheel', (event) => {
  event.preventDefault();
  // any scroll direction advances the gallery forward, same behavior as the homepage sliders
  projectView.scrollLeft += Math.abs(event.deltaY || event.deltaX);
}, { passive: false });

projectView.addEventListener('scroll', () => {
  const scrollingBack = projectView.scrollLeft < projectView.previousScrollLeft;
  const atEnd = projectView.scrollLeft + projectView.clientWidth >= projectView.scrollWidth - 8;
  projectScrollHint.textContent = atEnd || scrollingBack ? '\u2190' : '\u2192';
  projectView.previousScrollLeft = projectView.scrollLeft;
  if (atEnd) {
    projectEndReached = true;
    projectView.classList.add('is-at-end');
    setProjectDetailExpanded(true);
  }
});

document.querySelectorAll('.image-track').forEach((track) => {
  track.querySelectorAll('img:not(.keep-photo)').forEach((image) => {
    const colorSlide = document.createElement('div');
    colorSlide.className = 'color-slide';
    colorSlide.setAttribute('role', 'img');
    colorSlide.setAttribute('aria-label', image.alt);
    image.replaceWith(colorSlide);
  });
});

let splitPosition = 50;
let dragging = false;
let pointerOffset = 0;
let infoOpen = false;
let projectOpen = false;
let projectEndReached = false;

function setSplit(position) {
  splitPosition = Math.min(100, Math.max(0, position));
  const atTop = splitPosition === 0;
  const atBottom = splitPosition === 100;

  visualArrow.textContent = atBottom ? '→' : '↑';
  advertisingArrow.textContent = atTop ? '→' : '↓';
  visualButton.setAttribute(
    'aria-label',
    atBottom ? 'Visual Communication' : 'Visual Communication nach unten bewegen',
  );
  advertisingButton.setAttribute(
    'aria-label',
    atTop ? 'Advertising' : 'Advertising nach oben bewegen',
  );
  const viewportHeight = portfolio.clientHeight;
  const dividerHeight = divider.offsetHeight;
  const desiredTop = (splitPosition / 100) * viewportHeight - dividerHeight / 2;
  const dividerTop = Math.min(
    viewportHeight - dividerHeight,
    Math.max(0, desiredTop),
  );

  document.querySelector('.top-panel').style.height = `${dividerTop}px`;
  document.querySelector('.bottom-panel').style.height = `${viewportHeight - dividerTop - dividerHeight}px`;
  divider.style.top = `${dividerTop}px`;
}

// recomputes panel/divider heights whenever the window size changes
window.addEventListener('resize', () => {
  setSplit(splitPosition);
  if (projectOpen) {
    syncProjectMediaHeight();
  }
});

function moveDivider(event) {
  const bounds = portfolio.getBoundingClientRect();
  const dividerHeight = divider.offsetHeight;
  const dividerTop = event.clientY - bounds.top - pointerOffset;
  const position = ((dividerTop + dividerHeight / 2) / bounds.height) * 100;
  setSplit(position);
}

function closeProjectView(preserveSplit = false) {
  if (!projectOpen) return;
  projectOpen = false;
  projectView.classList.remove('is-open', 'is-at-end');
  resetProjectDetail();
  portfolio.classList.remove('project-open');
  projectView.hidden = true;
  if (!preserveSplit) setSplit(50);
}

function getSlideBackground(slide) {
  if (slide.tagName === 'IMG') {
    return {
      image: `url("${slide.currentSrc || slide.src}")`,
      color: 'transparent',
    };
  }

  return {
    image: 'none',
    color: getComputedStyle(slide).backgroundColor,
  };
}

function addGalleryItem(slide) {
  const item = slide.cloneNode(false);
  item.removeAttribute('id');
  item.removeAttribute('style');
  if (item.tagName === 'IMG') item.draggable = false;
  if (item.classList.contains('color-slide')) {
    item.style.backgroundColor = getComputedStyle(slide).backgroundColor;
  }
  projectGallery.append(item);
}

function addGalleryMedia(src, label) {
  const isVideo = src.endsWith('.mp4');
  const item = document.createElement(isVideo ? 'video' : 'img');
  item.src = src;
  item.draggable = false;
  if (isVideo) {
    item.autoplay = true;
    item.loop = true;
    item.muted = true;
    item.playsInline = true;
    item.setAttribute('aria-label', label);
  } else {
    item.alt = label;
  }
  projectGallery.append(item);
}

function openProjectView(track, slide) {
  const projects = track === topTrack ? topProjects : bottomProjects;
  const slideIndex = Array.from(track.children).indexOf(slide) % projects.length;
  const [name, type, year] = projects[slideIndex];

  closeInfoView();

  setSplit(track === topTrack ? 100 : 0);
  projectMedia.textContent = '';
  projectMedia.classList.toggle('is-color-slide', slide.tagName !== 'IMG');
  if (slide.tagName === 'IMG' || slide.tagName === 'VIDEO') {
    const heroImage = slide.cloneNode(false);
    heroImage.removeAttribute('id');
    heroImage.removeAttribute('style');
    heroImage.draggable = false;
    heroImage.autoplay = true;
    heroImage.muted = true;
    heroImage.loop = true;
    heroImage.playsInline = true;
    projectMedia.style.backgroundImage = 'none';
    projectMedia.style.backgroundColor = 'transparent';
    projectMedia.append(heroImage);
  } else {
    const media = getSlideBackground(slide);
    projectMedia.style.backgroundImage = media.image;
    projectMedia.style.backgroundColor = media.color;
  }
  projectName.textContent = name;
  projectType.textContent = type;
  projectYear.textContent = year;
  projectDetailCopy.textContent = projectDescriptions[name]
    || `${name} ist ein Projekt im Bereich ${type}. Hier kannst du später längere Projekttexte, Credits, Prozessnotizen und weitere Informationen ergänzen.`;

  projectGallery.textContent = '';
  if (projectGalleryImages[name]) {
    projectGalleryImages[name].forEach((src, index) => {
      addGalleryMedia(src, `${name} ${index + 1}`);
    });
  } else {
    const trackSlides = Array.from(track.children);
    for (let index = 0; index < Math.min(4, projects.length); index += 1) {
      addGalleryItem(trackSlides[(slideIndex + index) % projects.length]);
    }
  }

  projectView.hidden = false;
  projectView.scrollLeft = 0;
  projectView.previousScrollLeft = 0;
  projectScrollHint.textContent = '\u2192';
  resetProjectDetail();
  portfolio.classList.add('project-open');
  projectView.classList.toggle('is-bottom-project', track === bottomTrack);
  projectOpen = true;
  projectView.classList.add('is-open');
}

topTrack.addEventListener('click', (event) => {
  const slide = event.target.closest('.color-slide, .keep-photo');
  if (!slide) return;
  openProjectView(topTrack, slide);
});

bottomTrack.addEventListener('click', (event) => {
  const slide = event.target.closest('.color-slide, .keep-photo');
  if (!slide) return;
  if (slide.getAttribute('alt') === 'SBB') return;
  openProjectView(bottomTrack, slide);
});

projectView.addEventListener('click', (event) => {
  if (event.target.closest('.project-detail-text')) return;
  closeProjectView();
});

divider.addEventListener('pointerdown', (event) => {
  if (infoOpen || event.target.closest('button')) return;
  if (projectOpen) closeProjectView(true);
  dragging = true;
  pointerOffset = event.clientY - divider.getBoundingClientRect().top - 10;
  divider.setPointerCapture(event.pointerId);
  divider.classList.add('is-dragging');
  portfolio.classList.add('is-divider-dragging');
});

contactButton.addEventListener('click', () => {
  closeProjectView();
  // navbar reaches the middle first, only then is the CV revealed
  setSplit(50);
  infoOpen = !infoOpen;
  infoView.hidden = !infoOpen;
  portfolio.classList.toggle('info-open', infoOpen);
  setSplit(splitPosition);
  contactButton.setAttribute(
    'aria-label',
    infoOpen ? 'Informationen über Tim Daniel Ruf schließen' : 'Informationen über Tim Daniel Ruf öffnen',
  );
});

function closeInfoView() {
  if (!infoOpen) return;
  infoOpen = false;
  infoView.hidden = true;
  portfolio.classList.remove('info-open');
  setSplit(splitPosition);
  contactButton.setAttribute('aria-label', 'Informationen über Tim Daniel Ruf öffnen');
}

divider.addEventListener('pointermove', (event) => {
  if (dragging) moveDivider(event);
});

divider.addEventListener('pointerup', () => {
  dragging = false;
  divider.classList.remove('is-dragging');
  portfolio.classList.remove('is-divider-dragging');
});

divider.addEventListener('pointercancel', () => {
  dragging = false;
  divider.classList.remove('is-dragging');
  portfolio.classList.remove('is-divider-dragging');
});

visualButton.addEventListener('click', () => {
  closeInfoView();
  closeProjectView();
  setSplit(100);
});
advertisingButton.addEventListener('click', () => {
  closeInfoView();
  closeProjectView();
  setSplit(0);
});

const topProjects = [
  ['Prinzipia Magica', 'Editorial', '2026'],
  ['Supreme Succulents', '3D', '2024'],
  ['Swissmint', 'Coin Design', '2024'],
  ['Adult Content Company', 'Digital Tools', '2026'],
  ['Helden', 'Photography / Editorial', '2025'],
  ['Roche', 'Type Design', '2025'],
  ['Uppercase', 'Editorial', '2025'],
  ['Swisscore', 'Editorial', '2025'],
];
const bottomProjects = [
  ['Ramseier', 'Pitch', '2024'],
  ['Corner Card', 'Branding / Campaign', '2024'],
  ['Micasa', 'Campaign', '2025'],
  ['Greenpeace', 'Campaign', '2026'],
  ['Redbull', 'Stage Design', '2025'],
];

// project-specific descriptions for the "About" panel; falls back to a generic line
const projectDescriptions = {
  'Prinzipia Magica': 'Long before science named the world and religion ordered it, magic already held it together. Principia Magica examines this fundamental understanding of the world. It traces how signs become symbols, symbols become systems, and how these systems reveal the deep structural logic that magical thinking has always carried. Magic is a state of mind, one that grasps the world as one, as a whole, as an integrity – not as a collection of parts, but as a perfectly balanced equilibrium in which everything participates. Not superstition, not mere metaphor: magic is the primordial way of human understanding, older than religion, older than reason. This book points to that logic and follows its thread.',
  'Corner Card': 'Cornèrcard Totally Spoiled Together with the team at INGO Zürich, I worked on a comprehensive brand refresh for Cornèrcard. The new identity builds on the brand’s existing positioning, creating a more personal, tangible and inspiring customer experience. Rather than reinventing the brand, the aim was to sharpen what was already there, translating Cornèrcard’s customer-focused approach into a more contemporary and distinctive visual language, while keeping its core identity intact.',
  Swissmint: '«Sprachenvielfalt» is a commemorative coin by Swissmint dedicated to Switzerland’s four national languages. The design reflects the idea that German, French, Italian and Romansh are equally important parts of the country’s identity and should be represented with the same weight and presence.\nFor the reverse side of the coin, I was responsible for refining and preparing the typography for production. The lettering had to be adjusted with extreme precision so that it remained clear and balanced at the very small scale of a minted object, while still preserving the character of the original design.\nThe project is also representative of my broader work at Swissmint. My responsibilities ranged from packaging design and illustration to marketing materials and the detailed adaptation of graphic and typographic elements for commemorative coins. It gave me the opportunity to work across different scales, from microscopic typographic details on the coin itself to the wider visual communication surrounding it.',
  Swisscore: '«Swiss Core» explores what feels intrinsically Swiss. Beyond familiar national symbols, it focuses on small cultural codes, everyday objects, habits, and visual details that often go unnoticed within Switzerland, yet become distinctly recognizable when seen from the outside.\nSpanning 1291 pages, a reference to the traditional founding year of Switzerland, the book unfolds as an extensive visual archive. Typological image series move between folk culture and pop culture, design classics and mundane objects, traditions, clichés, and unexpected aspects of Swiss everyday life. Through repetition and juxtaposition, familiar images are placed into new and sometimes absurd relationships.\nDeveloped collaboratively with Alisha Summer Stacy and Yannick Gorges, «Swiss Core» is less an attempt to define a single Swiss identity than to collect and examine its many visual expressions. The result is a portrait of Switzerland built from things that may seem ordinary, stereotypical, or insignificant on their own, but together reveal a distinct cultural language.',
  Roche: '«Roche» is a typeface inspired by pharmaceutical packaging, medication labels, and the embossed lettering found directly on tablets. Its monospaced structure reflects the precise and systematic character of medical communication.\nA Braille-based variation explores the connection between visual and tactile reading. The typeface was further developed into a modular dot grid that can also be used to construct molecular diagrams. The result is a visual system that connects typography, accessibility and scientific imagery within one consistent language.',
  'Adult Content Company': 'Adult Content Company explores one of the earliest forms of digital pornography. Images made entirely from text characters. Starting from this peculiar visual language, the project looks at how explicit content is abstracted, distorted, and shaped by the limits of technology.\nAt its core is a custom-built tool that turns this rigid system into a space for experimentation. Rather than simply reproducing pornographic imagery, it plays with its codes, clichés, and visual logic, sometimes seriously and sometimes with a touch of absurdity.\nThrough the tool, the images, and the accompanying XXX Files, the project reveals how digital systems shape the way bodies and sexuality are represented, and what happens when familiar images collapse into pure characters.',
};

const projectGalleryImages = {
  'Prinzipia Magica': [
    'img/PM_01.webp',
    'img/PM_3.webp',
    'img/PM_4.webp',
    'img/PM_5.webp',
    'img/PM_6.webp',
    'img/PM_7.webp',
  ],
  'Corner Card': [
    'img/CC_Brandmovie-4.mp4',
    'img/CC_03.webp',
    'img/CC_05.webp',
    'img/CC_06.webp',
    'img/CC_07.webp',
    'img/CC_09.webp',
  ],
  Swissmint: [

    'img/SM_02.webp',
    'img/SM_03.webp',
  ],
  'Supreme Succulents': [
    'img/Hochformat01.jpg',
    'img/Hochformat02.jpg',
    'img/Hochformat03.jpg',
    'img/Hochformat04.jpg',
  ],
  Helden: [
    'img/HE_02.webp',
    'img/HE_03.webp',
    'img/HE_04.webp',
  ],
  'Adult Content Company': [
    'img/ACC_02.webp',
    'img/ACC_03.webp',
    'img/ACC_04.webp',
    'img/ACC_05.webp',
    'img/Tool.mp4',
  ],
  Uppercase: [
    'img/UP_03.webp',
    'img/UP_04.webp',
    'img/UP_05.webp',
    'img/UP_06.webp',
        'img/01_UP.mp4',

  ],
  Swisscore: [
    'img/SC_02.webp',
    'img/SC_03.webp',
    'img/SC_04.webp',
    'img/SC_05.webp',
    'img/SC_06.webp',
  ],
  Roche: [
    'img/RT_27.webp',
    'img/RT_28.webp',
    'img/RT_29.webp',
    'img/RT_30.webp',
  ],
  Redbull: [
    'img/RB_01.webp',
    'img/RB_03.webp',
    'img/RB_05.webp',

  ],
  Ramseier: [
    'img/RP_09.webp',
    'img/RP_10.webp',
    'img/RP_11.webp',
    'img/RP_12.webp',
    'img/RP_13.webp',
    'img/RP_05.webp',
    'img/RP_02.webp',
  ],
  Micasa: [

    'img/M_12.webp',

    'img/M_05.png',
    'img/M_06.png',
    'img/M_07.png',
    'img/M_14.webp',
  ],
  Greenpeace: [

  

  
    'img/GP_03.webp',
            'img/GP_02.webp',
    'img/GP_54.webp',

      'img/GP_04.webp',
    
  ],

};

const sliderStates = new Map([
  [topTrack, { offset: 0, direction: 1, index: 0 }],
  [bottomTrack, { offset: 0, direction: 1, index: 0 }],
]);

// randomizes slide order on every page load; keeps both loop halves and the matching project data in sync
function shuffleTrackOrder(track, projects) {
  const slideCount = projects.length;
  const slideData = Array.from(track.children)
    .slice(0, slideCount)
    .map((slide) => ({ src: slide.getAttribute('src'), alt: slide.getAttribute('alt') }));

  const order = slideData.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  projects.splice(0, projects.length, ...order.map((index) => projects[index]));

  const allSlides = Array.from(track.children);
  order.forEach((sourceIndex, targetIndex) => {
    const data = slideData[sourceIndex];
    [targetIndex, targetIndex + slideCount].forEach((position) => {
      const slide = allSlides[position];
      slide.setAttribute('src', data.src);
      slide.setAttribute('alt', data.alt);
    });
  });
}
shuffleTrackOrder(topTrack, topProjects);
shuffleTrackOrder(bottomTrack, bottomProjects);

// keeps the initial meta text in sync with topProjects[0] / bottomProjects[0]
function setMeta(prefix, [name, type, year]) {
  document.querySelector(`#${prefix}-project-name`).textContent = name;
  document.querySelector(`#${prefix}-project-type`).textContent = type;
  document.querySelector(`#${prefix}-project-year`).textContent = year;
}
setMeta('top', topProjects[0]);
setMeta('bottom', bottomProjects[0]);

function moveSlider(track, distance) {
  const state = sliderStates.get(track);
  const loopWidth = track.scrollWidth / 2;
  if (!loopWidth) return;

  state.offset = (state.offset + distance * state.direction) % loopWidth;
  if (state.offset < 0) state.offset += loopWidth;
  const offset = track === topTrack ? state.offset - loopWidth : -state.offset;
  track.style.transform = `translateX(${offset}px)`;

  const projects = track === topTrack ? topProjects : bottomProjects;
  const slideWidth = loopWidth / projects.length;
  // top track's transform runs in the opposite direction, so mirror the offset before indexing
  const localOffset = track === topTrack ? loopWidth - state.offset : state.offset;
  const nextIndex = Math.floor((localOffset + slideWidth / 2) / slideWidth) % projects.length;
  if (nextIndex === state.index) return;

  state.index = nextIndex;
  const prefix = track === topTrack ? 'top' : 'bottom';
  setMeta(prefix, projects[nextIndex]);
}

portfolio.addEventListener('wheel', (event) => {
  if (infoOpen || projectOpen) return;
  event.preventDefault();
  const distance = event.deltaY || event.deltaX;
  moveSlider(topTrack, distance);
  moveSlider(bottomTrack, distance);
}, { passive: false });

// animates both tracks forward until they land exactly on the next slide boundary
function getSlideWidth(track) {
  const projects = track === topTrack ? topProjects : bottomProjects;
  const loopWidth = track.scrollWidth / 2;
  return loopWidth ? loopWidth / projects.length : 0;
}

function snapToNextSlide(duration) {
  const slideWidth = getSlideWidth(topTrack);
  if (!slideWidth) return;
  const state = sliderStates.get(topTrack);
  const mod = state.offset % slideWidth;
  const remaining = mod === 0 ? slideWidth : slideWidth - mod;
  const start = performance.now();
  let lastEased = 0;

  function step(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - (1 - progress) ** 3;
    const delta = (eased - lastEased) * remaining;
    lastEased = eased;
    moveSlider(topTrack, delta);
    moveSlider(bottomTrack, delta);
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

const TOUCH_TAP_THRESHOLD = 8;
let touchLastY = null;
let touchMoved = 0;

portfolio.addEventListener('touchstart', (event) => {
  mobileHintCancelled = true;
  if (infoOpen || projectOpen) return;
  touchLastY = event.touches[0].clientY;
  touchMoved = 0;
}, { passive: true });

portfolio.addEventListener('touchmove', (event) => {
  if (infoOpen || projectOpen || touchLastY === null) return;
  const currentY = event.touches[0].clientY;
  const distance = Math.abs(touchLastY - currentY);
  touchLastY = currentY;
  if (!distance) return;
  touchMoved += distance;
  // any swipe direction advances forward, tracking the finger live for instant feedback
  moveSlider(topTrack, distance);
  moveSlider(bottomTrack, distance);
}, { passive: true });

portfolio.addEventListener('touchend', () => {
  const wasSwipe = touchMoved >= TOUCH_TAP_THRESHOLD;
  touchLastY = null;
  touchMoved = 0;
  // settle onto the next full slide with a bit of momentum after the finger lifts
  if (wasSwipe) snapToNextSlide(320);
});

// on first load on mobile, slowly auto-scrolls the sliders for a bit to hint that they're interactive
let mobileHintCancelled = false;

function animateMobileSliderHint(duration) {
  const speed = 26; // px per second, deliberately slow
  const start = performance.now();
  let lastTime = start;

  function step(now) {
    if (mobileHintCancelled || infoOpen || projectOpen) return;
    const distance = (speed * (now - lastTime)) / 1000;
    lastTime = now;
    moveSlider(topTrack, distance);
    moveSlider(bottomTrack, distance);
    if (now - start < duration) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}



// hints that the navbar is draggable: a tiny nudge on hover when it rests at the top or bottom
const NUDGE_DISTANCE = 24;

// offsetAt maps 0..1 progress to a percentage-point offset from the resting split
function animateDivider(offsetAt, duration) {
  const basePosition = splitPosition;
  const viewportHeight = portfolio.clientHeight;
  const start = performance.now();

  function step(now) {
    if (dragging) {
      setSplit(basePosition);
      return;
    }
    const progress = Math.min(1, (now - start) / duration);
    const percentOffset = (offsetAt(progress) / viewportHeight) * 100;
    setSplit(basePosition + percentOffset);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      setSplit(basePosition);
    }
  }

  requestAnimationFrame(step);
}

divider.addEventListener('mouseenter', (event) => {
  if (infoOpen || projectOpen || dragging) return;
  if (splitPosition !== 0 && splitPosition !== 100) return;
  // ignore hovers on the buttons/links inside the navbar
  if (event.target.closest('button, a')) return;

  const direction = splitPosition === 0 ? 1 : -1;
  animateDivider(
    (progress) => Math.sin(progress * Math.PI) * NUDGE_DISTANCE * direction,
    500,
  );
});

// types a string into an element one character at a time, resolves when done
function typeText(el, text, speed) {
  return new Promise((resolve) => {
    el.textContent = '';
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i >= text.length) {
        window.clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function playIntro() {
  const nameEl = document.querySelector('.contact-name-button strong');
  const phoneEl = document.querySelector('.contact-controls > span');
  const emailEl = document.querySelector('.email-button');
  const visualFull = document.querySelector('.visual-button .label-full');
  const visualShort = document.querySelector('.visual-button .label-short');
  const advertisingFull = document.querySelector('.advertising-button .label-full');
  const advertisingShort = document.querySelector('.advertising-button .label-short');

  const texts = [nameEl, phoneEl, emailEl, visualFull, visualShort, advertisingFull, advertisingShort]
    .map((el) => [el, el.textContent]);
  texts.forEach(([el]) => { el.textContent = ''; });

  await wait(300);
  await typeText(nameEl, texts[0][1], 22);
  await typeText(phoneEl, texts[1][1], 18);
  await typeText(emailEl, texts[2][1], 16);

  await wait(250);
  await Promise.all([
    typeText(visualFull, texts[3][1], 18),
    typeText(visualShort, texts[4][1], 18),
    typeText(advertisingFull, texts[5][1], 18),
    typeText(advertisingShort, texts[6][1], 18),
  ]);

  await wait(200);
  portfolio.classList.add('intro-ready');

  if (window.matchMedia('(max-width: 700px)').matches) {
    animateMobileSliderHint(5000);
  }
}

playIntro();
