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

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      if (navMenu && navMenu.classList.contains("show") && window.bootstrap) {
        window.bootstrap.Collapse.getOrCreateInstance(navMenu).hide();
      }
    });
  });

  const hero = document.getElementById("home");

  if (hero && window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion) {
    let spotlightFrame = null;

    hero.addEventListener("pointermove", function (event) {
      if (spotlightFrame) return;

      spotlightFrame = requestAnimationFrame(function () {
        const rect = hero.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty("--mx", x.toFixed(2) + "%");
        hero.style.setProperty("--my", y.toFixed(2) + "%");
        spotlightFrame = null;
      });
    });

    hero.addEventListener("pointerleave", function () {
      hero.style.removeProperty("--mx");
      hero.style.removeProperty("--my");
    });
  }

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

  const typedRole = document.getElementById("typedRole");
  const roles = ["BSIT Student", "Aspiring Web Developer", "Front-End Enthusiast", "Problem Solver"];

  if (typedRole) {
    if (prefersReducedMotion) {
      typedRole.textContent = roles[0];
    } else {
      let roleIndex = 0;
      let charIndex = roles[0].length;
      let deleting = false;

      function typeLoop() {
        const current = roles[roleIndex];
        let delay = deleting ? 45 : 85;

        if (deleting) {
          charIndex--;
        } else {
          charIndex++;
        }

        typedRole.textContent = current.slice(0, charIndex);

        if (!deleting && charIndex === current.length) {
          deleting = true;
          delay = 1900;
        } else if (deleting && charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          delay = 350;
        }

        window.setTimeout(typeLoop, delay);
      }

      window.setTimeout(function () {
        deleting = true;
        typeLoop();
      }, 2200);
    }
  }

  const contactForm = document.getElementById("contactForm");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");
  const toastIcon = toast ? toast.querySelector("i") : null;
  let toastTimer;

  function showToast(message, isError) {
    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.add("show");

    if (toastIcon) {
      toastIcon.className = isError ? "bi bi-exclamation-circle-fill" : "bi bi-check-circle-fill";
      toastIcon.style.color = isError ? "#f87171" : "";
    }

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 4200);
  }

  if (contactForm) {
    const fields = Array.from(contactForm.querySelectorAll("input, textarea"));

    fields.forEach(function (field) {
      field.addEventListener("input", function () {
        field.classList.remove("is-invalid");
      });
    });

    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      let isValid = true;

      fields.forEach(function (field) {
        if (!field.checkValidity()) {
          field.classList.add("is-invalid");
          isValid = false;
        } else {
          field.classList.remove("is-invalid");
        }
      });

      if (!isValid) {
        const firstInvalid = contactForm.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        showToast("Please complete the highlighted fields.", true);
        return;
      }

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const subject = document.getElementById("subject").value.trim();
      const message = document.getElementById("message").value.trim();

      const body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;
      const mailtoLink =
        "mailto:hello@example.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      showToast("Opening your email app to send the message...", false);

      window.setTimeout(function () {
        window.location.href = mailtoLink;
        contactForm.reset();
      }, 600);
    });
  }
})();
