// Authentication utility functions
function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Auth state management
function checkAuthState() {
    const isLoggedIn = isUserLoggedIn();
    const authBtn = document.getElementById('authBtn');
    const favoritesBtn = document.getElementById('favoritesBtn');
    
    if (isLoggedIn) {
        authBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
        if (favoritesBtn) {
            favoritesBtn.style.display = 'block';
        }
    } else {
        authBtn.innerHTML = `<i class="fas fa-user"></i> Login`;
        if (favoritesBtn) {
            favoritesBtn.style.display = 'none';
        }
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('email');
    localStorage.removeItem('username');
    window.location.href = '/html/index.html';
}

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('message');

    if (isUserLoggedIn()) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userEmail = localStorage.getItem('email');
        const user = users.find(u => u.email === userEmail);
        
        if (user) {
            nameInput.value = user.username;
            emailInput.value = user.email;
        }
    }

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
            alert('Please fill in all fields');
            return;
        }

        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        messages.push({
            name: nameInput.value,
            email: emailInput.value,
            message: messageInput.value,
            date: new Date().toISOString()
        });
        localStorage.setItem('contactMessages', JSON.stringify(messages));

        alert('Message sent successfully!');
        messageInput.value = '';
        
        if (!isUserLoggedIn()) {
            contactForm.reset();
        }
    });
}

// Theme and Navigation Management
function initializeThemeAndNav() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const icon = themeToggle.querySelector('i');
            icon.classList.toggle('fa-moon');
            icon.classList.toggle('fa-sun');
            localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
        });

        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        }
    }

    // Navigation handling
    const navButtons = {

        'homeBtn': '../html/home.html',
        'aboutBtn': '../html/about.html',
        'contactBtn': '../html/contact.html',
    };

    const currentPage = window.location.pathname.split('/').pop() || '/html/index.html';
    Object.entries(navButtons).forEach(([btnId, path]) => {
        const btn = document.getElementById(btnId);
        if (btn) {
            if (path === currentPage) {
                btn.classList.add('active');
            }
            btn.addEventListener('click', () => {
                window.location.href = path;
            });
        }
    });

    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '../html/index.html';
        });
    }
}

// Landing page functionality
function initializeLandingPage() {
    const skipBtn = document.querySelector('.skip-btn');
    const heroAuthBtn = document.getElementById('heroAuthBtn');
    const featuresSection = document.querySelector('.features');

    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            window.location.href = '../html/home.html';
        });
    }

    if (heroAuthBtn) {
        heroAuthBtn.addEventListener('click', () => {
            if (isUserLoggedIn()) {
                window.location.href = '../html/home.html';
            } else {
                const authModal = document.getElementById('authModal');
                authModal.style.display = 'block';
            }
        });
    }

    // Update landing buttons based on login state
    function updateLandingButtons() {
        const authBtns = document.querySelectorAll('.auth-btn');
        if (isUserLoggedIn()) {
            authBtns.forEach(btn => btn.style.display = 'none');
            if (skipBtn) {
                skipBtn.textContent = 'Get Started';
                skipBtn.classList.add('logged-in');
            }
        }
    }

    // Initialize landing page state
    updateLandingButtons();
}

// Update the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    initializeThemeAndNav();
    initializeContactForm();
    initializeLandingPage();
    
    // Auth modal setup
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authModal = document.getElementById('authModal');
    const authBtn = document.getElementById('authBtn');
    const heroAuthBtn = document.getElementById('heroAuthBtn');
    const closeBtn = document.querySelector('.close');
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');

    // Modal controls
    if (authBtn) {
        authBtn.addEventListener('click', () => {
            if (isUserLoggedIn()) {
                handleLogout();
            } else {
                authModal.style.display = 'block';
            }
        });
    }

    if (heroAuthBtn) {
        heroAuthBtn.addEventListener('click', () => {
            authModal.style.display = 'block';
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            authModal.style.display = 'none';
        });
    }

    // Tab switching
    if (loginTab && signupTab) {
        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        });

        signupTab.addEventListener('click', () => {
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
        });
    }

    // Login form handling
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('email', email);
                localStorage.setItem('username', user.username);
                localStorage.setItem('isLoggedIn', 'true');
                authModal.style.display = 'none';
                checkAuthState();
            } else {
                alert('Invalid credentials');
            }
        });
    }

    // Signup form handling
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = signupForm.querySelector('input[type="text"]').value;
            const email = signupForm.querySelector('input[type="email"]').value;
            const password = signupForm.querySelector('input[type="password"]').value;
            const confirmPassword = signupForm.querySelectorAll('input[type="password"]')[1].value;

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.some(u => u.email === email)) {
                alert('Email already registered');
                return;
            }

            users.push({ username, email, password });
            localStorage.setItem('users', JSON.stringify(users));
            alert('Registration successful! Please login.');
            loginTab.click();
            signupForm.reset();
        });
    }

    // Initialize auth state
    checkAuthState();
});