// Initialize AOS
AOS.init({
  duration: 1000,
  once: true,
  offset: 100,
  disable: window.innerWidth < 768, // Disable on mobile
});

// Navbar scroll effect
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: "smooth",
      });

      // Update active nav link
      document.querySelectorAll(".nav-link").forEach((link) => {
        link.classList.remove("active");
      });
      this.classList.add("active");
    }
  });
});

// Back to top button
const backToTopButton = document.querySelector(".back-to-top");

window.addEventListener("scroll", function () {
  if (window.scrollY > 300) {
    backToTopButton.classList.add("active");
  } else {
    backToTopButton.classList.remove("active");
  }
});

backToTopButton.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// Google Apps Script URL - ĐÃ THAY THẾ Sheet.Best
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzCCxH2kuEx9o6Vu8C222Nggmv25d_huW7eltCQ11n0Dc3nNRwZTg_54KrWX9j44lrz/exec";

// ========== FORM SUBMISSION - CONTACT FORM ==========
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form values
    const formData = {
      Timestamp: new Date().toLocaleString("vi-VN"),
      Name: this.querySelector('input[type="text"]').value.trim(),
      Phone: this.querySelector('input[type="tel"]').value.trim(),
      Email:
        this.querySelector('input[type="email"]').value.trim() || "Không có",
      Type: this.querySelector("select").value || "Không chọn",
      Note: this.querySelector("textarea").value.trim() || "Không có",
      Source: "Contact Form Footer",
    };

    // Validation
    if (!formData.Name || !formData.Phone) {
      alert("Vui lòng điền đầy đủ họ tên và số điện thoại!");
      return;
    }

    const phoneRegex = /^(0|\+84)(\d{9,10})$/;
    if (!phoneRegex.test(formData.Phone)) {
      alert("Vui lòng nhập số điện thoại hợp lệ (10-11 số)");
      return;
    }

    // Show loading state
    const submitBtn = this.querySelector("button[type='submit']");
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Đang gửi...';
    submitBtn.disabled = true;

    try {
      // Submit to Google Apps Script - ĐÃ THAY THẾ
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([formData]),
      });

      if (response.ok) {
        alert(
          "✅ Gửi thành công! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất."
        );
        this.reset();
        console.log("📤 Contact form submitted:", formData);
      } else {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("❌ Contact form error:", error);
      alert(
        "⚠️ Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hotline trực tiếp."
      );

      // Save to localStorage for retry
      saveToLocalStorage(formData, "contact");
    } finally {
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

// ========== LOCAL STORAGE BACKUP ==========
function saveToLocalStorage(data, formType) {
  try {
    const pending = JSON.parse(
      localStorage.getItem("pendingSubmissions") || "[]"
    );
    pending.push({
      data: data,
      timestamp: new Date().toISOString(),
      formType: formType,
      attempts: 0,
    });
    localStorage.setItem("pendingSubmissions", JSON.stringify(pending));
    console.log("💾 Saved to localStorage:", data);
  } catch (e) {
    console.error("LocalStorage error:", e);
  }
}

// ========== AUTO RETRY FUNCTION ==========
async function retryPendingSubmissions() {
  try {
    const pending = JSON.parse(
      localStorage.getItem("pendingSubmissions") || "[]"
    );
    if (pending.length === 0) return;

    console.log(`🔄 Retrying ${pending.length} pending submissions...`);

    const successfulIndices = [];

    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      if (item.attempts >= 3) continue;

      try {
        // Retry to Google Apps Script - ĐÃ THAY THẾ
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([item.data]), // Đã sửa: gửi dạng mảng
        });

        if (response.ok) {
          successfulIndices.push(i);
          console.log(`✅ Resubmitted successfully:`, item.data);
        } else {
          item.attempts++;
        }
      } catch (error) {
        item.attempts++;
      }
    }

    // Remove successful submissions
    if (successfulIndices.length > 0) {
      successfulIndices.reverse().forEach((index) => {
        pending.splice(index, 1);
      });
      localStorage.setItem("pendingSubmissions", JSON.stringify(pending));
    }
  } catch (e) {
    console.error("Retry error:", e);
  }
}

// Auto retry when online
window.addEventListener("online", retryPendingSubmissions);
if (navigator.onLine) {
  setTimeout(retryPendingSubmissions, 3000);
}

// Lightbox configuration
if (typeof lightbox !== "undefined") {
  lightbox.option({
    resizeDuration: 200,
    wrapAround: true,
    albumLabel: "Hình %1 / %2",
  });
}

// Lazy loading images
// Add event listener for images in the overview section - FIXED VERSION
document.addEventListener("DOMContentLoaded", function () {
  // Get all images in content-box (overview section) that should NOT have lightbox
  const overviewImages = document.querySelectorAll(
    ".content-box img.zoomable:not([data-lightbox])"
  );

  overviewImages.forEach(function (img) {
    // Remove existing click handlers
    img.onclick = null;

    img.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      // Prevent lightbox from opening
      const parentLink = this.closest("a[data-lightbox]");
      if (parentLink) {
        parentLink.style.pointerEvents = "none";
        setTimeout(() => {
          parentLink.style.pointerEvents = "auto";
        }, 100);
      }

      openLeadPopup(e);
      return false;
    });
  });

  // Initialize lightbox only for elements with data-lightbox
  if (typeof lightbox !== "undefined") {
    // Re-initialize lightbox
    lightbox.option({
      resizeDuration: 200,
      wrapAround: true,
      albumLabel: "Hình %1 / %2",
    });
  }
});

