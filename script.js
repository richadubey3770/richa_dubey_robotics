const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav-list a")];
const progressBar = document.querySelector(".scroll-progress");
const topButton = document.querySelector(".back-to-top");
const quickAccess = document.querySelector(".quick-access");
const quickAccessPlaceholder = document.createElement("div");
const revealItems = [...document.querySelectorAll(".reveal")];
const quickAccessTop = 12;
let quickAccessPinStart = 0;

if (quickAccess) {
  quickAccessPlaceholder.className = "quick-access-placeholder";
  quickAccess.setAttribute("data-pin-ready", "true");
  quickAccess.before(quickAccessPlaceholder);
}

function updateQuickAccessOffset() {
  if (!quickAccess) {
    return;
  }

  const offset = Math.ceil(quickAccess.getBoundingClientRect().height + 24);
  document.documentElement.style.setProperty("--quick-access-offset", `${offset}px`);
}

function measureQuickAccessPin() {
  if (!quickAccess) {
    return;
  }

  const wasPinned = quickAccess.classList.contains("is-pinned");
  quickAccess.classList.remove("is-pinned");
  quickAccessPlaceholder.classList.remove("is-active");

  const height = Math.ceil(quickAccess.getBoundingClientRect().height);
  quickAccessPlaceholder.style.height = `${height}px`;
  quickAccessPinStart = window.scrollY + quickAccess.getBoundingClientRect().top - quickAccessTop;
  updateQuickAccessOffset();

  if (wasPinned) {
    updateQuickAccessPin();
  }
}

function updateQuickAccessPin() {
  if (!quickAccess) {
    return;
  }

  const shouldPin = window.scrollY >= quickAccessPinStart;
  quickAccess.classList.toggle("is-pinned", shouldPin);
  quickAccessPlaceholder.classList.toggle("is-active", shouldPin);
}

if (quickAccess && "ResizeObserver" in window) {
  const quickAccessObserver = new ResizeObserver(measureQuickAccessPin);
  quickAccessObserver.observe(quickAccess);
}

window.addEventListener("resize", measureQuickAccessPin);
window.addEventListener("load", measureQuickAccessPin);
measureQuickAccessPin();

if (sections.length && navLinks.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -40% 0px", threshold: 0.05 }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.08 }
);

revealItems.forEach((item) => revealObserver.observe(item));

function onScroll() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollHeight =
    document.documentElement.scrollHeight - document.documentElement.clientHeight;
  updateQuickAccessPin();
  if (progressBar) {
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  }
  if (topButton) {
    topButton.classList.toggle("show", scrollTop > 380);
  }
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

if (topButton) {
  topButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
