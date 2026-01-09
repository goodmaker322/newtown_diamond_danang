/* ================= AOS ================= */
if (typeof AOS !== "undefined") {
  AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
    disable: window.innerWidth < 768,
  });
}

/* ================= NAVBAR SCROLL ================= */
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

/* ================= URL ROUTING + SCROLL ================= */
function getNavbarOffset() {
  return document.querySelector(".navbar")?.offsetHeight || 80;
}

function scrollToRoute(route, push = true) {
  const section = document.querySelector(`[data-route="${route}"]`);
  if (!section) return;

  window.scrollTo({
    top: section.offsetTop - getNavbarOffset(),
    behavior: "smooth",
  });

  if (push) {
    history.pushState({}, "", "/" + route);
  }

  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));
  const active = document.querySelector(`.nav-link[href="/${route}"]`);
  if (active) active.classList.add("active");
}

/* CLICK MENU */
document.querySelectorAll('.nav-link[href^="/"]').forEach((link) => {
  link.addEventListener("click", function (e) {
    const route = this.getAttribute("href").replace("/", "");
    if (!route || route === "tong-quan") return;
    e.preventDefault();
    scrollToRoute(route, true);
  });
});

/* LOAD / RELOAD */
window.addEventListener("DOMContentLoaded", () => {
  const route = location.pathname.replace("/", "");
  if (route) {
    setTimeout(() => scrollToRoute(route, false), 200);
  }
});

/* BACK / FORWARD */
window.addEventListener("popstate", () => {
  const route = location.pathname.replace("/", "");
  if (route) scrollToRoute(route, false);
});

/* ================= BACK TO TOP ================= */
const backToTopButton = document.querySelector(".back-to-top");
if (backToTopButton) {
  window.addEventListener("scroll", () => {
    backToTopButton.classList.toggle("active", window.scrollY > 300);
  });

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ================= LIGHTBOX ================= */
if (typeof lightbox !== "undefined") {
  lightbox.option({
    resizeDuration: 200,
    wrapAround: true,
    albumLabel: "Hình %1 / %2",
  });
}

/* ================= VIDEO LAZY LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {
  const iframe = document.querySelector(".video-container iframe");
  if (!iframe) return;

  const src = iframe.src;
  iframe.src = "";

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        iframe.src = src;
        observer.disconnect();
      }
    },
    { rootMargin: "50px" }
  );

  observer.observe(iframe);
});

/* ================= ENHANCED TRACKING FUNCTIONS ================= */

// Track Google Ads Conversion (CHỈ GỌI 1 LẦN)
function trackLeadConversion(source = "popup_form") {
  console.log("📊 Tracking conversion from:", source);

  // Google Ads Conversion
  if (typeof gtag !== "undefined") {
    gtag("event", "conversion", {
      send_to: "AW-868128598/oKIICPrm_9wbENau-p0D",
      value: 1.0,
      currency: "VND",
      transaction_id: "LEAD_" + Date.now() + "_" + source,
    });
  }

  // GA4 Event
  if (typeof gtag !== "undefined") {
    gtag("event", "generate_lead", {
      event_category: "Lead Generation",
      event_label: source,
      method: "Form Submission",
    });
  }

  return true;
}

// Track Phone Call Conversion
function trackPhoneConversion(phoneNumber) {
  if (typeof gtag !== "undefined") {
    gtag("event", "conversion", {
      send_to: "AW-868128598/4o0pCNjBr90bENau-p0D",
      value: 1.0,
      currency: "VND",
      phone_number: phoneNumber,
    });

    // GA4 Event
    gtag("event", "phone_click", {
      event_category: "Contact",
      event_label: "Phone Call",
      phone_number: phoneNumber,
    });
  }
  return false; // Cho phép chuyển tiếp đến số điện thoại
}

// Track Zalo Click
function trackZaloClick() {
  if (typeof gtag !== "undefined") {
    gtag("event", "zalo_click", {
      event_category: "Contact",
      event_label: "Zalo Chat",
    });
  }
  return true;
}

// Track Button CTA Click
function trackButtonClick(buttonText, location = "unknown") {
  if (typeof gtag !== "undefined") {
    gtag("event", "cta_click", {
      event_category: "CTA",
      event_label: buttonText,
      button_location: location,
    });
  }
}

// Track Scroll Depth
function initScrollTracking() {
  let trackedPercentages = [];
  const percentages = [25, 50, 75, 90, 100];

  window.addEventListener("scroll", function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = (scrollTop / scrollHeight) * 100;

    percentages.forEach((percent) => {
      if (scrolled >= percent && !trackedPercentages.includes(percent)) {
        trackedPercentages.push(percent);

        if (typeof gtag !== "undefined") {
          gtag("event", "scroll_depth", {
            event_category: "Engagement",
            event_label: "Page Scroll",
            value: percent,
          });
        }
      }
    });
  });
}

