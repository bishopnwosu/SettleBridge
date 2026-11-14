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
            "title, slug, summary, content, category, cover_image_path, cover_image_alt, published_at",
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

        // Page title and Google description
        document.title = guide.title + " | SettleBridge";
        setMetaDescription(guide.summary);

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
});
