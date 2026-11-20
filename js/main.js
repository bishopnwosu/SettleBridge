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
            formData.get("termsAgreement") === "on" &&
            formData.get("publicProfileConsent") === "on",
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

  // =====================================
  // 11. ADMIN GUIDES (BLOG) LIST
  // =====================================

  const blogPostsTable = document.querySelector("#blogPostsTable");

  if (blogPostsTable) {
    const blogAdminSupabase = window.supabase.createClient(
      "https://jnvirsxymqdginyatyjq.supabase.co",
      "sb_publishable_axNzNrJ9AD2qZeS7EYHrFA_pTYlnfs8",
    );

    const blogAdminMessage = document.querySelector("#adminMessage");
    const blogLogoutButton = document.querySelector("#adminLogout");
    const postSearch = document.querySelector("#postSearch");
    const postTabs = document.querySelectorAll("[data-post-tab]");
    const postsEmpty = document.querySelector("#postsEmpty");

    let allPosts = [];
    let currentPostTab = "all";

    function formatPostDate(value) {
      if (!value) return "Not yet";

      return new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    // CHECK ADMIN LOGIN AND PERMISSIONS
    async function checkBlogAdminAccess() {
      const { data: sessionData, error: sessionError } =
        await blogAdminSupabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        window.location.href = "login.html";
        return false;
      }

      const { data: isAdmin, error: adminError } = await blogAdminSupabase.rpc(
        "is_settlebridge_admin",
      );

      if (adminError || !isAdmin) {
        alert("You do not have permission to access this page.");
        await blogAdminSupabase.auth.signOut();
        window.location.href = "login.html";
        return false;
      }

      return true;
    }

    // LOAD ALL POSTS (drafts included: only admins are allowed to see them)
    async function loadPosts() {
      const { data, error } = await blogAdminSupabase
        .from("blog_posts")
        .select("id, title, slug, category, status, published_at, updated_at")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Guides error:", error);
        blogAdminMessage.textContent = "Unable to load guides. Please refresh the page.";
        blogAdminMessage.hidden = false;
        blogPostsTable.replaceChildren();
        return;
      }

      allPosts = data || [];
      blogAdminMessage.hidden = true;

      updatePostSummary();
      renderPostsTable();
    }

    // SUMMARY CARDS AND TAB COUNTS
    function updatePostSummary() {
      const published = allPosts.filter(function (post) {
        return post.status === "published";
      });

      const counts = {
        all: allPosts.length,
        published: published.length,
        draft: allPosts.length - published.length,
      };

      document.querySelector("#publishedPostsCount").textContent = counts.published;
      document.querySelector("#draftPostsCount").textContent = counts.draft;

      document.querySelectorAll("[data-post-count]").forEach(function (element) {
        element.textContent = counts[element.dataset.postCount];
      });

      const latest = published
        .filter(function (post) {
          return post.published_at;
        })
        .sort(function (a, b) {
          return new Date(b.published_at) - new Date(a.published_at);
        })[0];

      document.querySelector("#lastPublishedDate").textContent = latest
        ? formatPostDate(latest.published_at)
        : "None yet";

      document.querySelector("#lastPublishedTitle").textContent = latest
        ? latest.title
        : "Publish your first guide";
    }

    // DISPLAY THE TABLE
    function renderPostsTable() {
      const search = postSearch.value.trim().toLowerCase();

      const posts = allPosts.filter(function (post) {
        if (currentPostTab !== "all" && post.status !== currentPostTab) return false;
        if (search && post.title.toLowerCase().indexOf(search) === -1) return false;
        return true;
      });

      blogPostsTable.replaceChildren();
      postsEmpty.hidden = posts.length > 0;

      if (allPosts.length === 0) {
        document.querySelector("#postsEmptyTitle").textContent = "No guides yet";
        document.querySelector("#postsEmptyText").textContent =
          'Click "New guide" to write your first one.';
      } else {
        document.querySelector("#postsEmptyTitle").textContent = "No guides match";
        document.querySelector("#postsEmptyText").textContent =
          "Try another filter or search.";
      }

      posts.forEach(function (post) {
        const editUrl = "admin-blog-edit.html?id=" + encodeURIComponent(post.id);
        const isPublished = post.status === "published";

        const row = document.createElement("tr");
        row.className = "sba-row-static";

        // Title and web address
        const titleCell = document.createElement("td");
        const titleLink = document.createElement("a");
        titleLink.href = editUrl;
        titleLink.className = "sba-link";
        titleLink.textContent = post.title;

        const slugLine = document.createElement("div");
        slugLine.className = "sba-sub";
        slugLine.textContent = "guide.html?slug=" + post.slug;

        titleCell.appendChild(titleLink);
        titleCell.appendChild(slugLine);

        // Category
        const categoryCell = document.createElement("td");
        categoryCell.textContent = post.category;

        // Status
        const statusCell = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "sba-badge " + (isPublished ? "sba-badge-approved" : "sba-badge-draft");
        badge.textContent = isPublished ? "Published" : "Draft";
        statusCell.appendChild(badge);

        // Last updated
        const updatedCell = document.createElement("td");
        updatedCell.className = "sba-nowrap";
        updatedCell.textContent = formatPostDate(post.updated_at);

        // Actions
        const actionsCell = document.createElement("td");
        actionsCell.className = "sba-align-right sba-nowrap";

        const editLink = document.createElement("a");
        editLink.href = editUrl;
        editLink.className = "sba-small-btn";
        editLink.textContent = "Edit";
        actionsCell.appendChild(editLink);

        if (isPublished) {
          const viewLink = document.createElement("a");
          viewLink.href = "guide.html?slug=" + encodeURIComponent(post.slug);
          viewLink.className = "sba-text-link sba-view-link";
          viewLink.textContent = "View";
          actionsCell.appendChild(viewLink);
        }

        row.appendChild(titleCell);
        row.appendChild(categoryCell);
        row.appendChild(statusCell);
        row.appendChild(updatedCell);
        row.appendChild(actionsCell);

        blogPostsTable.appendChild(row);
      });
    }

    // FILTERS
    postTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        currentPostTab = tab.dataset.postTab;

        postTabs.forEach(function (otherTab) {
          const isActive = otherTab === tab;
          otherTab.classList.toggle("is-active", isActive);
          otherTab.setAttribute("aria-pressed", String(isActive));
        });

        renderPostsTable();
      });
    });

    postSearch.addEventListener("input", renderPostsTable);

    // LOGOUT
    if (blogLogoutButton) {
      blogLogoutButton.addEventListener("click", async function () {
        const { error } = await blogAdminSupabase.auth.signOut();

        if (error) {
          alert("Unable to log out. Please try again.");
          return;
        }

        window.location.href = "login.html";
      });
    }

    // START
    checkBlogAdminAccess().then(function (isAdmin) {
      if (isAdmin) {
        loadPosts();
      }
    });
  }

  // =====================================
  // 12. ADMIN GUIDE EDITOR
  // =====================================

  const postForm = document.querySelector("#postForm");

  if (postForm) {
    const editorSupabase = window.supabase.createClient(
      "https://jnvirsxymqdginyatyjq.supabase.co",
      "sb_publishable_axNzNrJ9AD2qZeS7EYHrFA_pTYlnfs8",
    );

    const BLOG_IMAGE_BUCKET = "blog-images";
    const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
    const IMAGE_EXTENSIONS = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

    function byId(id) {
      return document.getElementById(id);
    }

    // PAGE ELEMENTS
    const editorLogoutButton = byId("adminLogout");
    const editorHeading = byId("editorHeading");
    const editorStatusBadge = byId("editorStatusBadge");
    const saveStatus = byId("saveStatus");
    const viewLiveLink = byId("viewLiveLink");
    const unpublishButton = byId("unpublishButton");
    const saveDraftButton = byId("saveDraftButton");
    const publishButton = byId("publishButton");
    const editorMessage = byId("editorMessage");
    const editorMessageText = byId("editorMessageText");
    const editorMessageClose = byId("editorMessageClose");

    const postTitle = byId("postTitle");
    const postSummary = byId("postSummary");
    const summaryCount = byId("summaryCount");
    const postContent = byId("postContent");
    const writeTab = byId("writeTab");
    const previewTab = byId("previewTab");
    const writePanel = byId("writePanel");
    const previewPanel = byId("previewPanel");
    const formatToolbar = byId("formatToolbar");

    const postSlug = byId("postSlug");
    const slugWarning = byId("slugWarning");
    const postCategory = byId("postCategory");
    const coverImage = byId("coverImage");
    const coverPlaceholder = byId("coverPlaceholder");
    const coverInput = byId("coverInput");
    const coverUploadButton = byId("coverUploadButton");
    const coverRemoveButton = byId("coverRemoveButton");
    const coverAlt = byId("coverAlt");

    const seoScoreButton = byId("seoScoreButton");
    const seoScoreTop = byId("seoScoreTop");
    const headlineScoreButton = byId("headlineScoreButton");
    const headlineScoreTop = byId("headlineScoreTop");
    const serpBox = byId("serpBox");
    const serpDesktop = byId("serpDesktop");
    const serpMobile = byId("serpMobile");
    const serpUrl = byId("serpUrl");
    const serpTitle = byId("serpTitle");
    const serpDescription = byId("serpDescription");
    const seoTitleInput = byId("seoTitle");
    const seoTitleCount = byId("seoTitleCount");
    const metaDescriptionInput = byId("metaDescription");
    const metaDescriptionCount = byId("metaDescriptionCount");
    const focusKeyphraseInput = byId("focusKeyphrase");
    const seoChecklist = byId("seoChecklist");
    const seoScoreBadge = byId("seoScoreBadge");
    const headlineChecklist = byId("headlineChecklist");
    const headlineScoreBadge = byId("headlineScoreBadge");
    const headlinePreview = byId("headlinePreview");
    const headlineStats = byId("headlineStats");
    const headlineStart = byId("headlineStart");
    const headlineEnd = byId("headlineEnd");
    const socialPreviewImage = byId("socialPreviewImage");
    const socialPreviewPlaceholder = byId("socialPreviewPlaceholder");
    const socialPreviewTitle = byId("socialPreviewTitle");
    const socialPreviewDescription = byId("socialPreviewDescription");
    const socialInput = byId("socialInput");
    const socialUploadButton = byId("socialUploadButton");
    const socialRemoveButton = byId("socialRemoveButton");
    const socialTitleInput = byId("socialTitle");
    const socialTitleCount = byId("socialTitleCount");
    const socialDescriptionInput = byId("socialDescription");
    const socialDescriptionCount = byId("socialDescriptionCount");

    const deleteCard = byId("deleteCard");
    const deleteStart = byId("deleteStart");
    const deleteConfirm = byId("deleteConfirm");
    const deleteButton = byId("deleteButton");
    const deleteCancelButton = byId("deleteCancelButton");
    const deleteConfirmButton = byId("deleteConfirmButton");

    // EDITOR STATE
    let postId = new URLSearchParams(window.location.search).get("id");
    let savedPost = null; // the guide exactly as it is in the database
    let coverImagePath = null; // the image currently shown in the editor
    let socialImagePath = null; // the share image (WhatsApp, Facebook, LinkedIn)
    let imagesToDelete = []; // old images to remove after the next successful save
    let slugEditedByHand = false;
    let hasUnsavedChanges = false;
    let isBusy = false;

    // SMALL HELPERS
    function formatEditorDate(value) {
      if (!value) return "Not yet";

      return new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    function makeSlug(text) {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "") // removes accents: é -> e
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80)
        .replace(/-+$/g, "");
    }

    // Turns Markdown into safe HTML. DOMPurify removes scripts and unsafe code.
    function renderSafeMarkdown(markdown) {
      if (!window.marked || !window.DOMPurify) return null;
      return window.DOMPurify.sanitize(window.marked.parse(markdown || ""));
    }

    function getImageUrl(path) {
      return editorSupabase.storage.from(BLOG_IMAGE_BUCKET).getPublicUrl(path).data
        .publicUrl;
    }

    function showEditorMessage(text, kind) {
      editorMessageText.textContent = text;
      editorMessage.className = "sba-toast sba-toast-" + kind;
      editorMessage.hidden = false;
      editorMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function hideEditorMessage() {
      editorMessage.hidden = true;
    }

    function markUnsaved() {
      hasUnsavedChanges = true;
      saveStatus.textContent = "Unsaved changes";
    }

    function setBusy(busy) {
      isBusy = busy;
      [
        saveDraftButton,
        publishButton,
        unpublishButton,
        coverUploadButton,
        coverRemoveButton,
        socialUploadButton,
        socialRemoveButton,
        deleteButton,
        deleteConfirmButton,
        deleteCancelButton,
      ].forEach(function (button) {
        button.disabled = busy;
      });
    }

    // ---------- SEO PANEL ----------
    const SITE_NAME = "SettleBridge";
    const SEPARATOR = "|";

    const POWER_WORDS = [
      "essential", "easy", "simple", "complete", "practical", "proven", "quick",
      "step-by-step", "best", "avoid", "mistakes", "free", "ultimate", "first",
      "everything", "safe", "smart", "fast", "new", "need",
    ];

    // Lowercase and remove accents, so "Ação" matches "acao"
    function normaliseText(text) {
      return (text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
    }

    // Replace {title}, {summary}, {sep} and {site} with real text
    function fillTags(template) {
      return template
        .replace(/\{title\}/g, postTitle.value.trim())
        .replace(/\{summary\}/g, postSummary.value.trim())
        .replace(/\{sep\}/g, SEPARATOR)
        .replace(/\{site\}/g, SITE_NAME)
        .replace(/\s+/g, " ")
        .trim();
    }

    function getFinalSeoTitle() {
      return fillTags(seoTitleInput.value.trim() || "{title} {sep} {site}");
    }

    function getFinalMetaDescription() {
      return fillTags(metaDescriptionInput.value.trim() || "{summary}");
    }

    function shorten(text, maxLength) {
      return text.length > maxLength ? text.slice(0, maxLength - 1).trimEnd() + "…" : text;
    }

    function getPlainContent() {
      return postContent.value
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/[#>*_`~-]/g, " ");
    }

    function countWords(text) {
      return text.trim().split(/\s+/).filter(Boolean).length;
    }

    function getFirstParagraph() {
      const blocks = postContent.value.split(/\n\s*\n/);
      const first = blocks.find(function (block) {
        return block.trim() && !/^\s*#/.test(block);
      });
      return first || "";
    }

    function getSubheadings() {
      return (postContent.value.match(/^#{2,3}\s+.+$/gm) || []).map(function (line) {
        return line.replace(/^#+\s+/, "");
      });
    }

    function scoreClass(score) {
      if (score >= 70) return "is-good";
      if (score >= 40) return "is-ok";
      return "is-poor";
    }

    // "52 out of 60 recommended characters"
    function showLength(element, length, low, high) {
      element.textContent = length + " out of " + high + " recommended characters.";
      element.className =
        "sba-length-note " + (length === 0 ? "" : length < low || length > high ? "is-warning" : "is-good");
    }

    function renderChecklist(listElement, checks) {
      listElement.replaceChildren();

      checks.forEach(function (check) {
        const item = document.createElement("li");
        item.className = check.passed ? "is-passed" : "is-failed";

        const icon = document.createElement("span");
        icon.className = "sba-check-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = check.passed ? "✓" : "!";

        const label = document.createElement("span");
        label.className = "sba-visually-hidden";
        label.textContent = check.passed ? "Done: " : "To improve: ";

        const text = document.createElement("span");
        text.textContent = check.text;

        item.appendChild(icon);
        item.appendChild(label);
        item.appendChild(text);
        listElement.appendChild(item);
      });
    }

    function sumScore(checks) {
      return checks.reduce(function (total, check) {
        return total + (check.passed ? check.points : 0);
      }, 0);
    }

    // SEO CHECKS: our own simple checklist (not Google's ranking formula)
    function getSeoChecks() {
      const keyphrase = normaliseText(focusKeyphraseInput.value.trim());
      const hasKeyphrase = keyphrase.length > 0;
      const seoTitleText = getFinalSeoTitle();
      const metaText = getFinalMetaDescription();
      const wordCount = countWords(getPlainContent());
      const subheadings = getSubheadings();

      function contains(text) {
        return hasKeyphrase && normaliseText(text).indexOf(keyphrase) !== -1;
      }

      const keyphraseSlug = makeSlug(focusKeyphraseInput.value);

      return [
        {
          points: 10,
          passed: hasKeyphrase,
          text: hasKeyphrase ? "Focus keyphrase is set." : "Add a focus keyphrase.",
        },
        {
          points: 15,
          passed: contains(seoTitleText),
          text: "Use the keyphrase in the SEO title.",
        },
        {
          points: 10,
          passed: contains(metaText),
          text: "Use the keyphrase in the meta description.",
        },
        {
          points: 10,
          passed: hasKeyphrase && keyphraseSlug !== "" && postSlug.value.indexOf(keyphraseSlug) !== -1,
          text: "Use the keyphrase in the web address.",
        },
        {
          points: 10,
          passed: contains(getFirstParagraph()),
          text: "Use the keyphrase in the first paragraph.",
        },
        {
          points: 5,
          passed: subheadings.some(contains),
          text: "Use the keyphrase in at least one subheading.",
        },
        {
          points: 10,
          passed: seoTitleText.length >= 30 && seoTitleText.length <= 60,
          text: "Keep the SEO title between 30 and 60 characters (now " + seoTitleText.length + ").",
        },
        {
          points: 10,
          passed: metaText.length >= 120 && metaText.length <= 160,
          text: "Keep the meta description between 120 and 160 characters (now " + metaText.length + ").",
        },
        {
          points: 10,
          passed: wordCount >= 300,
          text: "Write at least 300 words (now " + wordCount + ").",
        },
        {
          points: 5,
          passed: subheadings.length > 0,
          text: "Break the text up with subheadings (## Heading).",
        },
        {
          points: 5,
          passed: !!coverImagePath && coverAlt.value.trim().length > 0,
          text: "Add a cover image with a description.",
        },
      ];
    }

    // HEADLINE CHECKS
    function getHeadlineChecks() {
      const title = postTitle.value.trim();
      const words = title.split(/\s+/).filter(Boolean);
      const lower = normaliseText(title);
      const lettersOnly = title.replace(/[^A-Za-z]/g, "");

      const isHowToOrList =
        /^(how|what|why|when|where|which|who)\b/.test(lower) ||
        /\b(guide|checklist|tips|steps|ways|mistakes|things)\b/.test(lower) ||
        title.indexOf("?") !== -1;

      const hasPowerWord = POWER_WORDS.some(function (word) {
        return new RegExp("\\b" + word.replace("-", "\\-") + "\\b").test(lower);
      });

      return [
        {
          points: 25,
          passed: title.length >= 40 && title.length <= 60,
          text: "Aim for 40 to 60 characters (now " + title.length + ").",
        },
        {
          points: 20,
          passed: words.length >= 6 && words.length <= 12,
          text: "Aim for 6 to 12 words (now " + words.length + ").",
        },
        {
          points: 15,
          passed: isHowToOrList,
          text: "Use a clear type: \"How to…\", a question, a checklist or a list of tips.",
        },
        {
          points: 15,
          passed: hasPowerWord,
          text: "Add a helpful word such as \"easy\", \"essential\", \"step-by-step\" or \"avoid\".",
        },
        {
          points: 10,
          passed: /\d/.test(title),
          text: "Consider a number, for example \"5 steps…\" or \"…in 2026\".",
        },
        {
          points: 15,
          passed:
            title.length > 0 &&
            !(lettersOnly.length > 3 && lettersOnly === lettersOnly.toUpperCase()) &&
            (title.match(/!/g) || []).length <= 1,
          text: "Avoid ALL CAPITALS and repeated exclamation marks.",
        },
      ];
    }

    // UPDATE THE WHOLE SEO PANEL
    function updateSeoPreview() {
      const finalTitle = getFinalSeoTitle();
      const finalDescription = getFinalMetaDescription();
      const isMobile = serpBox.classList.contains("is-mobile");

      // Search preview
      serpUrl.textContent =
        "settlebridgee.netlify.app › guide.html?slug=" + (postSlug.value || "...");
      serpTitle.textContent = shorten(finalTitle || "Guide title", isMobile ? 70 : 60);
      serpDescription.textContent = shorten(
        finalDescription || "Your meta description will appear here.",
        isMobile ? 120 : 160,
      );

      showLength(seoTitleCount, finalTitle.length, 30, 60);
      showLength(metaDescriptionCount, finalDescription.length, 120, 160);

      // SEO score
      const seoChecks = getSeoChecks();
      const seoScore = sumScore(seoChecks);
      renderChecklist(seoChecklist, seoChecks);

      // Headline score
      const headlineChecks = getHeadlineChecks();
      const headlineScore = postTitle.value.trim() ? sumScore(headlineChecks) : 0;
      renderChecklist(headlineChecklist, headlineChecks);

      const titleWords = postTitle.value.trim().split(/\s+/).filter(Boolean);
      headlinePreview.textContent = postTitle.value.trim() || "Add a title to analyse it.";
      headlineStats.textContent =
        postTitle.value.trim().length + " characters · " + titleWords.length + " words";
      headlineStart.textContent = titleWords.slice(0, 3).join(" ") || "–";
      headlineEnd.textContent =
        titleWords.length > 3 ? titleWords.slice(-3).join(" ") : "–";

      // Score badges (in the panel and in the top bar)
      [
        [seoScoreBadge, seoScoreButton, seoScoreTop, seoScore],
        [headlineScoreBadge, headlineScoreButton, headlineScoreTop, headlineScore],
      ].forEach(function (group) {
        const score = group[3];
        group[0].textContent = score + "/100";
        group[0].className = "sba-score-badge " + scoreClass(score);
        group[1].className = "sba-score-btn " + scoreClass(score);
        group[2].textContent = score;
      });

      // Social share preview
      const shareImage = socialImagePath || coverImagePath;
      if (shareImage) {
        socialPreviewImage.src = getImageUrl(shareImage);
        socialPreviewImage.hidden = false;
        socialPreviewPlaceholder.hidden = true;
      } else {
        socialPreviewImage.removeAttribute("src");
        socialPreviewImage.hidden = true;
        socialPreviewPlaceholder.hidden = false;
      }

      const shareTitle = socialTitleInput.value.trim() || finalTitle;
      const shareDescription = socialDescriptionInput.value.trim() || finalDescription;

      socialPreviewTitle.textContent = shorten(shareTitle || "Guide title", 90);
      socialPreviewDescription.textContent = shorten(shareDescription, 200);
      socialTitleInput.placeholder = finalTitle;
      socialDescriptionInput.placeholder = finalDescription;

      showLength(socialTitleCount, shareTitle.length, 30, 60);
      showLength(socialDescriptionCount, shareDescription.length, 60, 200);

      socialRemoveButton.hidden = !socialImagePath;
      socialUploadButton.textContent = socialImagePath
        ? "Replace share image"
        : "Upload share image";
    }

    function showSeoTab(tabName) {
      document.querySelectorAll("[data-seo-tab]").forEach(function (tab) {
        const isActive = tab.dataset.seoTab === tabName;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", String(isActive));
      });

      byId("seoPanelGeneral").hidden = tabName !== "general";
      byId("seoPanelHeadline").hidden = tabName !== "headline";
      byId("seoPanelSocial").hidden = tabName !== "social";
    }

    // Insert a tag such as {title} where the cursor is
    function insertTag(field, tag) {
      const start = field.selectionStart ?? field.value.length;
      const end = field.selectionEnd ?? field.value.length;
      const before = field.value.slice(0, start);
      const needsSpace = before.length > 0 && !/\s$/.test(before);
      const text = (needsSpace ? " " : "") + tag + " ";

      field.setRangeText(text, start, end, "end");
      field.focus();
      markUnsaved();
      updateSeoPreview();
    }

    // Shared image upload (cover image and share image use the same rules)
    async function uploadImage(file, folder) {
      const extension = IMAGE_EXTENSIONS[file.type];

      if (!extension) {
        showEditorMessage("Please choose a JPG, PNG or WebP image.", "error");
        return null;
      }

      if (file.size > MAX_IMAGE_BYTES) {
        showEditorMessage("This image is larger than 2 MB. Please choose a smaller one.", "error");
        return null;
      }

      const newPath = folder + "/" + crypto.randomUUID() + "." + extension;

      const { error } = await editorSupabase.storage
        .from(BLOG_IMAGE_BUCKET)
        .upload(newPath, file, {
          contentType: file.type,
          cacheControl: "31536000",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        showEditorMessage("Could not upload this image. Please try again.", "error");
        return null;
      }

      return newPath;
    }

    // Before replacing or removing an image: delete it now if it was never saved,
    // or after the next save if the saved guide still uses it
    async function releaseImage(currentPath, savedPath) {
      if (!currentPath) return;

      if (currentPath === savedPath) {
        imagesToDelete.push(currentPath);
      } else {
        await deleteImages([currentPath]);
      }
    }

    // UPDATE THE SCREEN
    function updateStatusDisplay() {
      const isPublished = !!savedPost && savedPost.status === "published";

      editorHeading.textContent = postId ? "Edit guide" : "New guide";
      document.title =
        (postId ? "Edit guide" : "New guide") + " | SettleBridge Admin";

      editorStatusBadge.textContent = isPublished ? "Published" : "Draft";
      editorStatusBadge.className =
        "sba-badge " + (isPublished ? "sba-badge-approved" : "sba-badge-draft");

      byId("infoStatus").textContent = isPublished ? "Published" : "Draft";
      byId("infoCreated").textContent = savedPost
        ? formatEditorDate(savedPost.created_at)
        : "Not saved yet";
      byId("infoPublished").textContent = savedPost
        ? formatEditorDate(savedPost.published_at)
        : "Not yet";

      publishButton.textContent = isPublished ? "Update guide" : "Publish";
      saveDraftButton.hidden = isPublished;
      unpublishButton.hidden = !isPublished;

      viewLiveLink.hidden = !isPublished;
      if (isPublished) {
        viewLiveLink.href = "guide.html?slug=" + encodeURIComponent(savedPost.slug);
      }

      slugWarning.hidden = !isPublished;
      deleteCard.hidden = !postId;
    }

    function updateSummaryCount() {
      const length = postSummary.value.length;
      summaryCount.textContent = length + " / 160";
      summaryCount.classList.toggle("is-over", length > 160);
    }

    function updateCoverDisplay() {
      if (coverImagePath) {
        coverImage.src = getImageUrl(coverImagePath);
        coverImage.alt = coverAlt.value.trim();
        coverImage.hidden = false;
        coverPlaceholder.hidden = true;
        coverRemoveButton.hidden = false;
        coverUploadButton.textContent = "Replace image";
      } else {
        coverImage.removeAttribute("src");
        coverImage.hidden = true;
        coverPlaceholder.hidden = false;
        coverRemoveButton.hidden = true;
        coverUploadButton.textContent = "Upload image";
      }

      updateSeoPreview();
    }

    function updatePreview() {
      const safeHtml = renderSafeMarkdown(postContent.value);

      if (safeHtml === null) {
        // The Markdown tools did not load: show plain text instead
        previewPanel.textContent = postContent.value;
        return;
      }

      previewPanel.innerHTML = safeHtml || "<p>Nothing to preview yet.</p>";
    }

    function updateEverything() {
      updateStatusDisplay();
      updateSummaryCount();
      updateSeoPreview();
      updateCoverDisplay();
    }

    // CHECK THE GUIDE BEFORE SAVING
    function findProblem(forPublishing) {
      const title = postTitle.value.trim();
      const slug = postSlug.value.trim();

      if (title.length < 3) return "Please add a title (at least 3 characters).";
      if (title.length > 150) return "The title is too long (150 characters maximum).";
      if (!slug) return "Please add a web address.";
      if (slug.length > 80 || !SLUG_PATTERN.test(slug)) {
        return "The web address can only use lowercase letters, numbers and single dashes.";
      }
      if (postSummary.value.trim().length > 300) {
        return "The summary is too long (300 characters maximum).";
      }

      if (forPublishing) {
        if (!postSummary.value.trim()) return "Please add a summary before publishing.";
        if (postContent.value.trim().length < 50) {
          return "Please write the guide before publishing (at least 50 characters).";
        }
        if (coverImagePath && !coverAlt.value.trim()) {
          return "Please describe the cover image before publishing.";
        }
      }

      return null;
    }

    // REMOVE OLD COVER IMAGES THAT ARE NO LONGER USED
    async function deleteImages(paths) {
      const unique = paths.filter(function (path, index) {
        return path && paths.indexOf(path) === index;
      });

      if (unique.length === 0) return;

      const { error } = await editorSupabase.storage
        .from(BLOG_IMAGE_BUCKET)
        .remove(unique);

      if (error) console.error("Image delete error:", error);
    }

    // Called before the current cover is replaced or removed
    async function releaseCurrentCover() {
      await releaseImage(coverImagePath, savedPost ? savedPost.cover_image_path : null);
    }

    // SAVE (status is "draft" or "published")
    async function saveGuide(newStatus) {
      if (isBusy) return;

      const forPublishing = newStatus === "published";
      const problem = findProblem(forPublishing);

      if (problem) {
        showEditorMessage(problem, "error");
        return;
      }

      const guide = {
        title: postTitle.value.trim(),
        slug: postSlug.value.trim(),
        summary: postSummary.value.trim() || null,
        content: postContent.value,
        category: postCategory.value,
        cover_image_path: coverImagePath,
        cover_image_alt: coverAlt.value.trim() || null,
        status: newStatus,
        seo_title: seoTitleInput.value.trim() || null,
        meta_description: metaDescriptionInput.value.trim() || null,
        focus_keyphrase: focusKeyphraseInput.value.trim() || null,
        social_title: socialTitleInput.value.trim() || null,
        social_description: socialDescriptionInput.value.trim() || null,
        social_image_path: socialImagePath,
      };

      const wasPublished = !!savedPost && savedPost.status === "published";

      setBusy(true);
      hideEditorMessage();
      saveStatus.textContent = "Saving...";

      try {
        const request = postId
          ? editorSupabase.from("blog_posts").update(guide).eq("id", postId)
          : editorSupabase.from("blog_posts").insert(guide);

        const { data, error } = await request.select().single();

        if (error) {
          console.error("Save error:", error);
          saveStatus.textContent = "Not saved";
          showEditorMessage(
            error.code === "23505"
              ? "Another guide already uses this web address. Please change it."
              : "Could not save this guide. Please try again.",
            "error",
          );
          return;
        }

        savedPost = data;
        postId = data.id;
        hasUnsavedChanges = false;

        // Put the id in the address bar, so a refresh reopens this guide
        window.history.replaceState(
          null,
          "",
          "admin-blog-edit.html?id=" + encodeURIComponent(postId),
        );

        await deleteImages(imagesToDelete);
        imagesToDelete = [];

        updateStatusDisplay();
        saveStatus.textContent =
          "Saved at " +
          new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

        let message = "Draft saved.";
        if (forPublishing && !wasPublished) {
          message = "Guide published. It is now live on the website.";
        } else if (forPublishing && wasPublished) {
          message = "Guide updated on the website.";
        } else if (!forPublishing && wasPublished) {
          message = "Guide unpublished. It is now hidden from the website.";
        }

        showEditorMessage(message, "success");
      } finally {
        setBusy(false);
      }
    }

    // LOAD AN EXISTING GUIDE (or start a new one)
    async function loadGuide() {
      if (!postId) {
        updateEverything();
        updatePreview();
        postTitle.focus();
        return;
      }

      const { data, error } = await editorSupabase
        .from("blog_posts")
        .select("*")
        .eq("id", postId)
        .maybeSingle();

      if (error || !data) {
        console.error("Load error:", error);
        showEditorMessage(
          "This guide could not be found. It may have been deleted.",
          "error",
        );
        postForm.querySelectorAll("input, textarea, select, button").forEach(function (field) {
          field.disabled = true;
        });
        saveDraftButton.disabled = true;
        publishButton.disabled = true;
        return;
      }

      savedPost = data;
      slugEditedByHand = true; // never change an existing guide's address automatically

      postTitle.value = data.title || "";
      postSlug.value = data.slug || "";
      postSummary.value = data.summary || "";
      postContent.value = data.content || "";
      postCategory.value = data.category || "Getting started";
      coverAlt.value = data.cover_image_alt || "";
      coverImagePath = data.cover_image_path || null;
      seoTitleInput.value = data.seo_title || "";
      metaDescriptionInput.value = data.meta_description || "";
      focusKeyphraseInput.value = data.focus_keyphrase || "";
      socialTitleInput.value = data.social_title || "";
      socialDescriptionInput.value = data.social_description || "";
      socialImagePath = data.social_image_path || null;

      updateEverything();
      updatePreview();

      hasUnsavedChanges = false;
      saveStatus.textContent = "All changes saved";
    }

    // CHECK ADMIN LOGIN AND PERMISSIONS
    async function checkEditorAdminAccess() {
      const { data: sessionData, error: sessionError } =
        await editorSupabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        window.location.href = "login.html";
        return false;
      }

      const { data: isAdmin, error: adminError } = await editorSupabase.rpc(
        "is_settlebridge_admin",
      );

      if (adminError || !isAdmin) {
        alert("You do not have permission to access this page.");
        await editorSupabase.auth.signOut();
        window.location.href = "login.html";
        return false;
      }

      return true;
    }

    // MARKDOWN FORMATTING BUTTONS
    function wrapSelection(before, after, placeholder) {
      const start = postContent.selectionStart;
      const end = postContent.selectionEnd;
      const selected = postContent.value.slice(start, end) || placeholder;

      postContent.setRangeText(before + selected + after, start, end, "end");
      postContent.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
      postContent.focus();
      markUnsaved();
    }

    function prefixLines(prefix) {
      const value = postContent.value;
      const start = value.lastIndexOf("\n", postContent.selectionStart - 1) + 1;
      const end = postContent.selectionEnd;

      const lines = value
        .slice(start, end)
        .split("\n")
        .map(function (line) {
          return prefix + line.replace(/^(#{1,6}\s|-\s)/, "");
        });

      postContent.setRangeText(lines.join("\n"), start, end, "end");
      postContent.focus();
      markUnsaved();
    }

    formatToolbar.addEventListener("click", function (event) {
      const button = event.target.closest("[data-format]");
      if (!button) return;

      const format = button.dataset.format;

      if (format === "bold") wrapSelection("**", "**", "bold text");
      if (format === "italic") wrapSelection("_", "_", "italic text");
      if (format === "heading") prefixLines("## ");
      if (format === "list") prefixLines("- ");
      if (format === "link") wrapSelection("[", "](https://)", "link text");
    });

    // WRITE / PREVIEW SWITCH
    function showEditorMode(mode) {
      const isWrite = mode === "write";

      writePanel.hidden = !isWrite;
      previewPanel.hidden = isWrite;
      formatToolbar.hidden = !isWrite;

      writeTab.classList.toggle("is-active", isWrite);
      previewTab.classList.toggle("is-active", !isWrite);
      writeTab.setAttribute("aria-pressed", String(isWrite));
      previewTab.setAttribute("aria-pressed", String(!isWrite));

      if (!isWrite) updatePreview();
    }

    writeTab.addEventListener("click", function () {
      showEditorMode("write");
    });

    previewTab.addEventListener("click", function () {
      showEditorMode("preview");
    });

    // TYPING IN THE FORM
    postTitle.addEventListener("input", function () {
      if (!slugEditedByHand) postSlug.value = makeSlug(postTitle.value);
      updateSeoPreview();
      markUnsaved();
    });

    postSlug.addEventListener("input", function () {
      slugEditedByHand = true;
      updateSeoPreview();
      markUnsaved();
    });

    postSlug.addEventListener("blur", function () {
      postSlug.value = makeSlug(postSlug.value);
      updateSeoPreview();
    });

    postSummary.addEventListener("input", function () {
      updateSummaryCount();
      updateSeoPreview();
      markUnsaved();
    });

    postContent.addEventListener("input", function () {
      markUnsaved();
      updateSeoPreview();
    });
    postCategory.addEventListener("change", markUnsaved);

    coverAlt.addEventListener("input", function () {
      coverImage.alt = coverAlt.value.trim();
      markUnsaved();
      updateSeoPreview();
    });

    // Stop the Enter key from submitting the form
    postForm.addEventListener("submit", function (event) {
      event.preventDefault();
    });

    // COVER IMAGE
    coverUploadButton.addEventListener("click", function () {
      coverInput.click();
    });

    coverInput.addEventListener("change", async function () {
      const file = coverInput.files[0];
      coverInput.value = "";

      if (!file) return;

      setBusy(true);
      coverUploadButton.textContent = "Uploading...";

      try {
        const newPath = await uploadImage(file, "covers");
        if (!newPath) return;

        await releaseCurrentCover();
        coverImagePath = newPath;
        markUnsaved();
        showEditorMessage("Image uploaded. Save the guide to keep it.", "success");
      } finally {
        setBusy(false);
        updateCoverDisplay();
      }
    });

    coverRemoveButton.addEventListener("click", async function () {
      setBusy(true);

      try {
        await releaseCurrentCover();
        coverImagePath = null;
        markUnsaved();
      } finally {
        setBusy(false);
        updateCoverDisplay();
      }
    });

    // SEO PANEL: TABS, PREVIEW SIZE, TAGS AND FIELDS
    document.querySelectorAll("[data-seo-tab]").forEach(function (tab) {
      tab.addEventListener("click", function () {
        showSeoTab(tab.dataset.seoTab);
      });
    });

    seoScoreButton.addEventListener("click", function () {
      showSeoTab("general");
      byId("seoPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    headlineScoreButton.addEventListener("click", function () {
      showSeoTab("headline");
      byId("seoPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    function setSerpDevice(mobile) {
      serpBox.classList.toggle("is-mobile", mobile);
      serpDesktop.classList.toggle("is-active", !mobile);
      serpMobile.classList.toggle("is-active", mobile);
      serpDesktop.setAttribute("aria-pressed", String(!mobile));
      serpMobile.setAttribute("aria-pressed", String(mobile));
      updateSeoPreview();
    }

    serpDesktop.addEventListener("click", function () {
      setSerpDevice(false);
    });

    serpMobile.addEventListener("click", function () {
      setSerpDevice(true);
    });

    document.querySelectorAll("[data-insert-into]").forEach(function (button) {
      button.addEventListener("click", function () {
        insertTag(byId(button.dataset.insertInto), button.dataset.tag);
      });
    });

    [
      seoTitleInput,
      metaDescriptionInput,
      focusKeyphraseInput,
      socialTitleInput,
      socialDescriptionInput,
    ].forEach(function (field) {
      field.addEventListener("input", function () {
        markUnsaved();
        updateSeoPreview();
      });
    });

    // SHARE IMAGE
    socialUploadButton.addEventListener("click", function () {
      socialInput.click();
    });

    socialInput.addEventListener("change", async function () {
      const file = socialInput.files[0];
      socialInput.value = "";

      if (!file) return;

      setBusy(true);
      socialUploadButton.textContent = "Uploading...";

      try {
        const newPath = await uploadImage(file, "social");
        if (!newPath) return;

        await releaseImage(socialImagePath, savedPost ? savedPost.social_image_path : null);
        socialImagePath = newPath;
        markUnsaved();
        showEditorMessage("Share image uploaded. Save the guide to keep it.", "success");
      } finally {
        setBusy(false);
        updateSeoPreview();
      }
    });

    socialRemoveButton.addEventListener("click", async function () {
      setBusy(true);

      try {
        await releaseImage(socialImagePath, savedPost ? savedPost.social_image_path : null);
        socialImagePath = null;
        markUnsaved();
      } finally {
        setBusy(false);
        updateSeoPreview();
      }
    });

    // SAVE BUTTONS
    saveDraftButton.addEventListener("click", function () {
      saveGuide("draft");
    });

    publishButton.addEventListener("click", function () {
      saveGuide("published");
    });

    unpublishButton.addEventListener("click", function () {
      saveGuide("draft");
    });

    // DELETE
    deleteButton.addEventListener("click", function () {
      deleteStart.hidden = true;
      deleteConfirm.hidden = false;
      deleteCancelButton.focus();
    });

    deleteCancelButton.addEventListener("click", function () {
      deleteConfirm.hidden = true;
      deleteStart.hidden = false;
    });

    deleteConfirmButton.addEventListener("click", async function () {
      if (isBusy || !postId) return;

      setBusy(true);

      try {
        const { data, error } = await editorSupabase
          .from("blog_posts")
          .delete()
          .eq("id", postId)
          .select("id");

        if (error || !data || data.length === 0) {
          console.error("Delete error:", error);
          showEditorMessage("Could not delete this guide. Please try again.", "error");
          return;
        }

        await deleteImages(
          [
            savedPost && savedPost.cover_image_path,
            savedPost && savedPost.social_image_path,
            coverImagePath,
            socialImagePath,
          ].concat(imagesToDelete),
        );

        hasUnsavedChanges = false;
        window.location.href = "admin-blog.html";
      } finally {
        setBusy(false);
      }
    });

    // MESSAGES
    editorMessageClose.addEventListener("click", hideEditorMessage);

    // WARN BEFORE LEAVING WITH UNSAVED CHANGES
    window.addEventListener("beforeunload", function (event) {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = "";
      }
    });

    // LOGOUT
    if (editorLogoutButton) {
      editorLogoutButton.addEventListener("click", async function () {
        if (hasUnsavedChanges && !confirm("You have unsaved changes. Log out anyway?")) {
          return;
        }

        hasUnsavedChanges = false;
        await editorSupabase.auth.signOut();
        window.location.href = "login.html";
      });
    }

    // START
    checkEditorAdminAccess().then(function (isAdmin) {
      if (isAdmin) {
        loadGuide();
      }
    });
  }

  // =====================================
  // 13. PUBLIC GUIDES (BLOG) PAGES
  // =====================================
  // Visitors can only ever read PUBLISHED guides: the database security rules enforce this.

  const guidesGrid = document.querySelector("#guidesGrid");
  const guideBody = document.querySelector("#guideBody");

  if (guidesGrid || guideBody) {
    const guidesSupabase = window.supabase.createClient(
      "https://jnvirsxymqdginyatyjq.supabase.co",
      "sb_publishable_axNzNrJ9AD2qZeS7EYHrFA_pTYlnfs8",
    );

    const GUIDE_IMAGE_BUCKET = "blog-images";
    const GUIDE_SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    const GUIDE_SITE_URL = "https://settlebridgee.netlify.app";

    // Replace {title}, {summary}, {sep} and {site} (same tags as the admin editor)
    function fillGuideTags(template, guide) {
      return template
        .replace(/\{title\}/g, guide.title || "")
        .replace(/\{summary\}/g, guide.summary || "")
        .replace(/\{sep\}/g, "|")
        .replace(/\{site\}/g, "SettleBridge")
        .replace(/\s+/g, " ")
        .trim();
    }

    function formatGuideDate(value) {
      if (!value) return "";

      return new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    function getReadingTime(content) {
      const words = (content || "").trim().split(/\s+/).filter(Boolean).length;
      return Math.max(1, Math.round(words / 200)) + " min read";
    }

    function getGuideImageUrl(path) {
      return guidesSupabase.storage.from(GUIDE_IMAGE_BUCKET).getPublicUrl(path).data
        .publicUrl;
    }

    function getGuideUrl(guide) {
      return "guide.html?slug=" + encodeURIComponent(guide.slug);
    }

    // BUILD ONE GUIDE CARD (text is always set with textContent, never as HTML)
    function buildGuideCard(guide, isFeatured) {
      const card = document.createElement("a");
      card.href = getGuideUrl(guide);
      card.className = "sbg-card" + (isFeatured ? " sbg-card-featured" : "");

      const cover = document.createElement("div");
      cover.className = "sbg-card-cover";

      if (guide.cover_image_path) {
        const image = document.createElement("img");
        image.src = getGuideImageUrl(guide.cover_image_path);
        image.alt = guide.cover_image_alt || "";
        image.loading = "lazy";
        cover.appendChild(image);
      } else {
        const placeholder = document.createElement("span");
        placeholder.textContent = guide.category;
        cover.appendChild(placeholder);
      }

      const text = document.createElement("div");
      text.className = "sbg-card-text";

      const category = document.createElement("span");
      category.className = "sbg-eyebrow";
      category.textContent = (isFeatured ? "Latest · " : "") + guide.category;

      const title = document.createElement(isFeatured ? "h2" : "h3");
      title.className = "sbg-card-title";
      title.textContent = guide.title;

      const summary = document.createElement("p");
      summary.className = "sbg-card-summary";
      summary.textContent = guide.summary || "";

      const meta = document.createElement("span");
      meta.className = "sbg-card-meta";
      meta.textContent =
        formatGuideDate(guide.published_at) + " · " + getReadingTime(guide.content);

      text.appendChild(category);
      text.appendChild(title);
      text.appendChild(summary);
      text.appendChild(meta);

      card.appendChild(cover);
      card.appendChild(text);

      return card;
    }

    // ---------- GUIDES LIST PAGE (guides.html) ----------
    if (guidesGrid) {
      const guidesStatus = document.querySelector("#guidesStatus");
      const featuredGuide = document.querySelector("#featuredGuide");
      const guidesGridSection = document.querySelector("#guidesGridSection");
      const guidesGridHeading = document.querySelector("#guidesGridHeading");
      const topicChips = document.querySelectorAll("[data-topic]");

      let publishedGuides = [];
      let currentTopic = "All";

      function renderGuides() {
        featuredGuide.replaceChildren();
        guidesGrid.replaceChildren();

        if (publishedGuides.length === 0) {
          guidesStatus.textContent = "Guides are on the way. Please check back soon.";
          guidesStatus.hidden = false;
          guidesGridSection.hidden = true;
          return;
        }

        let gridGuides;

        if (currentTopic === "All") {
          // Newest guide large at the top, the rest in the grid
          featuredGuide.appendChild(buildGuideCard(publishedGuides[0], true));
          gridGuides = publishedGuides.slice(1);
          guidesGridHeading.textContent = "More guides";
        } else {
          gridGuides = publishedGuides.filter(function (guide) {
            return guide.category === currentTopic;
          });
          guidesGridHeading.textContent = currentTopic;
        }

        gridGuides.forEach(function (guide) {
          guidesGrid.appendChild(buildGuideCard(guide, false));
        });

        guidesGridSection.hidden = gridGuides.length === 0;

        if (currentTopic !== "All" && gridGuides.length === 0) {
          guidesStatus.textContent = "No guides in this topic yet. More are on the way.";
          guidesStatus.hidden = false;
        } else {
          guidesStatus.hidden = true;
        }
      }

      topicChips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          currentTopic = chip.dataset.topic;

          topicChips.forEach(function (otherChip) {
            const isActive = otherChip === chip;
            otherChip.classList.toggle("is-active", isActive);
            otherChip.setAttribute("aria-pressed", String(isActive));
          });

          renderGuides();
        });
      });

      guidesSupabase
        .from("blog_posts")
        .select(
          "title, slug, summary, content, category, cover_image_path, cover_image_alt, published_at",
        )
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(100)
        .then(function (result) {
          if (result.error) {
            console.error("Guides error:", result.error);
            guidesStatus.textContent =
              "Sorry, we could not load the guides. Please check your connection and try again.";
            return;
          }

          publishedGuides = result.data || [];
          renderGuides();
        });
    }

    // ---------- SINGLE GUIDE PAGE (guide.html) ----------
    if (guideBody) {
      const guideStatus = document.querySelector("#guideStatus");
      const guideArticle = document.querySelector("#guideArticle");
      const guideNotFound = document.querySelector("#guideNotFound");
      const relatedSection = document.querySelector("#relatedSection");
      const relatedGuides = document.querySelector("#relatedGuides");

      const slug = new URLSearchParams(window.location.search).get("slug") || "";

      function showGuideNotFound() {
        guideStatus.hidden = true;
        guideNotFound.hidden = false;
        document.title = "Guide not found | SettleBridge";
      }

      function setMetaDescription(text) {
        const meta = document.querySelector('meta[name="description"]');
        if (meta && text) meta.setAttribute("content", text);
      }

      // Tells Google the one official address of this guide
      function setCanonicalUrl(url) {
        let link = document.querySelector('link[rel="canonical"]');

        if (!link) {
          link = document.createElement("link");
          link.rel = "canonical";
          document.head.appendChild(link);
        }

        link.href = url;
      }

      async function loadRelatedGuides(guide) {
        const { data, error } = await guidesSupabase
          .from("blog_posts")
          .select(
            "title, slug, summary, content, category, cover_image_path, cover_image_alt, published_at",
          )
          .eq("status", "published")
          .neq("slug", guide.slug)
          .order("published_at", { ascending: false })
          .limit(12);

        if (error || !data || data.length === 0) return;

        // Same topic first, then the newest others
        const sameTopic = data.filter(function (item) {
          return item.category === guide.category;
        });
        const otherTopics = data.filter(function (item) {
          return item.category !== guide.category;
        });

        sameTopic
          .concat(otherTopics)
          .slice(0, 3)
          .forEach(function (item) {
            relatedGuides.appendChild(buildGuideCard(item, false));
          });

        relatedSection.hidden = false;
      }

      async function loadGuide() {
        if (!GUIDE_SLUG_PATTERN.test(slug)) {
          showGuideNotFound();
          return;
        }

        const { data: guide, error } = await guidesSupabase
          .from("blog_posts")
          .select(
            "title, slug, summary, content, category, cover_image_path, cover_image_alt, published_at, seo_title, meta_description",
          )
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle();

        if (error) {
          console.error("Guide error:", error);
          guideStatus.textContent =
            "Sorry, we could not load this guide. Please check your connection and try again.";
          return;
        }

        if (!guide) {
          showGuideNotFound();
          return;
        }

        // Page title and Google description (from the SEO panel in the admin editor)
        document.title =
          fillGuideTags(guide.seo_title || "{title} {sep} {site}", guide) ||
          guide.title + " | SettleBridge";
        setMetaDescription(fillGuideTags(guide.meta_description || "{summary}", guide));
        setCanonicalUrl(
          GUIDE_SITE_URL + "/guide.html?slug=" + encodeURIComponent(guide.slug),
        );

        // Heading
        document.querySelector("#guideBreadcrumbCategory").textContent = guide.category;
        document.querySelector("#guideCategory").textContent = guide.category;
        document.querySelector("#guideTitle").textContent = guide.title;
        document.querySelector("#guideSummary").textContent = guide.summary || "";
        document.querySelector("#guideMeta").textContent =
          "By the SettleBridge team · " +
          formatGuideDate(guide.published_at) +
          " · " +
          getReadingTime(guide.content);

        // Cover image
        const cover = document.querySelector("#guideCover");
        if (guide.cover_image_path) {
          cover.src = getGuideImageUrl(guide.cover_image_path);
          cover.alt = guide.cover_image_alt || "";
          cover.hidden = false;
        }

        // Content: Markdown turned into HTML, then cleaned by DOMPurify
        if (window.marked && window.DOMPurify) {
          guideBody.innerHTML = window.DOMPurify.sanitize(
            window.marked.parse(guide.content || ""),
          );
        } else {
          // The Markdown tools did not load: show plain text, which is always safe
          guideBody.textContent = guide.content || "";
          guideBody.style.whiteSpace = "pre-line";
        }

        guideStatus.hidden = true;
        guideArticle.hidden = false;

        loadRelatedGuides(guide);
      }

      loadGuide();
    }
  }

  // =====================================
  // 14. SERVICES PAGE: APPROVED PROVIDERS
  // =====================================
  // Shows only LISTED providers (the database security rules enforce this).
  // Provider email, phone and WhatsApp are never loaded here.

  const providerList = document.querySelector("#providerList");

  if (providerList) {
    const servicesSupabase = window.supabase.createClient(
      "https://jnvirsxymqdginyatyjq.supabase.co",
      "sb_publishable_axNzNrJ9AD2qZeS7EYHrFA_pTYlnfs8",
    );

    const providerSearchForm = document.querySelector("#providerSearchForm");
    const providerKeyword = document.querySelector("#providerKeyword");
    const providerCitySelect = document.querySelector("#providerCitySelect");
    const providerSort = document.querySelector("#providerSort");
    const providerResultsCount = document.querySelector("#providerResultsCount");
    const categoryFilters = document.querySelector("#categoryFilters");
    const cityFilters = document.querySelector("#cityFilters");
    const languageFilters = document.querySelector("#languageFilters");
    const clearProviderFilters = document.querySelector("#clearProviderFilters");
    const clearProviderFiltersEmpty = document.querySelector("#clearProviderFiltersEmpty");
    const providersEmpty = document.querySelector("#providersEmpty");
    const providersNoMatch = document.querySelector("#providersNoMatch");
    const providersError = document.querySelector("#providersError");

    let allProviders = [];
    let categoriesById = {};
    const selectedCategories = new Set(); // category slugs
    const selectedCities = new Set(); // lowercase city names
    const selectedLanguages = new Set(); // lowercase languages

    // SMALL HELPERS
    function normaliseWord(text) {
      return (text || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
    }

    function capitalise(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    }

    // "Portuguese, English and French" -> ["portuguese", "english", "french"]
    function getLanguages(provider) {
      return (provider.languages || "")
        .split(/,|;|\/|\band\b|&/i)
        .map(normaliseWord)
        .filter(Boolean);
    }

    function formatEuros(amount) {
      const value = Number(amount);

      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      }).format(value);
    }

    function getPriceText(provider) {
      const hasPrice = provider.base_price !== null && provider.base_price !== undefined;

      if (provider.pricing_type === "quote" || !hasPrice) return "Price on request";
      if (provider.pricing_type === "hourly") return formatEuros(provider.base_price) + " per hour";
      return "From " + formatEuros(provider.base_price);
    }

    function shortenText(text, maxLength) {
      const clean = (text || "").replace(/\s+/g, " ").trim();
      return clean.length > maxLength ? clean.slice(0, maxLength - 1).trimEnd() + "…" : clean;
    }

    function getCategory(provider) {
      return categoriesById[provider.category_id] || null;
    }

    // BUILD A CHECKBOX FILTER
    function buildCheckbox(container, name, value, labelText, count, selectedSet) {
      const label = document.createElement("label");
      label.className = "filter-option";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = name;
      input.value = value;
      input.checked = selectedSet.has(value);

      input.addEventListener("change", function () {
        if (input.checked) {
          selectedSet.add(value);
        } else {
          selectedSet.delete(value);
        }

        if (name === "location") syncCitySelect();
        renderProviders();
      });

      const text = document.createElement("span");
      text.textContent = labelText;

      const countBadge = document.createElement("span");
      countBadge.className = "filter-count";
      countBadge.textContent = count;

      label.appendChild(input);
      label.appendChild(text);
      label.appendChild(countBadge);
      container.appendChild(label);
    }

    // FILL THE FILTERS FROM THE REAL DATA
    function buildFilters(categories) {
      categoryFilters.replaceChildren();
      cityFilters.replaceChildren();
      languageFilters.replaceChildren();

      // Categories (every category, with how many providers are in it)
      categories.forEach(function (category) {
        const count = allProviders.filter(function (provider) {
          return provider.category_id === category.id;
        }).length;

        buildCheckbox(categoryFilters, "category", category.slug, category.name, count, selectedCategories);
      });

      // Cities (only cities that have providers)
      const cityCounts = {};
      const cityNames = {};

      allProviders.forEach(function (provider) {
        const key = normaliseWord(provider.city);
        if (!key) return;
        cityCounts[key] = (cityCounts[key] || 0) + 1;
        cityNames[key] = cityNames[key] || provider.city.trim();
      });

      Object.keys(cityNames)
        .sort()
        .forEach(function (key) {
          buildCheckbox(cityFilters, "location", key, cityNames[key], cityCounts[key], selectedCities);
        });

      if (Object.keys(cityNames).length === 0) {
        cityFilters.textContent = "No locations yet.";
      }

      // City dropdown in the search bar
      const previousCity = providerCitySelect.value;
      providerCitySelect.replaceChildren();

      const allOption = document.createElement("option");
      allOption.value = "";
      allOption.textContent = "All locations";
      providerCitySelect.appendChild(allOption);

      Object.keys(cityNames)
        .sort()
        .forEach(function (key) {
          const option = document.createElement("option");
          option.value = key;
          option.textContent = cityNames[key];
          providerCitySelect.appendChild(option);
        });

      providerCitySelect.value = previousCity;
      syncCitySelect();

      // Languages (from what providers wrote)
      const languageCounts = {};

      allProviders.forEach(function (provider) {
        new Set(getLanguages(provider)).forEach(function (language) {
          languageCounts[language] = (languageCounts[language] || 0) + 1;
        });
      });

      Object.keys(languageCounts)
        .sort()
        .forEach(function (language) {
          buildCheckbox(
            languageFilters,
            "language",
            language,
            capitalise(language),
            languageCounts[language],
            selectedLanguages,
          );
        });

      if (Object.keys(languageCounts).length === 0) {
        languageFilters.textContent = "No languages yet.";
      }
    }

    // Keep the search bar's city dropdown in step with the Location checkboxes
    function syncCitySelect() {
      providerCitySelect.value =
        selectedCities.size === 1 ? Array.from(selectedCities)[0] : "";
    }

    // APPLY SEARCH, FILTERS AND SORTING
    function getFilteredProviders() {
      const keyword = normaliseWord(providerKeyword.value);

      const filtered = allProviders.filter(function (provider) {
        const category = getCategory(provider);

        if (selectedCategories.size > 0 && !(category && selectedCategories.has(category.slug))) {
          return false;
        }

        if (selectedCities.size > 0 && !selectedCities.has(normaliseWord(provider.city))) {
          return false;
        }

        if (selectedLanguages.size > 0) {
          const languages = getLanguages(provider);
          const speaksOne = languages.some(function (language) {
            return selectedLanguages.has(language);
          });
          if (!speaksOne) return false;
        }

        if (keyword) {
          const searchable = normaliseWord(
            [
              provider.business_name,
              provider.description,
              provider.service_area,
              provider.city,
              category ? category.name : "",
            ].join(" "),
          );
          if (searchable.indexOf(keyword) === -1) return false;
        }

        return true;
      });

      const sort = providerSort.value;

      return filtered.sort(function (a, b) {
        if (sort === "newest") return new Date(b.created_at) - new Date(a.created_at);

        // Providers without a price ("Price on request") always go last
        const priceA = a.pricing_type === "quote" || a.base_price === null ? null : Number(a.base_price);
        const priceB = b.pricing_type === "quote" || b.base_price === null ? null : Number(b.base_price);

        if (priceA === null && priceB === null) return 0;
        if (priceA === null) return 1;
        if (priceB === null) return -1;

        return sort === "price-low" ? priceA - priceB : priceB - priceA;
      });
    }

    // BUILD ONE PROVIDER CARD (all text set with textContent, never as HTML)
    function buildProviderCard(provider) {
      const profileUrl = "provider.html?slug=" + encodeURIComponent(provider.slug);
      const category = getCategory(provider);

      const card = document.createElement("article");
      card.className = "service-card provider-card";

      const content = document.createElement("div");
      content.className = "service-card-content";

      const categoryLabel = document.createElement("span");
      categoryLabel.className = "service-category";
      categoryLabel.textContent = category ? category.name : "Service";

      const title = document.createElement("h3");
      const titleLink = document.createElement("a");
      titleLink.href = profileUrl;
      titleLink.textContent = provider.business_name;
      title.appendChild(titleLink);

      const location = document.createElement("p");
      location.className = "provider-location";
      const sameAsCity = normaliseWord(provider.service_area) === normaliseWord(provider.city);
      location.textContent = [provider.city, sameAsCity ? "" : provider.service_area]
        .filter(Boolean)
        .join(" · ");

      const description = document.createElement("p");
      description.textContent = shortenText(provider.description, 150);

      content.appendChild(categoryLabel);
      content.appendChild(title);
      if (location.textContent) content.appendChild(location);
      content.appendChild(description);

      const languages = getLanguages(provider);
      if (languages.length > 0) {
        const languageList = document.createElement("ul");
        languageList.className = "provider-languages";
        languageList.setAttribute("aria-label", "Languages spoken");

        languages.slice(0, 4).forEach(function (language) {
          const item = document.createElement("li");
          item.textContent = capitalise(language);
          languageList.appendChild(item);
        });

        content.appendChild(languageList);
      }

      const meta = document.createElement("div");
      meta.className = "service-meta";

      const price = document.createElement("span");
      price.className = "service-price";
      price.textContent = getPriceText(provider);

      const profileLink = document.createElement("a");
      profileLink.href = profileUrl;
      profileLink.className = "provider-profile-link";
      profileLink.textContent = "View profile";
      profileLink.setAttribute("aria-label", "View profile: " + provider.business_name);

      meta.appendChild(price);
      meta.appendChild(profileLink);
      content.appendChild(meta);

      card.appendChild(content);
      return card;
    }

    // SHOW THE RESULTS
    function renderProviders() {
      const providers = getFilteredProviders();
      const hasFilters =
        selectedCategories.size > 0 ||
        selectedCities.size > 0 ||
        selectedLanguages.size > 0 ||
        providerKeyword.value.trim() !== "";

      providerList.replaceChildren();
      providers.forEach(function (provider) {
        providerList.appendChild(buildProviderCard(provider));
      });

      providersEmpty.hidden = allProviders.length > 0;
      providersNoMatch.hidden = allProviders.length === 0 || providers.length > 0;
      providerList.hidden = providers.length === 0;
      clearProviderFilters.hidden = !hasFilters;

      providerResultsCount.textContent =
        allProviders.length === 0
          ? "New providers are being reviewed."
          : providers.length + (providers.length === 1 ? " provider found." : " providers found.");

      // Keep the address bar up to date, so a search can be shared or bookmarked
      const params = new URLSearchParams();
      if (providerKeyword.value.trim()) params.set("service", providerKeyword.value.trim());
      if (selectedCities.size === 1) params.set("city", Array.from(selectedCities)[0]);
      if (selectedCategories.size === 1) params.set("category", Array.from(selectedCategories)[0]);

      const query = params.toString();
      window.history.replaceState(null, "", "services.html" + (query ? "?" + query : ""));
    }

    function clearAllFilters() {
      selectedCategories.clear();
      selectedCities.clear();
      selectedLanguages.clear();
      providerKeyword.value = "";

      document
        .querySelectorAll(".filter-sidebar input[type='checkbox']")
        .forEach(function (checkbox) {
          checkbox.checked = false;
        });

      syncCitySelect();
      renderProviders();
    }

    // SEARCH BAR, SORTING AND CLEAR BUTTONS
    providerSearchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      renderProviders();
    });

    providerKeyword.addEventListener("input", renderProviders);

    providerCitySelect.addEventListener("change", function () {
      selectedCities.clear();
      if (providerCitySelect.value) selectedCities.add(providerCitySelect.value);

      cityFilters.querySelectorAll("input").forEach(function (checkbox) {
        checkbox.checked = selectedCities.has(checkbox.value);
      });

      renderProviders();
    });

    providerSort.addEventListener("change", renderProviders);
    clearProviderFilters.addEventListener("click", clearAllFilters);
    clearProviderFiltersEmpty.addEventListener("click", clearAllFilters);

    // READ A SEARCH FROM THE ADDRESS BAR (for example from the home page search)
    const startParams = new URLSearchParams(window.location.search);
    providerKeyword.value = startParams.get("service") || startParams.get("keyword") || "";
    if (startParams.get("city")) selectedCities.add(normaliseWord(startParams.get("city")));
    if (startParams.get("category")) selectedCategories.add(startParams.get("category"));

    // LOAD CATEGORIES AND PROVIDERS
    Promise.all([
      servicesSupabase
        .from("service_categories")
        .select("id, name, slug")
        .order("name", { ascending: true }),
      servicesSupabase
        .from("providers")
        .select(
          "business_name, slug, category_id, city, description, languages, service_area, pricing_type, base_price, created_at",
        )
        .eq("is_listed", true)
        .order("created_at", { ascending: false })
        .limit(500),
    ]).then(function (results) {
      const categoryResult = results[0];
      const providerResult = results[1];

      if (categoryResult.error || providerResult.error) {
        console.error("Services error:", categoryResult.error || providerResult.error);
        providersError.hidden = false;
        providerResultsCount.textContent = "";
        return;
      }

      categoriesById = {};
      (categoryResult.data || []).forEach(function (category) {
        categoriesById[category.id] = category;
      });

      allProviders = providerResult.data || [];

      buildFilters(categoryResult.data || []);
      renderProviders();
    });
  }

  // =====================================
  // 15. PROVIDER PROFILE AND SERVICE REQUESTS
  // =====================================
  // Visitors can SEND a request but never read one: the database rules enforce this.

  const providerProfile = document.querySelector("#providerProfile");

  if (providerProfile) {
    const profileSupabase = window.supabase.createClient(
      "https://jnvirsxymqdginyatyjq.supabase.co",
      "sb_publishable_axNzNrJ9AD2qZeS7EYHrFA_pTYlnfs8",
    );

    const PROVIDER_SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    const providerStatus = document.querySelector("#providerStatus");
    const providerNotFound = document.querySelector("#providerNotFound");
    const requestForm = document.querySelector("#serviceRequestForm");
    const requestFormCard = document.querySelector("#requestFormCard");
    const requestSuccess = document.querySelector("#requestSuccess");
    const requestError = document.querySelector("#requestError");
    const requestSubmit = document.querySelector("#requestSubmit");
    const requestPhone = document.querySelector("#requestPhone");
    const phoneRequiredMark = document.querySelector("#phoneRequiredMark");
    const requestMessage = document.querySelector("#requestMessage");
    const requestMessageCount = document.querySelector("#requestMessageCount");
    const requestDate = document.querySelector("#requestDate");

    const providerSlug = new URLSearchParams(window.location.search).get("slug") || "";
    let currentProvider = null;

    function setProfileText(selector, value) {
      document.querySelector(selector).textContent =
        value && String(value).trim() ? String(value).trim() : "Not provided";
    }

    function splitLanguages(text) {
      return (text || "")
        .split(/,|;|\/|\band\b|&/i)
        .map(function (language) {
          return language.trim();
        })
        .filter(Boolean)
        .map(function (language) {
          return language.charAt(0).toUpperCase() + language.slice(1);
        });
    }

    function formatProfilePrice(provider) {
      const hasPrice = provider.base_price !== null && provider.base_price !== undefined;

      if (provider.pricing_type === "quote" || !hasPrice) return "Price on request";

      const value = Number(provider.base_price);
      const euros = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      }).format(value);

      return provider.pricing_type === "hourly" ? euros + " per hour" : "From " + euros;
    }

    function showProviderNotFound() {
      providerStatus.hidden = true;
      providerNotFound.hidden = false;
      document.title = "Provider not found | SettleBridge";
    }

    // LOAD THE PROVIDER
    async function loadProviderProfile() {
      if (!PROVIDER_SLUG_PATTERN.test(providerSlug)) {
        showProviderNotFound();
        return;
      }

      const { data: provider, error } = await profileSupabase
        .from("providers")
        .select(
          "id, business_name, slug, category_id, city, country, description, languages, service_area, pricing_type, base_price",
        )
        .eq("slug", providerSlug)
        .eq("is_listed", true)
        .maybeSingle();

      if (error) {
        console.error("Provider error:", error);
        providerStatus.textContent =
          "Sorry, we could not load this provider. Please check your connection and try again.";
        return;
      }

      if (!provider) {
        showProviderNotFound();
        return;
      }

      currentProvider = provider;

      let categoryName = "Service";
      if (provider.category_id) {
        const { data: category } = await profileSupabase
          .from("service_categories")
          .select("name")
          .eq("id", provider.category_id)
          .maybeSingle();

        if (category && category.name) categoryName = category.name;
      }

      const languages = splitLanguages(provider.languages);
      const place = [provider.city, provider.country].filter(Boolean).join(", ");

      // Page title and Google description
      document.title = provider.business_name + " | " + categoryName + " | SettleBridge";
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute(
          "content",
          (provider.description || "").replace(/\s+/g, " ").slice(0, 155),
        );
      }

      // Heading
      document.querySelector("#providerBreadcrumb").textContent = categoryName;
      document.querySelector("#providerCategory").textContent = categoryName;
      document.querySelector("#providerName").textContent = provider.business_name;
      document.querySelector("#providerLocation").textContent = place;
      document.querySelector("#providerPrice").textContent = formatProfilePrice(provider);
      document.querySelector("#requestProviderName").textContent = provider.business_name;

      const chips = document.querySelector("#providerLanguageChips");
      chips.replaceChildren();
      languages.forEach(function (language) {
        const chip = document.createElement("li");
        chip.textContent = language;
        chips.appendChild(chip);
      });

      // About and details
      setProfileText("#providerDescription", provider.description);
      setProfileText("#detailCategory", categoryName);
      setProfileText("#detailCity", place);
      setProfileText("#detailArea", provider.service_area);
      setProfileText("#detailLanguages", languages.join(", "));
      setProfileText("#detailPricing", formatProfilePrice(provider));

      providerStatus.hidden = true;
      providerProfile.hidden = false;
    }

    // REQUEST FORM
    function getPreferredContact() {
      const checked = requestForm.querySelector('input[name="preferredContact"]:checked');
      return checked ? checked.value : "email";
    }

    function updatePhoneRequirement() {
      const needsPhone = getPreferredContact() !== "email";
      requestPhone.required = needsPhone;
      phoneRequiredMark.textContent = needsPhone ? "*" : "(optional)";
    }

    function showRequestError(message, field) {
      requestError.textContent = message;
      requestError.hidden = false;
      if (field) field.focus();
    }

    // Today's date in the visitor's own time zone, as YYYY-MM-DD
    function getTodayString() {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      return now.toISOString().slice(0, 10);
    }

    requestDate.min = getTodayString();

    requestForm.querySelectorAll('input[name="preferredContact"]').forEach(function (radio) {
      radio.addEventListener("change", updatePhoneRequirement);
    });

    requestMessage.addEventListener("input", function () {
      requestMessageCount.textContent = requestMessage.value.length + " / 2000";
    });

    requestForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      requestError.hidden = true;

      if (!currentProvider) return;

      const name = document.querySelector("#requestName").value.trim();
      const email = document.querySelector("#requestEmail").value.trim();
      const phone = requestPhone.value.trim();
      const date = requestDate.value;
      const message = requestMessage.value.trim();
      const consent = document.querySelector("#requestConsent").checked;
      const preferredContact = getPreferredContact();

      // Spam trap: real people never see or fill this field
      if (document.querySelector("#requestWebsite").value) return;

      if (name.length < 2) {
        showRequestError("Please enter your name.", document.querySelector("#requestName"));
        return;
      }

      if (!EMAIL_PATTERN.test(email)) {
        showRequestError("Please enter a valid email address.", document.querySelector("#requestEmail"));
        return;
      }

      if (preferredContact !== "email" && phone.length < 6) {
        showRequestError("Please add a phone number so we can call or message you.", requestPhone);
        return;
      }

      if (date && date < getTodayString()) {
        showRequestError("Please choose a date from today onwards.", requestDate);
        return;
      }

      if (message.length < 10) {
        showRequestError("Please tell us a little more about what you need (at least 10 characters).", requestMessage);
        return;
      }

      if (!consent) {
        showRequestError("Please tick the box to agree before sending.", document.querySelector("#requestConsent"));
        return;
      }

      requestSubmit.disabled = true;
      requestSubmit.textContent = "Sending...";

      try {
        // No .select() here: visitors are not allowed to read requests back
        const { error } = await profileSupabase.from("service_requests").insert({
          provider_id: currentProvider.id,
          provider_name: currentProvider.business_name,
          requester_name: name,
          requester_email: email,
          requester_phone: phone || null,
          preferred_contact: preferredContact,
          preferred_date: date || null,
          message: message,
          consent: true,
        });

        if (error) {
          console.error("Request error:", error);

          const text = String(error.message || "");
          let friendly = "Sorry, we could not send your request. Please try again.";

          if (text.indexOf("too_many_requests") !== -1) {
            friendly = "You've sent several requests in the last hour. Please wait a little and try again.";
          } else if (text.indexOf("provider_not_available") !== -1) {
            friendly = "This provider is no longer available. Please choose another provider.";
          } else if (text.indexOf("date_in_past") !== -1) {
            friendly = "Please choose a date from today onwards.";
          }

          showRequestError(friendly);
          return;
        }

        requestFormCard.hidden = true;
        requestSuccess.hidden = false;
        requestSuccess.focus();
      } finally {
        requestSubmit.disabled = false;
        requestSubmit.textContent = "Send request";
      }
    });

    loadProviderProfile();
  }

  // =====================================
  // 16. ADMIN SERVICE REQUESTS
  // =====================================
  // Only admins can read requests: the database security rules enforce this.

  const requestsTable = document.querySelector("#requestsTable");

  if (requestsTable) {
    const requestsSupabase = window.supabase.createClient(
      "https://jnvirsxymqdginyatyjq.supabase.co",
      "sb_publishable_axNzNrJ9AD2qZeS7EYHrFA_pTYlnfs8",
    );

    const REQUEST_STATUS_LABELS = {
      new: "New",
      contacted: "Contacted",
      forwarded: "Forwarded",
      closed: "Closed",
    };

    const CONTACT_LABELS = {
      email: "Email",
      phone: "Phone call",
      whatsapp: "WhatsApp",
    };

    function byRequestId(id) {
      return document.getElementById(id);
    }

    const requestsMessage = byRequestId("adminMessage");
    const requestsLogout = byRequestId("adminLogout");
    const requestSearch = byRequestId("requestSearch");
    const requestTabs = document.querySelectorAll("[data-request-tab]");
    const requestsEmpty = byRequestId("requestsEmpty");
    const requestToast = byRequestId("requestToast");
    const requestToastText = byRequestId("requestToastText");
    const requestDetailEmpty = byRequestId("requestDetailEmpty");
    const requestDetail = byRequestId("requestDetail");
    const requestNotes = byRequestId("requestNotes");
    const requestNotesStatus = byRequestId("requestNotesStatus");
    const saveNotesButton = byRequestId("saveNotesButton");
    const statusButtons = document.querySelectorAll("[data-set-status]");
    const requestDeleteStart = byRequestId("requestDeleteStart");
    const requestDeleteConfirm = byRequestId("requestDeleteConfirm");

    let allRequests = [];
    let providersById = {};
    let currentRequestTab = "new";
    let selectedRequestId = null;
    let requestBusy = false;

    // SMALL HELPERS
    function formatRequestDate(value, withTime) {
      if (!value) return "Not given";

      const options = { day: "numeric", month: "short", year: "numeric" };
      if (withTime) {
        options.hour = "2-digit";
        options.minute = "2-digit";
      }

      // Dates without a time (YYYY-MM-DD) are read as local dates
      const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + "T00:00:00") : new Date(value);
      return date.toLocaleString("en-GB", options);
    }

    function setRequestText(id, value) {
      byRequestId(id).textContent = value && String(value).trim() ? String(value).trim() : "Not provided";
    }

    // Put a link (email, phone) inside a details cell
    function setRequestLink(id, href, text) {
      const cell = byRequestId(id);
      cell.replaceChildren();

      if (!text) {
        cell.textContent = "Not provided";
        return;
      }

      const link = document.createElement("a");
      link.href = href;
      link.textContent = text;
      link.className = "sba-text-link";
      cell.appendChild(link);
    }

    function phoneForLinks(phone) {
      return (phone || "").replace(/[^\d+]/g, "");
    }

    function createRequestBadge(status) {
      const badge = document.createElement("span");
      badge.className = "sba-badge sba-badge-request-" + (REQUEST_STATUS_LABELS[status] ? status : "new");
      badge.textContent = REQUEST_STATUS_LABELS[status] || status;
      return badge;
    }

    function showRequestToast(text, kind) {
      requestToastText.textContent = text;
      requestToast.className = "sba-toast sba-toast-" + kind;
      requestToast.hidden = false;
    }

    function getSelectedRequest() {
      return allRequests.find(function (request) {
        return request.id === selectedRequestId;
      });
    }

    // CHECK ADMIN LOGIN AND PERMISSIONS
    async function checkRequestsAdminAccess() {
      const { data: sessionData, error: sessionError } =
        await requestsSupabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        window.location.href = "login.html";
        return false;
      }

      const { data: isAdmin, error: adminError } = await requestsSupabase.rpc(
        "is_settlebridge_admin",
      );

      if (adminError || !isAdmin) {
        alert("You do not have permission to access this page.");
        await requestsSupabase.auth.signOut();
        window.location.href = "login.html";
        return false;
      }

      return true;
    }

    // LOAD REQUESTS (and provider web addresses for the profile links)
    async function loadRequests() {
      const [requestResult, providerResult] = await Promise.all([
        requestsSupabase
          .from("service_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
        requestsSupabase.from("providers").select("id, slug, application_id, is_listed"),
      ]);

      if (requestResult.error) {
        console.error("Requests error:", requestResult.error);
        requestsMessage.textContent = "Unable to load requests. Please refresh the page.";
        requestsMessage.hidden = false;
        requestsTable.replaceChildren();
        return;
      }

      requestsMessage.hidden = true;
      allRequests = requestResult.data || [];

      providersById = {};
      (providerResult.data || []).forEach(function (provider) {
        providersById[provider.id] = provider;
      });

      updateRequestSummary();
      renderRequestsTable();
      renderRequestDetail();
    }

    // SUMMARY CARDS AND TAB COUNTS
    function updateRequestSummary() {
      const counts = { all: allRequests.length, new: 0, contacted: 0, forwarded: 0, closed: 0 };

      allRequests.forEach(function (request) {
        if (counts[request.status] !== undefined) counts[request.status] += 1;
      });

      byRequestId("totalRequests").textContent = counts.all;
      byRequestId("newRequestsCount").textContent = counts.new;
      byRequestId("contactedRequestsCount").textContent = counts.contacted;
      byRequestId("forwardedRequestsCount").textContent = counts.forwarded;
      byRequestId("closedRequestsCount").textContent = counts.closed;

      const oldestNew = allRequests
        .filter(function (request) {
          return request.status === "new";
        })
        .sort(function (a, b) {
          return new Date(a.created_at) - new Date(b.created_at);
        })[0];

      byRequestId("oldestNewRequest").textContent = oldestNew
        ? formatRequestDate(oldestNew.created_at)
        : "none";

      document.querySelectorAll("[data-request-count]").forEach(function (element) {
        element.textContent = counts[element.dataset.requestCount];
      });
    }

    // DISPLAY THE TABLE
    function renderRequestsTable() {
      const search = requestSearch.value.trim().toLowerCase();

      const requests = allRequests
        .filter(function (request) {
          if (currentRequestTab !== "all" && request.status !== currentRequestTab) return false;

          if (search) {
            const text = [request.requester_name, request.requester_email, request.provider_name]
              .join(" ")
              .toLowerCase();
            if (text.indexOf(search) === -1) return false;
          }

          return true;
        })
        .sort(function (a, b) {
          // New requests: oldest first, so nobody waits too long. Others: newest first.
          const difference = new Date(a.created_at) - new Date(b.created_at);
          return currentRequestTab === "new" ? difference : -difference;
        });

      requestsTable.replaceChildren();
      requestsEmpty.hidden = requests.length > 0;

      byRequestId("requestsEmptyTitle").textContent =
        allRequests.length === 0 ? "No requests yet" : "No requests here";
      byRequestId("requestsEmptyText").textContent =
        allRequests.length === 0
          ? "Requests from provider profile pages will appear here."
          : "Try another status or search.";

      requests.forEach(function (request) {
        const row = document.createElement("tr");
        row.className = "sba-row" + (request.id === selectedRequestId ? " is-selected" : "");
        row.addEventListener("click", function () {
          selectRequest(request.id);
        });

        const personCell = document.createElement("td");
        const openButton = document.createElement("button");
        openButton.type = "button";
        openButton.className = "sba-link";
        openButton.textContent = request.requester_name;
        const emailLine = document.createElement("div");
        emailLine.className = "sba-sub";
        emailLine.textContent = request.requester_email;
        personCell.appendChild(openButton);
        personCell.appendChild(emailLine);

        const providerCell = document.createElement("td");
        providerCell.textContent = request.provider_name;

        const dateCell = document.createElement("td");
        dateCell.className = "sba-nowrap";
        dateCell.textContent = request.preferred_date
          ? formatRequestDate(request.preferred_date)
          : "Flexible";

        const receivedCell = document.createElement("td");
        receivedCell.className = "sba-nowrap";
        receivedCell.textContent = formatRequestDate(request.created_at);

        const statusCell = document.createElement("td");
        statusCell.appendChild(createRequestBadge(request.status));

        row.appendChild(personCell);
        row.appendChild(providerCell);
        row.appendChild(dateCell);
        row.appendChild(receivedCell);
        row.appendChild(statusCell);
        requestsTable.appendChild(row);
      });
    }

    function selectRequest(requestId) {
      selectedRequestId = requestId;
      requestToast.hidden = true;
      requestDeleteConfirm.hidden = true;
      requestDeleteStart.hidden = false;

      renderRequestsTable();
      renderRequestDetail();

      if (window.innerWidth < 900) {
        requestDetail.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    // DISPLAY THE DETAILS PANEL
    function renderRequestDetail() {
      const request = getSelectedRequest();

      if (!request) {
        requestDetailEmpty.hidden = false;
        requestDetail.hidden = true;
        return;
      }

      requestDetailEmpty.hidden = true;
      requestDetail.hidden = false;

      const badge = createRequestBadge(request.status);
      const statusBadge = byRequestId("requestStatusBadge");
      statusBadge.className = badge.className;
      statusBadge.textContent = badge.textContent;

      byRequestId("requestReceived").textContent =
        "Received " + formatRequestDate(request.created_at, true);
      setRequestText("requestName", request.requester_name);
      setRequestText("requestProviderLabel", request.provider_name);

      // Newcomer
      setRequestLink("requestEmail", "mailto:" + request.requester_email, request.requester_email);
      setRequestLink(
        "requestPhone",
        "tel:" + phoneForLinks(request.requester_phone),
        request.requester_phone,
      );
      setRequestText("requestPreferred", CONTACT_LABELS[request.preferred_contact]);
      setRequestText(
        "requestDateWanted",
        request.preferred_date ? formatRequestDate(request.preferred_date) : "Flexible",
      );
      setRequestText("requestMessageText", request.message);

      // Provider name (with a link to its public profile when it is still listed)
      const provider = providersById[request.provider_id];
      if (provider && provider.is_listed) {
        setRequestLink(
          "requestProviderName",
          "provider.html?slug=" + encodeURIComponent(provider.slug),
          request.provider_name,
        );
        byRequestId("requestProviderName").querySelector("a").target = "_blank";
      } else {
        setRequestText(
          "requestProviderName",
          request.provider_name + (provider ? " (hidden)" : " (removed)"),
        );
      }

      // Provider contact details are loaded separately (they are private)
      setRequestText("requestProviderContact", "Loading...");
      setRequestText("requestProviderEmail", "Loading...");
      setRequestText("requestProviderPhone", "Loading...");
      byRequestId("emailProviderLink").hidden = true;
      loadProviderContact(request, provider);

      // Quick actions
      const subject = "Your SettleBridge request: " + request.provider_name;
      const greeting =
        "Hello " + request.requester_name + ",\n\n" +
        "Thank you for your request for " + request.provider_name + " on SettleBridge.\n\n";

      byRequestId("emailRequesterLink").href =
        "mailto:" + encodeURIComponent(request.requester_email) +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(greeting);

      const whatsappLink = byRequestId("whatsappRequesterLink");
      const whatsappNumber = phoneForLinks(request.requester_phone).replace(/^\+/, "");
      whatsappLink.hidden = whatsappNumber.length < 6;
      if (!whatsappLink.hidden) {
        whatsappLink.href =
          "https://wa.me/" + whatsappNumber + "?text=" +
          encodeURIComponent(greeting.replace(/\n\n/g, " ").trim());
      }

      // Status buttons
      statusButtons.forEach(function (button) {
        const isCurrent = button.dataset.setStatus === request.status;
        button.classList.toggle("is-active", isCurrent);
        button.setAttribute("aria-pressed", String(isCurrent));
        button.disabled = requestBusy;
      });

      // Notes
      requestNotes.value = request.admin_notes || "";
      requestNotesStatus.textContent = "";
    }

    async function loadProviderContact(request, provider) {
      if (!provider || !provider.application_id) {
        setRequestText("requestProviderContact", "");
        setRequestText("requestProviderEmail", "");
        setRequestText("requestProviderPhone", "");
        return;
      }

      const { data: application, error } = await requestsSupabase
        .from("provider_applications")
        .select("contact_name, email, phone, whatsapp")
        .eq("id", provider.application_id)
        .maybeSingle();

      // Stop if the admin has already clicked another request
      if (selectedRequestId !== request.id) return;

      if (error || !application) {
        setRequestText("requestProviderContact", "Could not load");
        setRequestText("requestProviderEmail", "");
        setRequestText("requestProviderPhone", "");
        return;
      }

      setRequestText("requestProviderContact", application.contact_name);
      setRequestLink("requestProviderEmail", "mailto:" + application.email, application.email);

      const providerPhone = application.whatsapp || application.phone;
      setRequestLink("requestProviderPhone", "tel:" + phoneForLinks(providerPhone), providerPhone);

      if (application.email) {
        const lines = [
          "Hello " + (application.contact_name || "") + ",",
          "",
          "A newcomer has asked for your service through SettleBridge:",
          "",
          "Name: " + request.requester_name,
          "Email: " + request.requester_email,
          "Phone: " + (request.requester_phone || "Not provided"),
          "Prefers: " + (CONTACT_LABELS[request.preferred_contact] || "Email"),
          "Date wanted: " +
            (request.preferred_date ? formatRequestDate(request.preferred_date) : "Flexible"),
          "",
          "Message:",
          request.message,
          "",
          "Please reply to let us know whether you can help.",
          "",
          "The SettleBridge Team",
        ];

        const providerLink = byRequestId("emailProviderLink");
        providerLink.href =
          "mailto:" + encodeURIComponent(application.email) +
          "?subject=" + encodeURIComponent("New SettleBridge request from " + request.requester_name) +
          "&body=" + encodeURIComponent(lines.join("\n"));
        providerLink.hidden = false;
      }
    }

    // SAVE CHANGES TO ONE REQUEST
    async function updateRequest(changes, successText) {
      const request = getSelectedRequest();
      if (!request || requestBusy) return false;

      requestBusy = true;
      renderRequestDetail();

      try {
        const { data, error } = await requestsSupabase
          .from("service_requests")
          .update(changes)
          .eq("id", request.id)
          .select()
          .single();

        if (error) {
          console.error("Request update error:", error);
          showRequestToast("Could not save this change. Please try again.", "error");
          return false;
        }

        Object.assign(request, data);
        showRequestToast(successText, "success");
        return true;
      } finally {
        requestBusy = false;
        updateRequestSummary();
        renderRequestsTable();
        renderRequestDetail();
      }
    }

    statusButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const newStatus = button.dataset.setStatus;
        const request = getSelectedRequest();
        if (!request || request.status === newStatus) return;

        updateRequest(
          { status: newStatus },
          "Marked as " + REQUEST_STATUS_LABELS[newStatus].toLowerCase() + ".",
        );
      });
    });

    saveNotesButton.addEventListener("click", async function () {
      const notes = requestNotes.value.trim();
      const saved = await updateRequest({ admin_notes: notes || null }, "Notes saved.");
      if (saved) requestNotesStatus.textContent = "Saved";
    });

    requestNotes.addEventListener("input", function () {
      requestNotesStatus.textContent = "Unsaved changes";
    });

    // DELETE (for data protection: when no longer needed, or if the person asks)
    byRequestId("requestDeleteButton").addEventListener("click", function () {
      requestDeleteStart.hidden = true;
      requestDeleteConfirm.hidden = false;
      byRequestId("requestDeleteCancel").focus();
    });

    byRequestId("requestDeleteCancel").addEventListener("click", function () {
      requestDeleteConfirm.hidden = true;
      requestDeleteStart.hidden = false;
    });

    byRequestId("requestDeleteConfirmButton").addEventListener("click", async function () {
      const request = getSelectedRequest();
      if (!request || requestBusy) return;

      requestBusy = true;
      this.disabled = true;

      try {
        const { data, error } = await requestsSupabase
          .from("service_requests")
          .delete()
          .eq("id", request.id)
          .select("id");

        if (error || !data || data.length === 0) {
          console.error("Request delete error:", error);
          showRequestToast("Could not delete this request. Please try again.", "error");
          return;
        }

        allRequests = allRequests.filter(function (item) {
          return item.id !== request.id;
        });
        selectedRequestId = null;
        requestDeleteConfirm.hidden = true;
        requestDeleteStart.hidden = false;
        showRequestToast("Request deleted.", "success");
      } finally {
        requestBusy = false;
        this.disabled = false;
        updateRequestSummary();
        renderRequestsTable();
        renderRequestDetail();
      }
    });

    // FILTERS
    requestTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        currentRequestTab = tab.dataset.requestTab;

        requestTabs.forEach(function (otherTab) {
          const isActive = otherTab === tab;
          otherTab.classList.toggle("is-active", isActive);
          otherTab.setAttribute("aria-pressed", String(isActive));
        });

        renderRequestsTable();
      });
    });

    requestSearch.addEventListener("input", renderRequestsTable);
    byRequestId("requestToastClose").addEventListener("click", function () {
      requestToast.hidden = true;
    });

    // LOGOUT
    if (requestsLogout) {
      requestsLogout.addEventListener("click", async function () {
        const { error } = await requestsSupabase.auth.signOut();

        if (error) {
          alert("Unable to log out. Please try again.");
          return;
        }

        window.location.href = "login.html";
      });
    }

    // START
    checkRequestsAdminAccess().then(function (isAdmin) {
      if (isAdmin) loadRequests();
    });
  }

  // =====================================
  // 17. ADMIN PROVIDERS: EDIT, HIDE, UNAPPROVE, DELETE
  // =====================================
  // Only admins can change providers: the database security rules enforce this.

  const providersAdminTable = document.querySelector("#providersAdminTable");

  if (providersAdminTable) {
    const providersAdminSupabase = window.supabase.createClient(
      "https://jnvirsxymqdginyatyjq.supabase.co",
      "sb_publishable_axNzNrJ9AD2qZeS7EYHrFA_pTYlnfs8",
    );

    function pa(id) {
      return document.getElementById(id);
    }

    const providerAdminSearch = pa("providerAdminSearch");
    const providerAdminTabs = document.querySelectorAll("[data-provider-tab]");
    const providerEditForm = pa("providerEditForm");
    const providerEditPanel = pa("providerEditPanel");
    const providerEditEmpty = pa("providerEditEmpty");
    const providerToast = pa("providerToast");
    const providerSaveButton = pa("providerSaveButton");
    const providerSaveStatus = pa("providerSaveStatus");
    const toggleListedButton = pa("toggleListedButton");
    const editDescription = pa("editDescription");

    let adminProviders = [];
    let adminCategories = [];
    let requestCounts = {};
    let agreementsByProvider = {}; // latest agreement for each provider
    let currentApplication = null; // the selected provider's application (private)
    let currentProviderTab = "all";
    let selectedProviderId = null;
    let providerBusy = false;
    let providerFormChanged = false;

    // SMALL HELPERS
    function formatProviderDate(value) {
      if (!value) return "Not known";
      return new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }

    function formatAdminPrice(provider) {
      const hasPrice = provider.base_price !== null && provider.base_price !== undefined;
      if (provider.pricing_type === "quote" || !hasPrice) return "On request";

      const value = Number(provider.base_price);
      const euros = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      }).format(value);

      return provider.pricing_type === "hourly" ? euros + "/hour" : "From " + euros;
    }

    function getSelectedProvider() {
      return adminProviders.find(function (provider) {
        return provider.id === selectedProviderId;
      });
    }

    function getCategoryName(categoryId) {
      const category = adminCategories.find(function (item) {
        return item.id === categoryId;
      });
      return category ? category.name : "No category";
    }

    function showProviderToast(text, kind) {
      pa("providerToastText").textContent = text;
      providerToast.className = "sba-toast sba-toast-" + kind;
      providerToast.hidden = false;
      providerToast.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function setContactCell(id, href, text) {
      const cell = pa(id);
      cell.replaceChildren();

      if (!text) {
        cell.textContent = "Not provided";
        return;
      }

      if (!href) {
        cell.textContent = text;
        return;
      }

      const link = document.createElement("a");
      link.href = href;
      link.className = "sba-text-link";
      link.textContent = text;
      cell.appendChild(link);
    }

    function setProviderBusy(busy) {
      providerBusy = busy;
      document
        .querySelectorAll("#providerEditPanel button")
        .forEach(function (button) {
          button.disabled = busy;
        });
    }

    function closeConfirmBoxes() {
      pa("unapproveConfirm").hidden = true;
      pa("deleteProviderConfirm").hidden = true;
      pa("deleteApplicationToo").checked = false;
    }

    // CHECK ADMIN LOGIN AND PERMISSIONS
    async function checkProvidersAdminAccess() {
      const { data: sessionData, error: sessionError } =
        await providersAdminSupabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        window.location.href = "login.html";
        return false;
      }

      const { data: isAdmin, error: adminError } = await providersAdminSupabase.rpc(
        "is_settlebridge_admin",
      );

      if (adminError || !isAdmin) {
        alert("You do not have permission to access this page.");
        await providersAdminSupabase.auth.signOut();
        window.location.href = "login.html";
        return false;
      }

      return true;
    }

    // LOAD PROVIDERS, CATEGORIES AND HOW MANY REQUESTS EACH HAS
    async function loadAdminProviders() {
      const [providerResult, categoryResult, requestResult, agreementResult] = await Promise.all([
        providersAdminSupabase.from("providers").select("*").order("business_name"),
        providersAdminSupabase.from("service_categories").select("id, name").order("name"),
        providersAdminSupabase.from("service_requests").select("provider_id"),
        providersAdminSupabase
          .from("provider_agreements")
          .select(
            "id, provider_id, application_id, reference, status, sent_at, email_sent_at, email_error, signed_at, signer_name, signer_ip, signed_language, signed_email_sent_at, token_expires_at, reminder_count, last_reminder_at, reminder_error",
          )
          .order("created_at", { ascending: false }),
      ]);

      if (providerResult.error || categoryResult.error) {
        console.error("Providers error:", providerResult.error || categoryResult.error);
        pa("adminMessage").textContent = "Unable to load providers. Please refresh the page.";
        pa("adminMessage").hidden = false;
        providersAdminTable.replaceChildren();
        return;
      }

      pa("adminMessage").hidden = true;
      adminProviders = providerResult.data || [];
      adminCategories = categoryResult.data || [];

      requestCounts = {};
      (requestResult.data || []).forEach(function (request) {
        if (request.provider_id) {
          requestCounts[request.provider_id] = (requestCounts[request.provider_id] || 0) + 1;
        }
      });

      // Fill the category dropdown once
      const categorySelect = pa("editCategory");
      categorySelect.replaceChildren();

      const noneOption = document.createElement("option");
      noneOption.value = "";
      noneOption.textContent = "No category";
      categorySelect.appendChild(noneOption);

      adminCategories.forEach(function (category) {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });

      // Latest agreement per provider (a signed one wins over a newer unsigned one)
      agreementsByProvider = {};
      const agreements = agreementResult.error ? [] : agreementResult.data || [];
      adminProviders.forEach(function (provider) {
        const own = agreements.filter(function (agreement) {
          return (
            agreement.provider_id === provider.id ||
            (provider.application_id && agreement.application_id === provider.application_id)
          );
        });
        agreementsByProvider[provider.id] =
          own.find(function (agreement) {
            return agreement.status === "signed";
          }) ||
          own.find(function (agreement) {
            return agreement.status === "sent";
          }) ||
          own[0] ||
          null;
      });

      updateProviderSummary();
      renderProvidersAdminTable();
      renderProviderEditPanel(true);
    }

    function getAgreementLabel(agreement) {
      if (!agreement) return "No agreement";
      if (agreement.status === "signed") return "Agreement signed";
      if (agreement.status === "void") return "Agreement replaced";
      return "Agreement sent";
    }

    function updateProviderSummary() {
      const listed = adminProviders.filter(function (provider) {
        return provider.is_listed;
      }).length;

      const counts = { all: adminProviders.length, listed: listed, hidden: adminProviders.length - listed };

      pa("totalProviders").textContent = counts.all;
      pa("listedProvidersCount").textContent = counts.listed;
      pa("hiddenProvidersCount").textContent = counts.hidden;

      document.querySelectorAll("[data-provider-count]").forEach(function (element) {
        element.textContent = counts[element.dataset.providerCount];
      });
    }

    // DISPLAY THE TABLE
    function renderProvidersAdminTable() {
      const search = providerAdminSearch.value.trim().toLowerCase();

      const providers = adminProviders.filter(function (provider) {
        if (currentProviderTab === "listed" && !provider.is_listed) return false;
        if (currentProviderTab === "hidden" && provider.is_listed) return false;

        if (search) {
          const text = [provider.business_name, provider.city].join(" ").toLowerCase();
          if (text.indexOf(search) === -1) return false;
        }

        return true;
      });

      providersAdminTable.replaceChildren();
      pa("providersAdminEmpty").hidden = providers.length > 0;
      pa("providersAdminEmptyTitle").textContent =
        adminProviders.length === 0 ? "No providers yet" : "No providers here";
      pa("providersAdminEmptyText").textContent =
        adminProviders.length === 0
          ? "Approved applications appear here automatically."
          : "Try another filter or search.";

      providers.forEach(function (provider) {
        const row = document.createElement("tr");
        row.className = "sba-row" + (provider.id === selectedProviderId ? " is-selected" : "");
        row.addEventListener("click", function () {
          selectProvider(provider.id);
        });

        const nameCell = document.createElement("td");
        const nameButton = document.createElement("button");
        nameButton.type = "button";
        nameButton.className = "sba-link";
        nameButton.textContent = provider.business_name;
        const cityLine = document.createElement("div");
        cityLine.className = "sba-sub";
        cityLine.textContent = provider.city || "No city";
        nameCell.appendChild(nameButton);
        nameCell.appendChild(cityLine);

        const categoryCell = document.createElement("td");
        categoryCell.textContent = getCategoryName(provider.category_id);

        const priceCell = document.createElement("td");
        priceCell.className = "sba-nowrap";
        priceCell.textContent = formatAdminPrice(provider);

        const updatedCell = document.createElement("td");
        updatedCell.className = "sba-nowrap";
        updatedCell.textContent = formatProviderDate(provider.updated_at);

        const statusCell = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "sba-badge " + (provider.is_listed ? "sba-badge-approved" : "sba-badge-draft");
        badge.textContent = provider.is_listed ? "Listed" : "Hidden";
        statusCell.appendChild(badge);

        const agreement = agreementsByProvider[provider.id];
        const agreementLine = document.createElement("div");
        agreementLine.className =
          "sba-agreement-line" + (agreement && agreement.status === "signed" ? " is-signed" : "");
        agreementLine.textContent = getAgreementLabel(agreement);
        statusCell.appendChild(agreementLine);

        row.appendChild(nameCell);
        row.appendChild(categoryCell);
        row.appendChild(priceCell);
        row.appendChild(updatedCell);
        row.appendChild(statusCell);
        providersAdminTable.appendChild(row);
      });
    }

    function selectProvider(providerId) {
      if (
        providerFormChanged &&
        providerId !== selectedProviderId &&
        !confirm("You have unsaved changes. Leave them without saving?")
      ) {
        return;
      }

      selectedProviderId = providerId;
      providerToast.hidden = true;
      closeConfirmBoxes();
      renderProvidersAdminTable();
      renderProviderEditPanel(true);

      if (window.innerWidth < 900) {
        providerEditPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    // DISPLAY THE EDIT PANEL
    // refillForm = true puts the saved values back into the form fields
    function renderProviderEditPanel(refillForm) {
      const provider = getSelectedProvider();

      if (!provider) {
        providerEditEmpty.hidden = false;
        providerEditPanel.hidden = true;
        return;
      }

      providerEditEmpty.hidden = true;
      providerEditPanel.hidden = false;

      // Header
      const badge = pa("providerListedBadge");
      badge.className = "sba-badge " + (provider.is_listed ? "sba-badge-approved" : "sba-badge-draft");
      badge.textContent = provider.is_listed ? "Listed" : "Hidden";

      pa("providerEditTitle").textContent = provider.business_name;
      pa("providerSlugText").textContent = provider.slug;

      const publicLink = pa("providerPublicLink");
      publicLink.hidden = !provider.is_listed;
      publicLink.href = "provider.html?slug=" + encodeURIComponent(provider.slug);

      // Form fields
      if (refillForm) {
        pa("editBusinessName").value = provider.business_name || "";
        pa("editCategory").value = provider.category_id || "";
        pa("editCity").value = provider.city || "";
        pa("editCountry").value = provider.country || "";
        pa("editServiceArea").value = provider.service_area || "";
        pa("editLanguages").value = provider.languages || "";
        pa("editPricingType").value = provider.pricing_type || "quote";
        pa("editBasePrice").value =
          provider.base_price === null || provider.base_price === undefined ? "" : provider.base_price;
        editDescription.value = provider.description || "";
        pa("editDescriptionCount").textContent = editDescription.value.length + " / 2000";

        providerFormChanged = false;
        providerSaveStatus.textContent = "";

        loadProviderApplication(provider);
      }

      // Visibility block
      pa("visibilityTitle").textContent = provider.is_listed
        ? "Shown on the website"
        : "Hidden from the website";
      pa("visibilityText").textContent = provider.is_listed
        ? "Hide it to take it off the Services page for now. You can show it again at any time."
        : "Visitors can't see this profile. Show it again to put it back on the Services page.";
      toggleListedButton.textContent = provider.is_listed ? "Hide from website" : "Show on website";

      // Provider agreement
      renderAgreementDetails(agreementsByProvider[provider.id]);

      // Requests linked to this provider (for the delete warning)
      const requestCount = requestCounts[provider.id] || 0;
      pa("deleteProviderRequestsNote").textContent =
        requestCount > 0
          ? "This provider has " + requestCount + " service request(s). The requests are kept, but will no longer link to a profile."
          : "This provider has no service requests.";
    }

    function renderAgreementDetails(agreement) {
      const statusCell = pa("agreementStatusCell");
      statusCell.replaceChildren();

      const badge = document.createElement("span");
      badge.className =
        "sba-badge " +
        (!agreement
          ? "sba-badge-draft"
          : agreement.status === "signed"
            ? "sba-badge-approved"
            : agreement.status === "void"
              ? "sba-badge-draft"
              : "sba-badge-request-new");
      badge.textContent = !agreement
        ? "None"
        : agreement.status === "signed"
          ? "Signed"
          : agreement.status === "void"
            ? "Replaced"
            : "Waiting for signature";
      statusCell.appendChild(badge);

      pa("agreementReferenceCell").textContent = agreement ? agreement.reference : "Not provided";

      pa("agreementSentCell").textContent = !agreement
        ? "Not sent"
        : formatProviderDate(agreement.sent_at) +
          (agreement.email_sent_at
            ? " (emailed)"
            : agreement.email_error
              ? " (email failed)"
              : "");

      pa("agreementSignedCell").textContent =
        agreement && agreement.status === "signed"
          ? formatProviderDate(agreement.signed_at) +
            " by " + agreement.signer_name +
            (agreement.signer_ip ? " (IP " + agreement.signer_ip + ")" : "") +
            (agreement.signed_language === "pt" ? ", in Portuguese" : "")
          : "Not yet";

      const reminderCount = agreement ? agreement.reminder_count || 0 : 0;
      pa("agreementRemindersCell").textContent = !agreement
        ? "None"
        : reminderCount === 0
          ? "None yet"
          : reminderCount + " sent, last on " + formatProviderDate(agreement.last_reminder_at);

      const linkExpired =
        agreement && agreement.status === "sent" && new Date(agreement.token_expires_at) < new Date();

      let hint = "";
      if (!agreement) {
        hint = "Providers approved before agreements were set up have none.";
      } else if (agreement.status === "sent" && agreement.reminder_error) {
        hint = "The last reminder could not be sent. Try again.";
      } else if (linkExpired) {
        hint = "The signing link has expired. Send a reminder to give them a new one.";
      } else if (agreement.status === "sent") {
        hint =
          "Link valid until " + formatProviderDate(agreement.token_expires_at) + ". " +
          (reminderCount < 3
            ? "Automatic reminders are sent 3, 10 and 20 days after the agreement."
            : "All automatic reminders have been sent.");
      } else if (agreement.status === "signed" && !agreement.signed_email_sent_at) {
        hint = "The signed copy was not emailed. Download it and send it yourself.";
      }
      pa("agreementHint").textContent = hint;

      pa("remindAgreementButton").hidden = !agreement || agreement.status !== "sent";

      const downloadButton = pa("downloadAgreementAdmin");
      downloadButton.hidden = !agreement;
      downloadButton.textContent =
        agreement && agreement.status === "signed" ? "Download signed PDF" : "Download PDF";
    }

    // SEND A REMINDER NOW (gives the provider a new 30-day signing link)
    pa("remindAgreementButton").addEventListener("click", async function () {
      const provider = getSelectedProvider();
      const agreement = provider && agreementsByProvider[provider.id];
      if (!agreement || agreement.status !== "sent") return;

      if (!confirm("Email " + provider.business_name + " a reminder with a new signing link? Links in earlier emails will stop working.")) {
        return;
      }

      const button = this;
      button.disabled = true;
      button.textContent = "Sending...";

      try {
        const { data, error } = await providersAdminSupabase.functions.invoke("provider-agreement", {
          body: { action: "admin-remind", agreementId: agreement.id },
        });

        if (error || !data || !data.ok) {
          let message = "Could not send the reminder. Please try again.";
          if (error && error.context && typeof error.context.json === "function") {
            try {
              const details = await error.context.json();
              if (details.error) message = details.error;
            } catch (readError) {
              // keep the default message
            }
          }
          console.error("Reminder error:", error);
          showProviderToast(message, "error");
          return;
        }

        showProviderToast("Reminder sent with a new signing link.", "success");
        await loadAdminProviders();
      } finally {
        button.disabled = false;
        button.textContent = "Send reminder";
      }
    });

    pa("downloadAgreementAdmin").addEventListener("click", async function () {
      const provider = getSelectedProvider();
      const agreement = provider && agreementsByProvider[provider.id];
      if (!agreement) return;

      const button = this;
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Preparing PDF...";

      try {
        const { data, error } = await providersAdminSupabase.functions.invoke("provider-agreement", {
          body: { action: "admin-download", agreementId: agreement.id },
        });

        if (error || !data || !data.pdfBase64) {
          console.error("Agreement download error:", error);
          showProviderToast("Could not download the agreement. Please try again.", "error");
          return;
        }

        const binary = atob(data.pdfBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 10000);
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    });

    // Load the private contact details and the application's status
    async function loadProviderApplication(provider) {
      currentApplication = null;
      ["providerContactName", "providerContactEmail", "providerContactPhone", "providerApplicationStatus"].forEach(
        function (id) {
          pa(id).textContent = "Loading...";
        },
      );
      pa("unapproveBlock").hidden = false;

      if (!provider.application_id) {
        setContactCell("providerContactName", null, "");
        setContactCell("providerContactEmail", null, "");
        setContactCell("providerContactPhone", null, "");
        pa("providerApplicationStatus").textContent = "Deleted or not linked";
        pa("unapproveBlock").hidden = true;
        updateShowButtonRule();
        return;
      }

      const { data, error } = await providersAdminSupabase
        .from("provider_applications")
        .select("id, contact_name, email, phone, whatsapp, status")
        .eq("id", provider.application_id)
        .maybeSingle();

      // Stop if another provider was selected meanwhile
      if (selectedProviderId !== provider.id) return;

      if (error || !data) {
        pa("providerContactName").textContent = "Could not load";
        pa("providerContactEmail").textContent = "";
        pa("providerContactPhone").textContent = "";
        pa("providerApplicationStatus").textContent = "Unknown";
        pa("unapproveBlock").hidden = true;
        return;
      }

      currentApplication = data;
      const phone = data.whatsapp || data.phone;

      setContactCell("providerContactName", null, data.contact_name);
      setContactCell("providerContactEmail", "mailto:" + data.email, data.email);
      setContactCell("providerContactPhone", "tel:" + (phone || "").replace(/[^\d+]/g, ""), phone);
      pa("providerApplicationStatus").textContent =
        data.status.charAt(0).toUpperCase() + data.status.slice(1);

      // Unapprove only makes sense for an approved application
      pa("unapproveBlock").hidden = data.status !== "approved";
      updateShowButtonRule();
    }

    // A provider whose application is no longer approved should not be shown
    function updateShowButtonRule() {
      const provider = getSelectedProvider();
      if (!provider) return;

      const applicationNotApproved = currentApplication && currentApplication.status !== "approved";
      toggleListedButton.disabled = providerBusy || (!provider.is_listed && applicationNotApproved);

      if (!provider.is_listed && applicationNotApproved) {
        pa("visibilityText").textContent =
          "Their application is " + currentApplication.status +
          ". Approve it again in Applications to put the profile back on the website.";
      }
    }

    // SAVE PROFILE CHANGES
    providerEditForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      const provider = getSelectedProvider();
      if (!provider || providerBusy) return;

      const businessName = pa("editBusinessName").value.trim();
      const pricingType = pa("editPricingType").value;
      const priceText = pa("editBasePrice").value.trim();
      const basePrice = priceText === "" ? null : Number(priceText);

      if (businessName.length < 1) {
        showProviderToast("Please enter a business name.", "error");
        pa("editBusinessName").focus();
        return;
      }

      if (basePrice !== null && (!Number.isFinite(basePrice) || basePrice < 0)) {
        showProviderToast("Please enter a starting price of 0 or more, or leave it empty.", "error");
        pa("editBasePrice").focus();
        return;
      }

      if (pricingType !== "quote" && basePrice === null) {
        showProviderToast('Please add a starting price, or choose "Price on request".', "error");
        pa("editBasePrice").focus();
        return;
      }

      const changes = {
        business_name: businessName,
        category_id: pa("editCategory").value || null,
        city: pa("editCity").value.trim() || null,
        country: pa("editCountry").value.trim() || null,
        service_area: pa("editServiceArea").value.trim() || null,
        languages: pa("editLanguages").value.trim() || null,
        pricing_type: pricingType,
        base_price: pricingType === "quote" ? null : Math.round(basePrice * 100) / 100,
        description: editDescription.value.trim(),
      };

      setProviderBusy(true);
      providerSaveStatus.textContent = "Saving...";

      try {
        const { data, error } = await providersAdminSupabase
          .from("providers")
          .update(changes)
          .eq("id", provider.id)
          .select()
          .single();

        if (error) {
          console.error("Provider save error:", error);
          providerSaveStatus.textContent = "Not saved";
          showProviderToast("Could not save the changes. Please try again.", "error");
          return;
        }

        Object.assign(provider, data);
        providerFormChanged = false;
        providerSaveStatus.textContent = "Saved";
        showProviderToast("Profile updated." + (provider.is_listed ? " The changes are live." : ""), "success");
      } finally {
        setProviderBusy(false);
        renderProvidersAdminTable();
        renderProviderEditPanel(false);
        updateShowButtonRule();
      }
    });

    providerEditForm.addEventListener("input", function () {
      providerFormChanged = true;
      providerSaveStatus.textContent = "Unsaved changes";
      pa("editDescriptionCount").textContent = editDescription.value.length + " / 2000";
    });

    // HIDE OR SHOW ON THE WEBSITE
    toggleListedButton.addEventListener("click", async function () {
      const provider = getSelectedProvider();
      if (!provider || providerBusy) return;

      const makeListed = !provider.is_listed;
      setProviderBusy(true);

      try {
        const { data, error } = await providersAdminSupabase
          .from("providers")
          .update({ is_listed: makeListed })
          .eq("id", provider.id)
          .select()
          .single();

        if (error) {
          console.error("Visibility error:", error);
          showProviderToast("Could not change visibility. Please try again.", "error");
          return;
        }

        Object.assign(provider, data);
        showProviderToast(
          makeListed ? "The profile is back on the website." : "The profile is now hidden from the website.",
          "success",
        );
      } finally {
        setProviderBusy(false);
        updateProviderSummary();
        renderProvidersAdminTable();
        renderProviderEditPanel(false);
        updateShowButtonRule();
      }
    });

    // UNAPPROVE: application back to Pending (the database then hides the profile)
    pa("unapproveButton").addEventListener("click", function () {
      closeConfirmBoxes();
      pa("unapproveConfirm").hidden = false;
      pa("unapproveCancel").focus();
    });

    pa("unapproveCancel").addEventListener("click", closeConfirmBoxes);

    pa("unapproveConfirmButton").addEventListener("click", async function () {
      const provider = getSelectedProvider();
      if (!provider || !provider.application_id || providerBusy) return;

      setProviderBusy(true);

      try {
        const { error } = await providersAdminSupabase
          .from("provider_applications")
          .update({
            status: "pending",
            reviewed_at: null,
            decision_email_sent_at: null,
            decision_email_error: null,
          })
          .eq("id", provider.application_id)
          .eq("status", "approved");

        if (error) {
          console.error("Unapprove error:", error);
          showProviderToast("Could not unapprove this provider. Please try again.", "error");
          return;
        }

        closeConfirmBoxes();
        showProviderToast(
          "Unapproved. The profile is hidden and the application is back in Applications as Pending.",
          "success",
        );
      } finally {
        setProviderBusy(false);
        await loadAdminProviders();
      }
    });

    // DELETE
    pa("deleteProviderButton").addEventListener("click", function () {
      closeConfirmBoxes();
      pa("deleteProviderConfirm").hidden = false;
      pa("deleteProviderCancel").focus();
    });

    pa("deleteProviderCancel").addEventListener("click", closeConfirmBoxes);

    pa("deleteProviderConfirmButton").addEventListener("click", async function () {
      const provider = getSelectedProvider();
      if (!provider || providerBusy) return;

      const deleteApplication = pa("deleteApplicationToo").checked && !!provider.application_id;
      setProviderBusy(true);

      try {
        const { data, error } = await providersAdminSupabase
          .from("providers")
          .delete()
          .eq("id", provider.id)
          .select("id");

        if (error || !data || data.length === 0) {
          console.error("Provider delete error:", error);
          showProviderToast("Could not delete this provider. Please try again.", "error");
          return;
        }

        let message = "Provider deleted.";

        if (deleteApplication) {
          const { data: deletedApplications, error: applicationError } =
            await providersAdminSupabase
              .from("provider_applications")
              .delete()
              .eq("id", provider.application_id)
              .select("id");

          if (applicationError || !deletedApplications || deletedApplications.length === 0) {
            console.error("Application delete error:", applicationError);
            message =
              "Provider deleted, but their application could not be deleted. Delete it in Supabase or try again.";
          } else {
            message = "Provider and their application deleted.";
          }
        }

        selectedProviderId = null;
        providerFormChanged = false;
        closeConfirmBoxes();
        showProviderToast(message, deleteApplication && message.indexOf("could not") !== -1 ? "warning" : "success");
      } finally {
        setProviderBusy(false);
        await loadAdminProviders();
      }
    });

    // FILTERS, MESSAGES AND LOGOUT
    providerAdminTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        currentProviderTab = tab.dataset.providerTab;

        providerAdminTabs.forEach(function (otherTab) {
          const isActive = otherTab === tab;
          otherTab.classList.toggle("is-active", isActive);
          otherTab.setAttribute("aria-pressed", String(isActive));
        });

        renderProvidersAdminTable();
      });
    });

    providerAdminSearch.addEventListener("input", renderProvidersAdminTable);

    pa("providerToastClose").addEventListener("click", function () {
      providerToast.hidden = true;
    });

    window.addEventListener("beforeunload", function (event) {
      if (providerFormChanged) {
        event.preventDefault();
        event.returnValue = "";
      }
    });

    const providersLogout = pa("adminLogout");
    if (providersLogout) {
      providersLogout.addEventListener("click", async function () {
        if (providerFormChanged && !confirm("You have unsaved changes. Log out anyway?")) return;

        providerFormChanged = false;
        await providersAdminSupabase.auth.signOut();
        window.location.href = "login.html";
      });
    }

    // START
    checkProvidersAdminAccess().then(function (isAdmin) {
      if (isAdmin) loadAdminProviders();
    });
  }

  // =====================================
  // 18. PROVIDER AGREEMENT SIGNING PAGE
  // =====================================
  // Providers are not logged in. The secret link (?token=...) proves who they are,
  // and the database only lets that link read and sign its own agreement.

  const signPage = document.querySelector("#signPage");

  if (signPage) {
    const signSupabase = window.supabase.createClient(
      "https://jnvirsxymqdginyatyjq.supabase.co",
      "sb_publishable_axNzNrJ9AD2qZeS7EYHrFA_pTYlnfs8",
    );

    // Name (address) of the "provider-agreement" Edge Function in Supabase
    const AGREEMENT_FUNCTION_NAME = "provider-agreement";

    const signToken = (new URLSearchParams(window.location.search).get("token") || "")
      .trim()
      .toLowerCase();

    const signStatus = document.querySelector("#signStatus");
    const signProblem = document.querySelector("#signProblem");
    const signForm = document.querySelector("#signForm");
    const signDone = document.querySelector("#signDone");
    const signError = document.querySelector("#signError");
    const signSubmit = document.querySelector("#signSubmit");
    const signerName = document.querySelector("#signerName");
    const signaturePad = document.querySelector("#signaturePad");
    const languageButtons = document.querySelectorAll("[data-language]");

    let agreementInfo = null;
    let currentLanguage = "en";
    const contentCache = {};
    let hasDrawnSignature = false;

    function showProblem(title, text) {
      signStatus.hidden = true;
      signPage.hidden = true;
      document.querySelector("#signProblemTitle").textContent = title;
      document.querySelector("#signProblemText").textContent = text;
      signProblem.hidden = false;
    }

    function formatSignDate(value, withTime) {
      const options = { day: "numeric", month: "long", year: "numeric" };
      if (withTime) {
        options.hour = "2-digit";
        options.minute = "2-digit";
      }
      // The page itself is in English, so dates are shown in English too
      return new Date(value).toLocaleString("en-GB", options);
    }

    // Save a PDF (sent as base64 text) to the person's device
    function downloadPdf(base64, filename) {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 10000);
    }

    async function callAgreementFunction(body) {
      const { data, error } = await signSupabase.functions.invoke(AGREEMENT_FUNCTION_NAME, { body: body });

      if (error) {
        let message = "Something went wrong. Please try again.";
        if (error.context && typeof error.context.json === "function") {
          try {
            const details = await error.context.json();
            if (details.error) message = details.error;
          } catch (readError) {
            // keep the default message
          }
        }
        throw new Error(message);
      }

      return data;
    }

    // SHOW THE AGREEMENT TEXT (always as plain text, never as HTML)
    async function loadAgreementText(language) {
      if (!contentCache[language]) {
        const { data, error } = await signSupabase
          .from("agreement_versions")
          .select("content")
          .eq("version", agreementInfo.version)
          .eq("language", language)
          .maybeSingle();

        if (error || !data) throw new Error("Agreement text not found");
        contentCache[language] = data.content;
      }

      const content = contentCache[language];
      const fill = function (text) {
        return String(text)
          .replace(/\{businessName\}/g, agreementInfo.business_name || "")
          .replace(/\{contactName\}/g, agreementInfo.contact_name || agreementInfo.business_name || "");
      };

      document.documentElement.lang = language === "pt" ? "pt-PT" : "en";
      document.querySelector("#agreementTitle").textContent = content.title;
      document.querySelector("#agreementReferenceLabel").textContent = content.labels.reference;
      document.querySelector("#agreementIntro").textContent = fill(content.intro);

      const draftNote = document.querySelector("#agreementDraftNote");
      draftNote.textContent = content.labels.draft;
      draftNote.hidden = !/\[/.test(JSON.stringify(content.sections));

      const sections = document.querySelector("#agreementSections");
      sections.replaceChildren();

      content.sections.forEach(function (section) {
        const block = document.createElement("section");
        block.className = "sbs-section";

        const heading = document.createElement("h2");
        heading.textContent = section.heading;
        block.appendChild(heading);

        (section.paragraphs || []).forEach(function (text) {
          const paragraph = document.createElement("p");
          paragraph.textContent = fill(text);
          block.appendChild(paragraph);
        });

        if (section.bullets && section.bullets.length) {
          const list = document.createElement("ul");
          section.bullets.forEach(function (text) {
            const item = document.createElement("li");
            item.textContent = fill(text);
            list.appendChild(item);
          });
          block.appendChild(list);
        }

        sections.appendChild(block);
      });

      currentLanguage = language;
      languageButtons.forEach(function (button) {
        const active = button.dataset.language === language;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }

    function showSigned(name, signedAt, emailSent) {
      signForm.hidden = true;
      signDone.hidden = false;

      let text =
        "Signed by " + name + " on " + formatSignDate(signedAt, true) + ".";
      if (emailSent === true) text += " We have emailed you a signed copy.";
      if (emailSent === false) text += " We could not email your copy just now, so please download it below.";

      document.querySelector("#signDoneText").textContent = text;
    }

    // LOAD THE AGREEMENT FOR THIS LINK
    async function loadSigningPage() {
      if (!/^[a-f0-9]{64}$/.test(signToken)) {
        showProblem(
          "This link is not valid",
          'Please use the "Review and sign" button in your most recent SettleBridge email. If it still does not work, contact us.',
        );
        return;
      }

      const { data, error } = await signSupabase.rpc("get_agreement_for_signing", { p_token: signToken });
      const info = data && data[0];

      if (error || !info) {
        if (error) console.error("Agreement error:", error);
        showProblem(
          error ? "We could not load your agreement" : "This link is not valid",
          error
            ? "Please check your internet connection and try again."
            : 'Please use the "Review and sign" button in your most recent SettleBridge email. Links in older reminder emails stop working. If it still does not work, contact us.',
        );
        return;
      }

      if (info.status === "void") {
        showProblem(
          "This agreement has been replaced",
          "A newer agreement was sent to you. Please use the link in your most recent approval email.",
        );
        return;
      }

      if (info.is_expired) {
        showProblem(
          "This link has expired",
          "Signing links are valid for 30 days. Please use the link in your most recent SettleBridge email, or contact us and we will send you a new one.",
        );
        return;
      }

      agreementInfo = info;
      document.querySelector("#agreementBusiness").textContent = info.business_name;
      document.querySelector("#agreementReference").textContent = info.reference;
      document.querySelector("#signBusinessName").textContent = info.business_name;
      signerName.value = info.contact_name || "";

      try {
        await loadAgreementText("en");
      } catch (textError) {
        console.error(textError);
        showProblem("We could not load your agreement", "Please refresh the page or contact us.");
        return;
      }

      if (info.status === "signed") {
        showSigned(info.signer_name, info.signed_at, null);
      }

      signStatus.hidden = true;
      signPage.hidden = false;
    }

    // LANGUAGE BUTTONS
    languageButtons.forEach(function (button) {
      button.addEventListener("click", async function () {
        try {
          await loadAgreementText(button.dataset.language);
        } catch (languageError) {
          console.error(languageError);
          alert("Sorry, this language is not available right now.");
        }
      });
    });

    // DOWNLOAD BUTTONS
    async function handleDownload(button) {
      const originalText = button.textContent;
      button.disabled = true;
      button.textContent = "Preparing PDF...";

      try {
        const result = await callAgreementFunction({
          action: "download",
          token: signToken,
          language: currentLanguage,
        });
        downloadPdf(result.pdfBase64, result.filename);
      } catch (downloadError) {
        alert(downloadError.message);
      } finally {
        button.disabled = false;
        button.textContent = originalText;
      }
    }

    document.querySelector("#downloadAgreementButton").addEventListener("click", function () {
      handleDownload(this);
    });

    document.querySelector("#downloadSignedButton").addEventListener("click", function () {
      handleDownload(this);
    });

    // SIGNATURE PAD (mouse, finger or stylus)
    const padContext = signaturePad.getContext("2d");
    let drawing = false;

    function setUpPad() {
      const ratio = window.devicePixelRatio || 1;
      const width = signaturePad.clientWidth || 500;
      const height = signaturePad.clientHeight || 160;
      signaturePad.width = Math.round(width * ratio);
      signaturePad.height = Math.round(height * ratio);
      padContext.setTransform(ratio, 0, 0, ratio, 0, 0);
      padContext.lineWidth = 2.5;
      padContext.lineCap = "round";
      padContext.lineJoin = "round";
      padContext.strokeStyle = "#0A3D62";
      hasDrawnSignature = false;
    }

    function padPoint(event) {
      const rect = signaturePad.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    signaturePad.addEventListener("pointerdown", function (event) {
      drawing = true;
      signaturePad.setPointerCapture(event.pointerId);
      const point = padPoint(event);
      padContext.beginPath();
      padContext.moveTo(point.x, point.y);
      event.preventDefault();
    });

    signaturePad.addEventListener("pointermove", function (event) {
      if (!drawing) return;
      const point = padPoint(event);
      padContext.lineTo(point.x, point.y);
      padContext.stroke();
      hasDrawnSignature = true;
      event.preventDefault();
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach(function (type) {
      signaturePad.addEventListener(type, function () {
        drawing = false;
      });
    });

    document.querySelector("#clearSignature").addEventListener("click", setUpPad);

    // Smaller image for storage: copy the drawing onto a 500 x 160 canvas
    function getSignatureBase64() {
      if (!hasDrawnSignature) return null;

      const output = document.createElement("canvas");
      output.width = 500;
      output.height = 160;
      output.getContext("2d").drawImage(signaturePad, 0, 0, 500, 160);

      return output.toDataURL("image/png").replace(/^data:image\/png;base64,/, "");
    }

    // SIGN
    signForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      signError.hidden = true;

      const name = signerName.value.trim();

      if (name.length < 2) {
        signError.textContent = "Please type your full name.";
        signError.hidden = false;
        signerName.focus();
        return;
      }

      if (!document.querySelector("#signAgree").checked) {
        signError.textContent = "Please tick the box to confirm you agree.";
        signError.hidden = false;
        return;
      }

      signSubmit.disabled = true;
      signSubmit.textContent = "Signing...";

      try {
        const { error } = await signSupabase.rpc("sign_provider_agreement", {
          p_token: signToken,
          p_signer_name: name,
          p_language: currentLanguage,
          p_signature_png: getSignatureBase64(),
        });

        if (error) {
          const text = String(error.message || "");
          let message = "Sorry, we could not sign the agreement. Please try again.";
          if (text.indexOf("already_signed") !== -1) message = "This agreement has already been signed.";
          if (text.indexOf("link_expired") !== -1) message = "This link has expired. Please contact us for a new one.";
          if (text.indexOf("agreement_void") !== -1) message = "This agreement has been replaced. Please use the link in your latest email.";
          throw new Error(message);
        }

        // Create the signed copy and email it to the provider
        let emailSent = false;
        try {
          const result = await callAgreementFunction({ action: "signed-copy", token: signToken });
          emailSent = !!result.emailSent;
        } catch (copyError) {
          console.error("Signed copy error:", copyError);
        }

        showSigned(name, new Date().toISOString(), emailSent);
        signDone.focus();
      } catch (signFailure) {
        signError.textContent = signFailure.message;
        signError.hidden = false;
      } finally {
        signSubmit.disabled = false;
        signSubmit.textContent = "Sign agreement";
      }
    });

    setUpPad();
    loadSigningPage();
  }
});