/* ================= LEAD POPUP ================= */
document.addEventListener("DOMContentLoaded", () => {
  const popupKey = "newtown_popup_shown_v2";
  const leadPopup = document.getElementById("leadPopup");
  const leadForm = document.getElementById("leadForm");
  const leadSuccess = document.getElementById("leadSuccess");
  const closeButtons = document.querySelectorAll(
    ".lead-popup-close, #closeSuccess"
  );

  if (!leadPopup || !leadForm || !leadSuccess) return;

  function showPopup() {
    if (sessionStorage.getItem(popupKey)) return;

    leadForm.style.display = "block";
    leadSuccess.style.display = "none";

    leadPopup.style.display = "block";
    document.body.style.overflow = "hidden";

    // Track popup open
    if (typeof gtag !== "undefined") {
      gtag("event", "popup_open", {
        event_category: "Engagement",
        event_label: "Lead Popup",
      });
    }
  }

  function closePopup() {
    leadPopup.style.display = "none";
    document.body.style.overflow = "auto";
    sessionStorage.setItem(popupKey, "true");
  }

  closeButtons.forEach((btn) => btn.addEventListener("click", closePopup));

  leadPopup.addEventListener("click", (e) => {
    if (e.target === leadPopup) closePopup();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
  });

  /* ===== Trigger popup khi tới vị trí ===== */
  const locationSection = document.getElementById("location");
  if (locationSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          showPopup();
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(locationSection);
  }

  /* ================= FORM SUBMIT – FORMSPREE ================= */
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/myzrvzwv";

  leadForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Track form start (optional)
    if (typeof gtag !== "undefined") {
      gtag("event", "form_start", {
        event_category: "Form",
        event_label: "Lead Popup Form",
      });
    }

    const formData = new FormData(this);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Formspree failed");

      // CHỈ GỌI TRACKING 1 LẦN DUY NHẤT Ở ĐÂY
      trackLeadConversion("popup_form");

      // Track successful submission in GA4
      if (typeof gtag !== "undefined") {
        gtag("event", "form_submit_success", {
          event_category: "Form",
          event_label: "Lead Popup Form",
          form_name: "lead_popup",
        });
      }

      leadForm.style.display = "none";
      leadSuccess.style.display = "block";
      leadForm.reset();
    } catch (err) {
      console.error("❌ Formspree error:", err);

      // Track form error
      if (typeof gtag !== "undefined") {
        gtag("event", "form_error", {
          event_category: "Form",
          event_label: "Lead Popup Form",
          error_type: "submission_failed",
        });
      }

      alert("Gửi thông tin thất bại. Vui lòng thử lại.");
    }
  });

  /* ===== Public trigger ===== */
  window.openLeadPopup = () => {
    sessionStorage.removeItem(popupKey);
    showPopup();

    // Track manual popup open
    trackButtonClick("Manual Popup Open", "floating_button");
  };
});

// Open lead popup for testing
window.testLeadPopup = function () {
  const popup = document.getElementById("leadPopup");
  const form = document.getElementById("leadForm");
  const success = document.getElementById("leadSuccess");

  if (!popup) return;

  popup.style.display = "block";
  document.body.style.overflow = "hidden";

  if (form) form.style.display = "block";
  if (success) success.style.display = "none";

  // Track test popup
  trackButtonClick("Test Popup Button", "fixed_button");
};

/* ================= IMAGE ZOOM MODAL ================= */
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const closeBtn = modal?.querySelector(".close");

  if (!modal || !modalImg || !closeBtn) return;

  document.querySelectorAll("img.zoomable").forEach((img) => {
    img.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "block";
      modalImg.src = img.src;
      document.body.style.overflow = "hidden";

      // Track image zoom
      if (typeof gtag !== "undefined") {
        gtag("event", "image_zoom", {
          event_category: "Engagement",
          event_label: img.alt || "Unknown Image",
        });
      }
    });
  });

  closeBtn.onclick = () => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  };

  modal.onclick = (e) => {
    if (e.target === modal) closeBtn.onclick();
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeBtn.onclick();
  });
});

