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

    const adminMessage = document.querySelector("#adminMessage");
    const logoutButton = document.querySelector("#adminLogout");

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

    // DISPLAY PROVIDER APPLICATIONS
    async function loadApplications() {
      applicationsTable.innerHTML = `
        <tr>
          <td colspan="6" style="padding:20px; text-align:center;">
            Loading applications...
          </td>
        </tr>
      `;

      const { data: applications, error } = await adminSupabase
        .from("provider_applications")
        .select(
          "id, business_name, contact_name, email, phone, city, status, created_at",
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Applications error:", error);
        adminMessage.textContent =
          "Unable to load applications. Please try again.";
        applicationsTable.replaceChildren();
        return;
      }

      // =====================================
      // UPDATE ADMIN SUMMARY CARDS
      // =====================================

      document.querySelector("#totalApplications").textContent =
        applications.length;

      document.querySelector("#pendingApplications").textContent =
        applications.filter((app) => app.status === "pending").length;

      document.querySelector("#approvedApplications").textContent =
        applications.filter((app) => app.status === "approved").length;

      document.querySelector("#rejectedApplications").textContent =
        applications.filter((app) => app.status === "rejected").length;

      applicationsTable.replaceChildren();

      if (!applications || applications.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No provider applications found.";
        cell.style.padding = "20px";
        cell.style.textAlign = "center";

        row.appendChild(cell);
        applicationsTable.appendChild(row);
        return;
      }

      applications.forEach(function (application) {
        const row = document.createElement("tr");

        const values = [
          application.business_name,
          application.contact_name + " (" + application.email + ")",
          application.city,
          application.status,
          new Date(application.created_at).toLocaleDateString(),
        ];

        values.forEach(function (value, index) {
          const cell = document.createElement("td");

          cell.style.padding = "14px";
          cell.style.borderTop = "1px solid #E5E7EB";

          // Style the application status
          if (index === 3) {
            const statusBadge = document.createElement("span");
            const status = String(value || "Not provided").toLowerCase();

            statusBadge.className = "status-badge status-" + status;
            statusBadge.textContent = value || "Not provided";

            cell.appendChild(statusBadge);
          } else {
            cell.textContent = value || "Not provided";
          }

          row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        actionCell.style.padding = "14px";
        actionCell.style.borderTop = "1px solid #E5E7EB";

        if (application.status === "pending") {
          const approveButton = document.createElement("button");
          approveButton.textContent = "Approve";
          approveButton.type = "button";
          approveButton.style.marginRight = "6px";

          const rejectButton = document.createElement("button");
          rejectButton.textContent = "Reject";
          rejectButton.type = "button";

          approveButton.addEventListener("click", function () {
            updateApplication(application.id, "approved");
          });

          rejectButton.addEventListener("click", function () {
            updateApplication(application.id, "rejected");
          });

          actionCell.appendChild(approveButton);
          actionCell.appendChild(rejectButton);
        } else {
          actionCell.textContent = "Reviewed";
        }

        row.appendChild(actionCell);
        applicationsTable.appendChild(row);
      });

      adminMessage.textContent =
        applications.length + " provider application(s) found.";
    }

    // APPROVE OR REJECT APPLICATION
    // Sends the decision to the secure "review-application" Edge Function.
    // The server checks you are an admin, updates the status and emails the provider.
    async function updateApplication(applicationId, newStatus) {
      const decision = newStatus === "approved" ? "approve" : "reject";

      const confirmed = confirm(
        "Are you sure you want to " +
          decision +
          " this application? The provider will be emailed.",
      );

      if (!confirmed) return;

      // Prevent double-clicks while we wait for the server
      applicationsTable.querySelectorAll("button").forEach(function (button) {
        button.disabled = true;
      });

      try {
        const { data, error } = await adminSupabase.functions.invoke(
          "swift-api",
          { body: { applicationId: applicationId, decision: decision } },
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
          alert(message);
          return;
        }

        alert(data.message);
      } finally {
        loadApplications();
      }
    }

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
    checkAdminAccess().then(function (isAdmin) {
      if (isAdmin) {
        loadApplications();
      }
    });
  }
});