// Video lazy loading
document.addEventListener("DOMContentLoaded", function () {
  const videoIframe = document.querySelector(".video-container iframe");
  if (videoIframe) {
    // Set a placeholder src initially
    const originalSrc = videoIframe.src;
    videoIframe.src = "";

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoIframe.src = originalSrc;
            videoObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "50px" }
    );

    videoObserver.observe(videoIframe);
  }
});

// Optimize scroll performance
let scrollTimeout;
window.addEventListener("scroll", function () {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(function () {
    // Code to run after scrolling stops
  }, 100);
});

// Image Modal Functionality - FIXED VERSION
document.addEventListener("DOMContentLoaded", function () {
  // Get the modal elements
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const captionText = document.getElementById("caption");
  const closeBtn = document.querySelector(".modal .close");

  // Get all zoomable images
  const zoomableImages = document.querySelectorAll(".zoomable");

  // Add click event to each zoomable image
  zoomableImages.forEach(function (img) {
    img.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Check if parent has lightbox (prevent conflict)
      const parentLink = this.closest("a[data-lightbox]");
      if (parentLink) {
        // Only prevent default for images that should use modal
        parentLink.addEventListener(
          "click",
          function (e) {
            e.preventDefault();
          },
          { once: true }
        );
      }

      modal.style.display = "block";
      modalImg.src = this.src;
      modalImg.alt = this.alt;
      captionText.innerHTML = this.alt;
    });
  });

  // When the user clicks on <span> (x), close the modal
  closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  // When the user clicks anywhere outside of the modal image, close it
  modal.addEventListener("click", function (event) {
    if (event.target === this) {
      modal.style.display = "none";
    }
  });

  // Close modal with ESC key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.style.display === "block") {
      modal.style.display = "none";
    }
  });
});

// Lead Capture Popup Script - FIXED VERSION
document.addEventListener("DOMContentLoaded", function () {
  // Configuration
  const popupShownKey = "newtown_popup_shown_v2"; // Version để reset

  // Elements
  const leadPopup = document.getElementById("leadPopup");
  const leadForm = document.getElementById("leadForm");
  const leadSuccess = document.getElementById("leadSuccess");
  const closeButtons = document.querySelectorAll(
    ".lead-popup-close, #closeSuccess"
  );

  // ========== POPUP DISPLAY LOGIC ==========
  function showLeadPopup() {
    // Kiểm tra xem đã hiện popup trong session này chưa
    if (!sessionStorage.getItem(popupShownKey)) {
      setTimeout(() => {
        leadPopup.style.display = "block";
        document.body.style.overflow = "hidden";
        // Prevent layout shift when scrollbar disappears
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;
        if (scrollbarWidth > 0) {
          document.body.style.paddingRight = scrollbarWidth + "px";
        }
      }, 1500); // Delay 1.5s để user có thời gian xem content
    }
  }

  function closeLeadPopup() {
    leadPopup.style.display = "none";
    document.body.style.overflow = "auto";
    document.body.style.paddingRight = "";
    sessionStorage.setItem(popupShownKey, "true");
  }

  // ========== TRIGGER POPUP ON LOCATION SECTION ==========
  const locationSection = document.getElementById("location");
  if (locationSection) {
    let hasTriggered = false;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.3 &&
            !hasTriggered
          ) {
            hasTriggered = true;
            showLeadPopup();
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: [0.3, 0.5, 0.7], // Multiple thresholds
        rootMargin: "0px 0px -100px 0px", // Trigger a bit earlier
      }
    );

    observer.observe(locationSection);
  }

  // ========== FORM SUBMISSION HANDLER ==========
  leadForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form values
    const formData = {
      Timestamp: new Date().toLocaleString("vi-VN"),
      Name: document.getElementById("leadName").value.trim(),
      Phone: document.getElementById("leadPhone").value.trim(),
      Email: document.getElementById("leadEmail").value.trim() || "Không có",
      Interest: document.getElementById("leadInterest").value,
      Type: document.getElementById("leadType").value || "Không chọn",
      Purpose: document.getElementById("leadPurpose").value,
      Note: document.getElementById("leadNote").value.trim() || "Không có",
      Source: "Website Popup",
    };

    // Validation
    if (!formData.Name || !formData.Phone) {
      alert("Vui lòng nhập đầy đủ họ tên và số điện thoại!");
      return;
    }

    const phoneRegex = /^(0|\+84)(\d{9,10})$/;
    if (!phoneRegex.test(formData.Phone)) {
      alert(
        "Vui lòng nhập số điện thoại hợp lệ (10-11 số, bắt đầu bằng 0 hoặc +84)"
      );
      return;
    }

    // Validation thêm cho Interest và Purpose (required)
    if (!formData.Interest) {
      alert("Vui lòng chọn Mức đầu tư quan tâm!");
      document.getElementById("leadInterest").focus();
      return;
    }

    if (!formData.Purpose) {
      alert("Vui lòng chọn Mục đích đầu tư!");
      document.getElementById("leadPurpose").focus();
      return;
    }

    // Show loading state
    const submitBtn = this.querySelector(".btn-submit");
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin me-2"></i>Đang gửi...';
    submitBtn.disabled = true;

    try {
      // Submit to Google Apps Script - ĐÃ THAY THẾ
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([formData]),
      });

      if (response.ok) {
        // Show success message
        leadForm.style.display = "none";
        leadSuccess.style.display = "block";
        leadForm.reset();
        console.log("✅ Lead Popup form submitted:", formData);
      } else {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error("❌ Lead Popup form error:", error);

      // Fallback: Save to localStorage
      const pending = JSON.parse(
        localStorage.getItem("pendingSubmissions") || "[]"
      );
      pending.push({
        data: formData,
        timestamp: new Date().toISOString(),
        formType: "modal",
        attempts: 0,
      });
      localStorage.setItem("pendingSubmissions", JSON.stringify(pending));

      // Show success anyway (for better UX)
      leadForm.style.display = "none";
      leadSuccess.style.display = "block";
      leadForm.reset();
    } finally {
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });

  // ========== CLOSE HANDLERS ==========
  closeButtons.forEach((button) => {
    button.addEventListener("click", closeLeadPopup);
  });

  leadPopup.addEventListener("click", function (e) {
    if (e.target === this) {
      closeLeadPopup();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && leadPopup.style.display === "block") {
      closeLeadPopup();
    }
  });

  // Success close button
  document
    .getElementById("closeSuccess")
    ?.addEventListener("click", closeLeadPopup);

  // ========== OPTIONAL: TIME-BASED POPUP ==========
  setTimeout(() => {
    if (!sessionStorage.getItem(popupShownKey)) {
      showLeadPopup();
    }
  }, 45000); // 45 seconds

  // ========== TEST FUNCTION ==========
  window.testLeadPopup = function () {
    sessionStorage.removeItem(popupShownKey);
    showLeadPopup();
    console.log("Popup test triggered!");
  };
});

