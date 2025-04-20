document.addEventListener('DOMContentLoaded', () => {
    // Method switching
    const methodButtons = document.querySelectorAll('.method-btn');
    const body = document.body;
    let currentMethod = 'dct';

    function clearUI() {
        // Clear image previews
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('decodeImagePreview').innerHTML = '';
        
        // Clear file inputs
        document.getElementById('imageInput').value = '';
        document.getElementById('decodeImageInput').value = '';
        
        // Clear message inputs
        document.getElementById('messageInput').value = '';
        document.getElementById('extractedMessage').value = '';
        document.getElementById('charCount').textContent = '0';
        
        // Hide result container
        document.querySelector('.result-container').style.display = 'none';
        
        // Reset checkboxes
        document.getElementById('encryptMessage').checked = true;
        document.getElementById('addNoise').checked = true;
    }

    methodButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            methodButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update body class based on method
            currentMethod = button.dataset.method;
            if (currentMethod === 'dwt') {
                body.classList.add('dwt-active');
                document.querySelector('.dct-info').style.display = 'none';
                document.querySelector('.dwt-info').style.display = 'block';
                document.querySelector('.dct-options').style.display = 'none';
            } else {
                body.classList.remove('dwt-active');
                document.querySelector('.dct-info').style.display = 'block';
                document.querySelector('.dwt-info').style.display = 'none';
                document.querySelector('.dct-options').style.display = 'block';
            }

            // Clear all UI elements
            clearUI();
        });
    });

    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => content.style.display = 'none');
            // Show selected tab content
            const tabId = button.dataset.tab + '-tab';
            document.getElementById(tabId).style.display = 'block';
        });
    });

    // Character count for message input
    const messageInput = document.getElementById('messageInput');
    const charCount = document.getElementById('charCount');

    messageInput.addEventListener('input', () => {
        charCount.textContent = messageInput.value.length;
    });

    // File input preview
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const decodeImageInput = document.getElementById('decodeImageInput');
    const decodeImagePreview = document.getElementById('decodeImagePreview');

    function handleImagePreview(input, preview) {
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    preview.innerHTML = '';
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    handleImagePreview(imageInput, imagePreview);
    handleImagePreview(decodeImageInput, decodeImagePreview);

    // Steganography buttons
    const steganizeBtn = document.getElementById('steganizeBtn');
    const extractBtn = document.getElementById('extractBtn');

    steganizeBtn.addEventListener('click', () => {
        const imageInput = document.getElementById('imageInput');
        const messageInput = document.getElementById('messageInput').value;

        if (!imageInput.files || !imageInput.files[0]) {
            showError('Please select an image first!');
            return;
        }

        if (!messageInput) {
            showError('Please enter a message first!');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                if (currentMethod === 'dct') {
                    hideMessageInImageDCT(canvas, ctx, img, messageInput);
                } else {
                    hideMessageInImageDWT(canvas, ctx, img, messageInput);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(imageInput.files[0]);
    });

    extractBtn.addEventListener('click', () => {
        const decodeImageInput = document.getElementById('decodeImageInput');
        const extractedMessage = document.getElementById('extractedMessage');

        if (!decodeImageInput.files || !decodeImageInput.files[0]) {
            showError('Please select a steganography image first!');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                try {
                    let message;
                    if (currentMethod === 'dct') {
                        message = extractMessageFromImageDCT(canvas, ctx, img);
                    } else {
                        message = extractMessageFromImageDWT(canvas, ctx, img);
                    }
                    extractedMessage.value = message;
                } catch (error) {
                    showError(error.message);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(decodeImageInput.files[0]);
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}); 