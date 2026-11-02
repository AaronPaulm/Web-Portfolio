(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navbar = document.getElementById("siteNav");
  const navMenu = document.getElementById("navMenu");
  const navLinks = Array.from(document.querySelectorAll(".site-nav .nav-link"));
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const progressBar = document.getElementById("scrollProgress");
  const toTop = document.getElementById("toTop");
  const year = document.getElementById("year");
  const themeToggle = document.getElementById("themeToggle");
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function updateThemeControls(theme) {
    if (!themeToggle) return;

    const target = theme === "dark" ? "light" : "dark";
    themeToggle.setAttribute("aria-label", "Switch to " + target + " mode");
    themeToggle.setAttribute("title", "Switch to " + target + " mode");
    themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-bs-theme", theme);
    updateThemeControls(theme);

    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", theme === "dark" ? "#0F172A" : "#F4F7FB");
    }

    try {
      localStorage.setItem("portfolio-theme", theme);
    } catch (error) {}
  }

  updateThemeControls(getTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(getTheme() === "dark" ? "light" : "dark");
      themeToggle.classList.remove("is-spinning");
      void themeToggle.offsetWidth;
      themeToggle.classList.add("is-spinning");
      window.setTimeout(function () {
        themeToggle.classList.remove("is-spinning");
      }, 520);
    });
  }

  function onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (navbar) {
      navbar.classList.toggle("scrolled", scrollTop > 24);
    }

    if (progressBar) {
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + "%";
    }

    if (toTop) {
      toTop.classList.toggle("show", scrollTop > 500);
    }

    updateActiveLink(scrollTop);
  }

  function updateActiveLink(scrollTop) {
    if (!sections.length || !navLinks.length) return;

    const offset = scrollTop + 150;
    let currentId = sections[0].id;
    let atBottom = window.innerHeight + scrollTop >= document.documentElement.scrollHeight - 4;

    sections.forEach(function (section) {
      if (section.offsetTop <= offset) {
        currentId = section.id;
      }
    });

    if (atBottom) {
      currentId = sections[sections.length - 1].id;
    }

    navLinks.forEach(function (link) {
      const isActive = link.getAttribute("href") === "#" + currentId;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  const imageViewer = document.getElementById("imageViewer");
  const imageViewerImage = document.getElementById("imageViewerImage");
  const imageViewerCaption = document.getElementById("imageViewerCaption");
  const imageViewerClose = document.getElementById("imageViewerClose");
  const projectImageTriggers = document.querySelectorAll(".project-image-trigger");

  if (imageViewer && imageViewerImage && imageViewerCaption && imageViewerClose) {
    projectImageTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        const image = trigger.querySelector("img");
        if (!image) return;

        imageViewerImage.src = image.currentSrc || image.src;
        imageViewerImage.alt = image.alt;
        imageViewerCaption.textContent = image.alt;
        imageViewer.showModal();
        imageViewerClose.focus();
      });
    });

    imageViewerClose.addEventListener("click", function () {
      imageViewer.close();
    });

    imageViewer.addEventListener("click", function (event) {
      if (event.target === imageViewer) {
        imageViewer.close();
      }
    });
  }

  const contactForm = document.getElementById("contactForm");
  const contactFormStatus = document.getElementById("contactFormStatus");

  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!contactForm.reportValidity()) return;

      const formData = new FormData(contactForm);
      const subject = String(formData.get("subject")).trim();
      const body = [
        "Name: " + String(formData.get("name")).trim(),
        "Email: " + String(formData.get("email")).trim(),
        "",
        String(formData.get("message")).trim()
      ].join("\n");
      const mailto = "mailto:aaronpaulmagdaong2@gmail.com"
        + "?subject=" + encodeURIComponent(subject)
        + "&body=" + encodeURIComponent(body);

      if (contactFormStatus) {
        contactFormStatus.textContent = "If your email app doesn't open, email aaronpaulmagdaong2@gmail.com directly.";
      }

      window.location.href = mailto;
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (navMenu && navMenu.classList.contains("show") && window.bootstrap) {
        window.bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
      }
    });
  });

  const revealElements = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach(function (el) {
      el.classList.add("is-visible");
    });
    animateCounters();
  } else {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        let revealIndex = 0;

        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = Math.min(revealIndex * 80, 320) + "ms";
            revealIndex++;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });

    const statsCard = document.querySelector(".stats-card");
    if (statsCard) {
      const statsObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounters();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.4 }
      );
      statsObserver.observe(statsCard);
    }
  }

  function animateCounters() {
    const counters = document.querySelectorAll("[data-count]");

    counters.forEach(function (counter) {
      const target = parseInt(counter.getAttribute("data-count"), 10);
      if (isNaN(target)) return;

      if (prefersReducedMotion) {
        counter.textContent = target;
        return;
      }

      const duration = 1400;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(target * eased);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(tick);
    });
  }

})();
