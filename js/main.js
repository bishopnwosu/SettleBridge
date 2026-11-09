
document.addEventListener("DOMContentLoaded", function () {

    
// =====================================
// 1. MOBILE NAVIGATION
// =====================================

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navButtons = document.querySelector(".nav-buttons");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function () {

        navLinks.classList.toggle("active");
        navButtons.classList.toggle("active");

        const isOpen = navLinks.classList.contains("active");
        const isButtonsOpen = navButtons.classList.contains("active");

        menuToggle.setAttribute("aria-expanded", isOpen);
        menuToggle.setAttribute("aria-expanded", isButtonsOpen);

        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );

    });

    // Close menu after clicking a navigation link

    navLinks.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {
            navLinks.classList.remove("active");
            navButtons.classList.remove("active");
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

            const service = document.querySelector("#homeService")?.value.trim() || "";
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

            const service = document.querySelector("#serviceKeyword")?.value.trim() || "";
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

            alert("Your registration form is ready. Account creation will be available once authentication is connected.");
        });
    }


    // =====================================
    // 5. PASSWORD VISIBILITY
    // =====================================

    document.querySelectorAll("[data-toggle-password]").forEach(function (button) {

        button.addEventListener("click", function () {

            const inputId = button.getAttribute("data-toggle-password");
            const passwordInput = document.getElementById(inputId);

            if (!passwordInput) return;

            const isPassword = passwordInput.type === "password";

            passwordInput.type = isPassword ? "text" : "password";

            button.textContent = isPassword ? "Hide" : "Show";

            button.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
        });

    });


    // =====================================
    // 6. LOGIN FORM
    // =====================================

    const loginForm = document.querySelector("#loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            alert("Login is not connected yet. We will activate authentication when the backend is ready.");
        });
    }


    // =====================================
    // 7. PROVIDER APPLICATION FORM
    // =====================================

    const providerForm = document.querySelector("#providerApplicationForm");

    if (providerForm) {
        providerForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!providerForm.checkValidity()) {
                providerForm.reportValidity();
                return;
            }

            alert("Your application form is ready. Provider applications will be submitted once the backend is connected.");
        });
    }


    // =====================================
    // 8. GENERAL CONTACT FORM
    // =====================================

    const contactForm = document.querySelector("#contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            alert("The contact form is not connected yet. Please check back later.");
        });
    }

});