// ========== NEWSLETTER FORM SUBMISSION ==========
const newsletterForm = document.querySelector(".contact-form");
if (newsletterForm) {
  const newsletterBtn = newsletterForm.querySelector(".btn-primary-custom");

  newsletterBtn.addEventListener("click", async function () {
    const inputs = newsletterForm.querySelectorAll("input");
    const name = inputs[0].value.trim();
    const phone = inputs[1].value.trim();

    if (!name || !phone) {
      alert("Vui lòng điền đầy đủ họ tên và số điện thoại!");
      return;
    }

    const phoneRegex = /^(0|\+84)(\d{9,10})$/;
    if (!phoneRegex.test(phone)) {
      alert("Vui lòng nhập số điện thoại hợp lệ (10-11 số)");
      return;
    }

    // Show loading
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang gửi...';
    this.disabled = true;

    try {
      // Submit to Google Apps Script - ĐÃ THAY THẾ
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          {
            Timestamp: new Date().toLocaleString("vi-VN"),
            Name: name,
            Phone: phone,
            Email: "Không có",
            Type: "Đăng ký nhận tin",
            Note: "Đăng ký nhận bản tin",
            Source: "Newsletter Footer",
          },
        ]),
      });

      if (response.ok) {
        alert("✅ Đăng ký nhận tin thành công!");
        inputs[0].value = "";
        inputs[1].value = "";
        console.log("📰 Newsletter submitted");
      } else {
        const errorText = await response.text();
        console.error("Newsletter API Error:", errorText);
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Newsletter error:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      this.innerHTML = originalText;
      this.disabled = false;
    }
  });
}

// Function to open lead popup
function openLeadPopup() {
  const leadPopup = document.getElementById("leadPopup");
  if (leadPopup) {
    leadPopup.style.display = "block";
    document.body.style.overflow = "hidden";

    // Reset form
    const leadForm = document.getElementById("leadForm");
    const leadSuccess = document.getElementById("leadSuccess");

    if (leadForm) leadForm.style.display = "block";
    if (leadSuccess) leadSuccess.style.display = "none";

    return false; // Ngăn default behavior
  }
}

// Also update the existing test function
window.testLeadPopup = function () {
  openLeadPopup();
  console.log("Popup test triggered!");
  return false;
};

// Add event listener for images in the overview section
document.addEventListener("DOMContentLoaded", function () {
  // Get all images in content-box (overview section)
  const overviewImages = document.querySelectorAll(".content-box img.zoomable");

  overviewImages.forEach(function (img) {
    img.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openLeadPopup();
      return false;
    });
  });
});