/* ================= CONTACT FORM ================= */
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Track form start
    if (typeof gtag !== "undefined") {
      gtag("event", "form_start", {
        event_category: "Form",
        event_label: "Contact Form",
      });
    }

    const data = new FormData(contactForm);

    try {
      const res = await fetch("https://formspree.io/f/myzrvzwv", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("Formspree error");

      // KHÔNG GỌI trackLeadConversion() Ở ĐÂY NỮA
      // Chỉ track GA4 event
      if (typeof gtag !== "undefined") {
        gtag("event", "form_submit_success", {
          event_category: "Form",
          event_label: "Contact Form",
          form_name: "contact_form",
        });

        gtag("event", "generate_lead", {
          event_category: "Lead Generation",
          event_label: "contact_form",
          method: "Contact Form",
        });
      }

      alert("Gửi thông tin thành công");
      contactForm.reset();
    } catch (err) {
      console.error(err);

      // Track form error
      if (typeof gtag !== "undefined") {
        gtag("event", "form_error", {
          event_category: "Form",
          event_label: "Contact Form",
          error_type: "submission_failed",
        });
      }

      alert("Gửi thất bại, vui lòng thử lại");
    }
  });
}

/* ================= SMOOTH SCROLL FOR ANCHORS ================= */
document.querySelectorAll(".js-scroll").forEach((link) => {
  link.addEventListener("click", function (e) {
    const path = this.getAttribute("href").replace("/", "");
    const target = document.getElementById(path);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
      history.pushState(null, "", "/" + path);

      // Track anchor click
      trackButtonClick("Explore Project Button", "hero_section");
    }
  });
});

/* ================= ENHANCED CLICK TRACKING ================= */
document.addEventListener("DOMContentLoaded", function () {
  // Track all CTA button clicks
  document
    .querySelectorAll('button[onclick*="openLeadPopup"]')
    .forEach((btn) => {
      btn.addEventListener("click", function () {
        const buttonText = this.textContent.trim().substring(0, 30);
        const section = this.closest("section")?.id || "unknown";
        trackButtonClick(buttonText, section);
      });
    });

  // Track phone clicks with enhanced tracking
  document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      const phoneNumber = this.href.replace("tel:", "");
      trackPhoneConversion(phoneNumber);

      // Allow default action after tracking
      setTimeout(() => {
        // Navigation will happen naturally
      }, 300);
    });
  });

  // Track Zalo clicks
  document.querySelectorAll('a[href*="zalo.me"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      trackZaloClick();

      // Open in new tab for external links
      if (this.target === "_blank") {
        e.preventDefault();
        trackZaloClick();
        setTimeout(() => {
          window.open(this.href, "_blank");
        }, 200);
      }
    });
  });

  // Track footer form submission
  const footerForm = document.getElementById("footerForm");
  if (footerForm) {
    footerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Simple tracking for newsletter signup
      if (typeof gtag !== "undefined") {
        gtag("event", "newsletter_signup", {
          event_category: "Subscription",
          event_label: "Footer Newsletter",
        });
      }

      alert("Cảm ơn bạn đã đăng ký nhận tin!");
      this.reset();
    });
  }

  // Initialize scroll tracking
  initScrollTracking();

  // Track page view with additional parameters
  if (typeof gtag !== "undefined") {
    setTimeout(() => {
      gtag("event", "page_view_enhanced", {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        engagement_time: 1,
      });
    }, 1000);
  }
});

// Enhanced call tracking function (for floating button)
window.gtag_report_conversion_call = function (url) {
  var callback = function () {
    if (typeof url !== "undefined") {
      window.location = url;
    }
  };

  if (typeof gtag !== "undefined") {
    gtag("event", "conversion", {
      send_to: "AW-868128598/4o0pCNjBr90bENau-p0D",
      value: 1.0,
      currency: "VND",
      event_callback: callback,
    });

    // Additional GA4 tracking
    gtag("event", "phone_call_floating", {
      event_category: "Contact",
      event_label: "Floating Call Button",
    });
  }

  return false;
};

/* ================= PERFORMANCE OPTIMIZATION ================= */
// Lazy load images that are not in viewport
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
        }
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}
