document.addEventListener("DOMContentLoaded", function () {
  // =====================================
  // 1. MOBILE NAVIGATION
  // =====================================

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNavigation = document.querySelector("#main-navigation");
  const navButtons = document.querySelector(".nav-buttons");

  if (menuToggle && mainNavigation) {
    menuToggle.addEventListener("click", function () {
      const isOpen = mainNavigation.classList.toggle("active");

      if (navButtons) {
        navButtons.classList.toggle("active", isOpen);
      }

      menuToggle.setAttribute("aria-expanded", String(isOpen));

      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu",
      );
    });

    // Close menu after clicking a navigation link
    mainNavigation.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNavigation.classList.remove("active");

        if (navButtons) {
          navButtons.classList.remove("active");
        }

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
      });
    });
  }

  // =====================================
  // 2. HOMEPAGE SERVICE SEARCH
  // =====================================

  const homeSearchForm = document.querySelector("#homeSearchForm");

  if (homeSearchForm) {
    homeSearchForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const service =
        document.querySelector("#homeService")?.value.trim() || "";
      const city = document.querySelector("#homeCity")?.value.trim() || "";

      const params = new URLSearchParams();

      if (service) {
        params.set("service", service);
      }

      if (city) {
        params.set("city", city);
      }

      window.location.href = "services.html?" + params.toString();
    });
  }

  // =====================================
  // 3. SERVICES PAGE SEARCH
  // =====================================

  const servicesSearchForm = document.querySelector("#servicesSearchForm");

  if (servicesSearchForm) {
    servicesSearchForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const service =
        document.querySelector("#serviceKeyword")?.value.trim() || "";
      const city = document.querySelector("#serviceCity")?.value.trim() || "";

      const params = new URLSearchParams();

      if (service) {
        params.set("service", service);
      }

      if (city) {
        params.set("city", city);
      }

      window.location.href = "services.html?" + params.toString();
    });
  }

  // Read search values from the URL
  const urlParams = new URLSearchParams(window.location.search);

  const serviceKeyword = document.querySelector("#serviceKeyword");
  const serviceCity = document.querySelector("#serviceCity");

  if (serviceKeyword) {
    serviceKeyword.value = urlParams.get("service") || "";
  }

  if (serviceCity) {
    serviceCity.value = urlParams.get("city") || "";
  }

  // =====================================
  // 4. REGISTRATION PASSWORD VALIDATION
  // =====================================

  const registerForm = document.querySelector("#registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
      const password = document.querySelector("#password");
      const confirmPassword = document.querySelector("#confirmPassword");

      if (password && confirmPassword) {
        if (password.value.length < 8) {
          event.preventDefault();
          alert("Your password must contain at least 8 characters.");
          password.focus();
          return;
        }

        if (password.value !== confirmPassword.value) {
          event.preventDefault();
          alert("Your passwords do not match.");
          confirmPassword.focus();
          return;
        }
      }

      event.preventDefault();

      alert(
        "Your registration form is ready. Account creation will be available once authentication is connected.",
      );
    });
  }

  // =====================================
  // 5. PASSWORD VISIBILITY
  // =====================================

  document
    .querySelectorAll("[data-toggle-password]")
    .forEach(function (button) {
      button.addEventListener("click", function () {
        const inputId = button.getAttribute("data-toggle-password");
        const passwordInput = document.getElementById(inputId);

        if (!passwordInput) return;

        const isPassword = passwordInput.type === "password";

        passwordInput.type = isPassword ? "text" : "password";

        button.textContent = isPassword ? "Hide" : "Show";

        button.setAttribute(
          "aria-label",
          isPassword ? "Hide password" : "Show password",
        );
      });
    });

  // =====================================
  // 7. PROVIDER APPLICATION FORM
  // =====================================

  const providerForm = document.querySelector("#providerApplication");

  if (providerForm) {
    // SUPABASE CONNECTION
    const supabaseUrl = "https://jnvirsxymqdginyatyjq.supabase.co";

    const supabasePublishableKey =
      "sb_publishable_axNzNrJ9AD2qZeS7EYHrFA_pTYlnfs8";

    const settleBridgeSupabase = window.supabase.createClient(
      supabaseUrl,
      supabasePublishableKey,
    );

    // HANDLE PROVIDER APPLICATION
    providerForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      if (!providerForm.checkValidity()) {
        providerForm.reportValidity();
        return;
      }

      const submitButton = providerForm.querySelector('button[type="submit"]');

      const originalButtonText = submitButton.textContent;

      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";

      try {
        const formData = new FormData(providerForm);

        // FIND THE SELECTED SERVICE CATEGORY
        const { data: category, error: categoryError } =
          await settleBridgeSupabase
            .from("service_categories")
            .select("id")
            .eq("slug", formData.get("serviceCategory"))
            .single();

        if (categoryError) {
          throw categoryError;
        }

        // PREPARE APPLICATION DATA
        const application = {
          contact_name: formData.get("fullName").trim(),

          email: formData.get("email").trim(),

          phone: formData.get("phone").trim(),

          whatsapp: formData.get("whatsapp").trim() || null,

          business_name: formData.get("businessName").trim(),

          business_type: formData.get("businessType"),

          country: formData.get("country"),

          city: formData.get("city"),

          website: formData.get("website").trim() || null,

          category_id: category.id,

          pricing_type: formData.get("pricingType"),

          base_price: formData.get("basePrice")
            ? Number(formData.get("basePrice"))
            : null,

          languages: formData.get("languages").trim(),

          service_description: formData.get("serviceDescription").trim(),

          service_area: formData.get("serviceArea").trim(),

          registration_number:
            formData.get("registrationNumber").trim() || null,

          document_type: formData.get("documentType") || null,

          information_confirmation:
            formData.get("informationConfirmation") === "on",

          terms_agreement: formData.get("termsAgreement") === "on",

          consent:
            formData.get("informationConfirmation") === "on" &&
            formData.get("termsAgreement") === "on",
        };

        // SAVE APPLICATION TO SUPABASE
        const { error } = await settleBridgeSupabase
          .from("provider_applications")
          .insert([application]);

        if (error) {
          throw error;
        }

        alert(
          "Thank you! Your provider application has been submitted successfully. Our team will review it.",
        );

        providerForm.reset();
      } catch (error) {
        console.error("Provider application error:", error);

        alert("Sorry, we could not submit your application. Please try again.");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  }

  // =====================================
  // 8. GENERAL CONTACT FORM
  // =====================================

  const contactForm = document.querySelector("#contactForm");

  // Netlify handles contact form submissions directly.
  // Do not prevent the default form submission.

  // =====================================
  // 9. SUPABASE LOGIN
  // =====================================

  const loginForm = document.querySelector("#loginForm");

  if (loginForm) {
    const loginSupabase = window.supabase.createClient(
      "https://jnvirsxymqdginyatyjq.supabase.co",
      "sb_publishable_axNzNrJ9AD2qZeS7EYHrFA_pTYlnfs8",
    );

    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const email = document.querySelector("#email").value.trim();
      const password = document.querySelector("#password").value;

      const submitButton = loginForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;

      submitButton.disabled = true;
      submitButton.textContent = "Logging in...";

      try {
        const { data, error } = await loginSupabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) throw error;

        const { data: isAdmin, error: adminError } = await loginSupabase.rpc(
          "is_settlebridge_admin",
        );

        if (adminError) throw adminError;

        if (isAdmin) {
          window.location.href = "admin.html";
        } else {
          window.location.href = "index.html";
        }
      } catch (error) {
        console.error("Login error:", error);
        alert(
          "Login failed. Please check your email and password and try again.",
        );
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }

  // =====================================
  // 10. SETTLEBRIDGE ADMIN DASHBOARD
  // =====================================

  const applicationsTable = document.querySelector("#applicationsTable");

  if (applicationsTable) {
    const adminSupabase = window.supabase.createClient(
      "https://jnvirsxymqdginyatyjq.supabase.co",
      "sb_publishable_axNzNrJ9AD2qZeS7EYHrFA_pTYlnfs8",
    );

    // The Edge Function that approves/rejects and emails the provider
    const REVIEW_FUNCTION_NAME = "swift-api";

    const STATUS_LABELS = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
    };

    // PAGE ELEMENTS
    const adminMessage = document.querySelector("#adminMessage");
    const logoutButton = document.querySelector("#adminLogout");
    const searchInput = document.querySelector("#adminSearch");
    const citySelect = document.querySelector("#adminCity");
    const emptyList = document.querySelector("#emptyList");
    const statusTabs = document.querySelectorAll(".sba-tab");

    const adminToast = document.querySelector("#adminToast");
    const adminToastText = document.querySelector("#adminToastText");
    const adminToastClose = document.querySelector("#adminToastClose");

    const detailEmpty = document.querySelector("#detailEmpty");
    const detailPanel = document.querySelector("#detailPanel");
    const detailActions = document.querySelector("#detailActions");
    const detailConfirm = document.querySelector("#detailConfirm");
    const detailDecided = document.querySelector("#detailDecided");

    const approveButton = document.querySelector("#approveButton");
    const rejectButton = document.querySelector("#rejectButton");
    const cancelConfirmButton = document.querySelector("#cancelConfirmButton");
    const doConfirmButton = document.querySelector("#doConfirmButton");

    // DASHBOARD STATE
    let allApplications = [];
    let categoryNames = {};
    let currentTab = "pending";
    let selectedId = null;
    let pendingDecision = null; // "approve" or "reject" while confirming
    let isSubmitting = false;

    // SMALL HELPERS
    // textContent is used everywhere so provider-typed text can never run as code.
    function showValue(selector, value) {
      const element = document.querySelector(selector);
      if (!element) return;

      const isEmpty =
        value === null || value === undefined || String(value).trim() === "";

      element.textContent = isEmpty ? "Not provided" : String(value);
    }

    function formatDate(value) {
      if (!value) return "Not provided";

      return new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    // "none" (still pending), "sent", "failed" or "unknown" (reviewed before emails existed)
    function getEmailState(application) {
      if (application.status === "pending") return "none";
      if (application.decision_email_sent_at) return "sent";
      if (application.decision_email_error) return "failed";
      return "unknown";
    }

    function getCategoryName(application) {
      return categoryNames[application.category_id] || "Not provided";
    }

    function getPricingText(application) {
      const parts = [];

      if (application.pricing_type) parts.push(application.pricing_type);

      if (application.base_price !== null && application.base_price !== undefined) {
        parts.push("from €" + Number(application.base_price).toLocaleString("en-GB"));
      }

      return parts.join(", ");
    }

    function createStatusBadge(status) {
      const badge = document.createElement("span");
      const known = Object.prototype.hasOwnProperty.call(STATUS_LABELS, status);

      badge.className = "sba-badge" + (known ? " sba-badge-" + status : "");
      badge.textContent = known ? STATUS_LABELS[status] : status || "Unknown";

      return badge;
    }

    function showMessage(text) {
      adminMessage.textContent = text;
      adminMessage.hidden = false;
    }

    function hideMessage() {
      adminMessage.hidden = true;
      adminMessage.textContent = "";
    }

    function showToast(text, kind) {
      adminToastText.textContent = text;
      adminToast.className = "sba-toast sba-toast-" + kind;
      adminToast.hidden = false;
    }

    function hideToast() {
      adminToast.hidden = true;
    }

    // CHECK ADMIN LOGIN AND PERMISSIONS
    async function checkAdminAccess() {
      const { data: sessionData, error: sessionError } =
        await adminSupabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        window.location.href = "login.html";
        return false;
      }

      const { data: isAdmin, error: adminError } = await adminSupabase.rpc(
        "is_settlebridge_admin",
      );

      if (adminError || !isAdmin) {
        alert("You do not have permission to access this dashboard.");
        await adminSupabase.auth.signOut();
        window.location.href = "login.html";
        return false;
      }

      return true;
    }

    // LOAD SERVICE CATEGORY NAMES (for the Service column)
    async function loadCategories() {
      const { data, error } = await adminSupabase
        .from("service_categories")
        .select("*");

      if (error) {
        console.error("Categories error:", error);
        return;
      }

      categoryNames = {};

      (data || []).forEach(function (category) {
        categoryNames[category.id] =
          category.name || category.title || category.slug || "Not provided";
      });
    }

    // LOAD PROVIDER APPLICATIONS
    async function loadApplications() {
      const { data, error } = await adminSupabase
        .from("provider_applications")
        .select(
          "id, business_name, contact_name, email, phone, whatsapp, business_type, country, city, website, category_id, pricing_type, base_price, languages, service_area, service_description, registration_number, document_type, status, created_at, reviewed_at, decision_email_sent_at, decision_email_error",
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Applications error:", error);
        showMessage("Unable to load applications. Please refresh the page.");
        applicationsTable.replaceChildren();
        return;
      }

      allApplications = data || [];

      hideMessage();
      updateSummary();
      updateCityOptions();
      renderTable();
      renderDetail();
    }

    // UPDATE SUMMARY CARDS AND TAB COUNTS
    function updateSummary() {
      function countStatus(status) {
        return allApplications.filter(function (app) {
          return app.status === status;
        }).length;
      }

      const counts = {
        all: allApplications.length,
        pending: countStatus("pending"),
        approved: countStatus("approved"),
        rejected: countStatus("rejected"),
      };

      const emailFailedCount = allApplications.filter(function (app) {
        return getEmailState(app) === "failed";
      }).length;

      const oldestPending = allApplications
        .filter(function (app) {
          return app.status === "pending";
        })
        .sort(function (a, b) {
          return new Date(a.created_at) - new Date(b.created_at);
        })[0];

      document.querySelector("#totalApplications").textContent = counts.all;
      document.querySelector("#pendingApplications").textContent = counts.pending;
      document.querySelector("#approvedApplications").textContent = counts.approved;
      document.querySelector("#rejectedApplications").textContent = counts.rejected;
      document.querySelector("#emailFailedApplications").textContent = emailFailedCount;
      document.querySelector("#oldestPending").textContent = oldestPending
        ? formatDate(oldestPending.created_at)
        : "none";

      document.querySelectorAll("[data-count]").forEach(function (element) {
        element.textContent = counts[element.dataset.count];
      });
    }

    // FILL THE CITY DROPDOWN FROM THE APPLICATIONS
    function updateCityOptions() {
      const previousCity = citySelect.value;

      const cities = [];
      allApplications.forEach(function (app) {
        if (app.city && cities.indexOf(app.city) === -1) cities.push(app.city);
      });
      cities.sort();

      citySelect.replaceChildren();

      const allOption = document.createElement("option");
      allOption.value = "all";
      allOption.textContent = "All cities";
      citySelect.appendChild(allOption);

      cities.forEach(function (city) {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });

      citySelect.value = cities.indexOf(previousCity) !== -1 ? previousCity : "all";
    }

    // APPLY STATUS TAB, CITY AND SEARCH
    function getFilteredApplications() {
      const search = searchInput.value.trim().toLowerCase();
      const city = citySelect.value;

      return allApplications
        .filter(function (app) {
          if (currentTab !== "all" && app.status !== currentTab) return false;
          if (city !== "all" && app.city !== city) return false;

          if (search) {
            const text = [app.business_name, app.contact_name, app.email]
              .join(" ")
              .toLowerCase();
            if (text.indexOf(search) === -1) return false;
          }

          return true;
        })
        .sort(function (a, b) {
          // Pending: oldest first, so nobody waits too long. Others: newest first.
          const difference = new Date(a.created_at) - new Date(b.created_at);
          return currentTab === "pending" ? difference : -difference;
        });
    }

    // DISPLAY THE TABLE
    function renderTable() {
      const applications = getFilteredApplications();

      applicationsTable.replaceChildren();
      emptyList.hidden = applications.length > 0;

      applications.forEach(function (app) {
        const row = document.createElement("tr");
        row.className = "sba-row" + (app.id === selectedId ? " is-selected" : "");
        row.addEventListener("click", function () {
          selectApplication(app.id);
        });

        // Business and contact
        const businessCell = document.createElement("td");
        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.className = "sba-link";
        openButton.textContent = app.business_name || "Unnamed business";

        const contactLine = document.createElement("div");
        contactLine.className = "sba-sub";
        contactLine.textContent = app.contact_name || "";

        businessCell.appendChild(openButton);
        businessCell.appendChild(contactLine);

        // Service, city and date
        const serviceCell = document.createElement("td");
        serviceCell.textContent = getCategoryName(app);

        const cityCell = document.createElement("td");
        cityCell.textContent = app.city || "Not provided";

        const dateCell = document.createElement("td");
        dateCell.className = "sba-nowrap";
        dateCell.textContent = formatDate(app.created_at);

        // Status
        const statusCell = document.createElement("td");
        statusCell.appendChild(createStatusBadge(app.status));

        if (getEmailState(app) === "failed") {
          const warning = document.createElement("div");
          warning.className = "sba-email-failed";
          warning.textContent = "Email not sent";
          statusCell.appendChild(warning);
        }

        row.appendChild(businessCell);
        row.appendChild(serviceCell);
        row.appendChild(cityCell);
        row.appendChild(dateCell);
        row.appendChild(statusCell);

        applicationsTable.appendChild(row);
      });
    }

    // SELECT AN APPLICATION
    function selectApplication(applicationId) {
      selectedId = applicationId;
      pendingDecision = null;
      hideToast();

      renderTable();
      renderDetail();

      // On phones the details panel is below the table, so scroll to it
      if (window.innerWidth < 900) {
        detailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    // DISPLAY THE DETAILS PANEL
    function renderDetail() {
      const app = allApplications.find(function (item) {
        return item.id === selectedId;
      });

      if (!app) {
        detailEmpty.hidden = false;
        detailPanel.hidden = true;
        return;
      }

      detailEmpty.hidden = true;
      detailPanel.hidden = false;

      // Header
      const statusBadge = document.querySelector("#detailStatus");
      const newBadge = createStatusBadge(app.status);
      statusBadge.className = newBadge.className;
      statusBadge.textContent = newBadge.textContent;

      document.querySelector("#detailDate").textContent =
        "Submitted " + formatDate(app.created_at);
      showValue("#detailBusiness", app.business_name);

      const place = [app.city, app.country].filter(Boolean).join(", ");
      showValue("#detailMeta", [getCategoryName(app), place].filter(Boolean).join(" · "));

      // Contact
      showValue("#detailContact", app.contact_name);
      showValue("#detailEmail", app.email);
      showValue("#detailPhone", app.phone);
      showValue("#detailWhatsapp", app.whatsapp);

      // Business (website shown as plain text on purpose: never a clickable link)
      showValue("#detailBusinessType", app.business_type);
      showValue("#detailWebsite", app.website);
      showValue("#detailRegNumber", app.registration_number);
      showValue("#detailDocument", app.document_type);

      // Services
      showValue("#detailPricing", getPricingText(app));
      showValue("#detailLanguages", app.languages);
      showValue("#detailArea", app.service_area);
      showValue("#detailDescription", app.service_description);

      // Actions
      const isPending = app.status === "pending";

      detailActions.hidden = !isPending || pendingDecision !== null;
      detailConfirm.hidden = !isPending || pendingDecision === null;
      detailDecided.hidden = isPending;

      if (isPending && pendingDecision !== null) {
        const approving = pendingDecision === "approve";

        document.querySelector("#confirmTitle").textContent =
          (approving ? "Approve " : "Reject ") +
          (app.business_name || "this application") +
          "?";

        document.querySelector("#confirmText").textContent =
          "We will email " +
          (app.contact_name || "the provider") +
          " at " +
          (app.email || "their email address") +
          ". You can't undo this.";

        doConfirmButton.className =
          "sba-btn " + (approving ? "sba-btn-approve" : "sba-btn-reject-solid");
        doConfirmButton.textContent = isSubmitting
          ? "Sending..."
          : approving
            ? "Yes, approve"
            : "Yes, reject";
        doConfirmButton.disabled = isSubmitting;
        cancelConfirmButton.disabled = isSubmitting;
      }

      if (!isPending) {
        const decidedText = document.querySelector("#decidedText");
        const label = document.createElement("strong");
        label.textContent = STATUS_LABELS[app.status] || app.status;

        decidedText.replaceChildren(
          label,
          document.createTextNode(" on " + formatDate(app.reviewed_at) + "."),
        );

        const emailState = getEmailState(app);

        document.querySelector("#emailOk").hidden = emailState !== "sent";
        document.querySelector("#emailFailed").hidden = emailState !== "failed";
        document.querySelector("#emailUnknown").hidden = emailState !== "unknown";

        if (emailState === "failed") {
          document.querySelector("#emailFailedText").textContent =
            "Please contact " +
            (app.contact_name || "the provider") +
            " directly at " +
            (app.email || "their email address") +
            ".";
        }
      }
    }

    // SEND THE DECISION TO THE SECURE EDGE FUNCTION
    // The server checks you are an admin, updates the status and emails the provider.
    async function submitDecision() {
      if (isSubmitting || pendingDecision === null || selectedId === null) return;

      const decision = pendingDecision;
      const app = allApplications.find(function (item) {
        return item.id === selectedId;
      });

      isSubmitting = true;
      renderDetail();

      try {
        const { data, error } = await adminSupabase.functions.invoke(
          REVIEW_FUNCTION_NAME,
          { body: { applicationId: selectedId, decision: decision } },
        );

        if (error) {
          let message = "Unable to update this application. Please try again.";

          // Show the server's own explanation if there is one
          if (error.context && typeof error.context.json === "function") {
            try {
              const details = await error.context.json();
              if (details.error) message = details.error;
            } catch (readError) {
              // Keep the default message
            }
          }

          console.error("Review error:", error);
          showToast(message, "error");
          return;
        }

        const businessName = app && app.business_name ? app.business_name + ": " : "";
        showToast(businessName + data.message, data.emailSent ? "success" : "warning");
      } finally {
        isSubmitting = false;
        pendingDecision = null;
        await loadApplications();
      }
    }

    // BUTTONS AND FILTERS
    approveButton.addEventListener("click", function () {
      pendingDecision = "approve";
      hideToast();
      renderDetail();
      cancelConfirmButton.focus();
    });

    rejectButton.addEventListener("click", function () {
      pendingDecision = "reject";
      hideToast();
      renderDetail();
      cancelConfirmButton.focus();
    });

    cancelConfirmButton.addEventListener("click", function () {
      pendingDecision = null;
      renderDetail();
    });

    doConfirmButton.addEventListener("click", submitDecision);

    adminToastClose.addEventListener("click", hideToast);

    statusTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        currentTab = tab.dataset.tab;

        statusTabs.forEach(function (otherTab) {
          const isActive = otherTab === tab;
          otherTab.classList.toggle("is-active", isActive);
          otherTab.setAttribute("aria-pressed", String(isActive));
        });

        renderTable();
      });
    });

    searchInput.addEventListener("input", renderTable);
    citySelect.addEventListener("change", renderTable);

    // ADMIN LOGOUT
    if (logoutButton) {
      logoutButton.addEventListener("click", async function () {
        const { error } = await adminSupabase.auth.signOut();

        if (error) {
          alert("Unable to log out. Please try again.");
          return;
        }

        window.location.href = "login.html";
      });
    }

    // START DASHBOARD
    checkAdminAccess().then(async function (isAdmin) {
      if (isAdmin) {
        await loadCategories();
        await loadApplications();
      }
    });
  }
});
