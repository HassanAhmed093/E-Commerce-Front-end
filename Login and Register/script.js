const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');
const togglePasswordIcons = document.querySelectorAll('.toggle-password');
const loginForm = document.querySelector('.form-box.login form');
const registerForm = document.querySelector('.form-box.register form');

// Function to display messages
function showMessage(form, message, type) {
    const messageBox = form.querySelector('.message-box');
    messageBox.textContent = message;
    messageBox.className = 'message-box ' + type;
    setTimeout(() => {
        messageBox.textContent = '';
        messageBox.className = 'message-box';
    }, 3000); // Clear message after 3 seconds
}

// Toggle between login and register forms
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// Password visibility toggle
togglePasswordIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        const input = icon.parentElement.querySelector('input');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bx-show');
            icon.classList.add('bx-hide');
        } else {
            input.type = 'password';
            icon.classList.remove('bx-hide');
            icon.classList.add('bx-show');
        }
    });
});

// Handle registration
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = registerForm.querySelector('input[placeholder="Username"]').value;
    const email = registerForm.querySelector('input[placeholder="Email"]').value;
    const password = registerForm.querySelector('input[placeholder="Password"]').value;
    const confirmPassword = registerForm.querySelector('input[placeholder="Confirm Password"]').value;

    // Check if passwords match
    if (password !== confirmPassword) {
        showMessage(registerForm, 'Passwords do not match!', 'error');
        return;
    }

    // Get existing users from localStorage or initialize empty array
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Check for duplicate username
    if (users.some(user => user.username === username)) {
        showMessage(registerForm, 'Username already exists! Please choose a different username.', 'error');
        return;
    }

    // Store new user data
    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage(registerForm, 'Registration successful! You can now login.', 'success');
    registerForm.reset();
    setTimeout(() => {
        container.classList.remove('active'); // Switch to login form
    }, 3000);
});

// Handle login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = loginForm.querySelector('input[placeholder="Username"]').value;
    const password = loginForm.querySelector('input[placeholder="Password"]').value;

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check credentials
    const user = users.find(user => user.username === username && user.password === password);
    
    if (user) {
        showMessage(loginForm, 'Login successful! Welcome ' + username, 'success');
        loginForm.reset();
    } else {
        showMessage(loginForm, 'Invalid username or password!', 'error');
    }
});