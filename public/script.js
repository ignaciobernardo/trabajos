const API_BASE_URL = window.location.origin + '/api';
const FINTOC_PAYMENT_URL = 'https://fintoc.me/admin/15000';

// Render job cards
function renderJobs(jobs) {
    const jobsGrid = document.getElementById('jobsGrid');
    
    console.log(`Rendering ${jobs ? jobs.length : 0} jobs`);
    
    if (!jobs || jobs.length === 0) {
        jobsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 40px;">no hay trabajos disponibles en este momento.</p>';
        console.log('No jobs to render - showing empty state');
        return;
    }
    
    console.log('Rendering jobs:', jobs.map(j => ({ id: j.id, title: j.title, company: j.company })));
    
    jobsGrid.innerHTML = jobs.map(job => {
        const logoHtml = job.logo 
            ? `<div class="company-logo">
                 <img src="${job.logo}" alt="${job.company}" onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='${job.company.charAt(0).toUpperCase()}';">
               </div>`
            : `<div class="company-logo">${job.company.charAt(0).toUpperCase()}</div>`;
        
        return `
        <div class="job-card">
            ${logoHtml}
            <div class="company-name">${job.company}</div>
            <div class="job-title">${job.title}</div>
            <div class="job-details">${job.location}</div>
            <div class="job-details">${job.type}</div>
            <div class="job-details">${job.experience}</div>
            <div class="job-salary">${job.salary}</div>
            <button class="apply-button" onclick="window.open('${job.applyLink}', '_blank')">aplicar</button>
        </div>
    `;
    }).join('');
}

// Fetch jobs from API
async function fetchJobs(team = null) {
    try {
        const url = team ? `${API_BASE_URL}/jobs?team=${encodeURIComponent(team)}` : `${API_BASE_URL}/jobs`;
        console.log(`Fetching jobs from: ${url}`);
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('error al cargar los trabajos');
        }
        
        const jobs = await response.json();
        console.log(`Fetched ${jobs.length} jobs from API`);
        return jobs;
    } catch (error) {
        console.error('Error fetching jobs:', error);
        return [];
    }
}

// Load jobs for a category
async function loadJobs(category) {
    const jobsGrid = document.getElementById('jobsGrid');
    jobsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 40px;">cargando...</p>';
    
    // Map category to team
    const teamMap = {
        'design': 'design',
        'engineering': 'engineering',
        'product': 'product',
        'growth': 'growth'
    };
    
    // Normalize category name (lowercase)
    const normalizedCategory = category.toLowerCase();
    const team = teamMap[normalizedCategory] || null;
    
    console.log(`Loading jobs for category: ${category}, team: ${team}`);
    const jobs = await fetchJobs(team);
    console.log(`Loaded ${jobs.length} jobs for category: ${category}`);
    renderJobs(jobs);
}

// Modal functionality
const submitModal = document.getElementById('submitModal');
const submitJobBtn = document.getElementById('submitJobBtn');
const closeModal = document.getElementById('closeModal');
const submitForm = document.getElementById('submitForm');

submitJobBtn.addEventListener('click', (e) => {
    e.preventDefault();
    submitModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeModal.addEventListener('click', () => {
    submitModal.classList.remove('active');
    document.body.style.overflow = '';
    submitForm.reset();
    // Remove iframe if exists
    const iframeContainer = document.getElementById('payment-iframe-container');
    if (iframeContainer) {
        iframeContainer.remove();
    }
    const paymentButton = submitForm.querySelector('.payment-button');
    if (paymentButton) {
        paymentButton.style.display = 'block';
    }
});

submitModal.addEventListener('click', (e) => {
    if (e.target === submitModal) {
        submitModal.classList.remove('active');
        document.body.style.overflow = '';
        submitForm.reset();
        // Remove countdown if exists
        const countdownContainer = document.getElementById('countdown-container');
        if (countdownContainer) {
            countdownContainer.remove();
        }
    }
});

// Tab switching
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const category = tab.getAttribute('data-tab');
        console.log(`Tab clicked: ${category}`);
        loadJobs(category);
    });
});

// Show payment iframe
function showPaymentIframe(jobId) {
    const paymentButton = submitForm.querySelector('.payment-button');
    paymentButton.style.display = 'none';
    
    // Remove existing iframe if any
    const existingIframe = document.getElementById('payment-iframe-container');
    if (existingIframe) {
        existingIframe.remove();
    }
    
    // Create iframe container
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'payment-iframe-container';
    iframeContainer.className = 'full-width';
    iframeContainer.style.cssText = 'grid-column: 1 / -1; margin: 20px 0; border-radius: 8px; overflow: hidden; border: 1px solid #e5e5e5; display: flex; flex-direction: column; max-height: calc(95vh - 200px); min-height: 800px;';
    
    const iframeTitle = document.createElement('div');
    iframeTitle.style.cssText = 'padding: 16px; background-color: #f5f5f5; border-bottom: 1px solid #e5e5e5; font-size: 14px; font-weight: 600; color: #000; flex-shrink: 0;';
    iframeTitle.textContent = 'completa el pago';
    
    const iframe = document.createElement('iframe');
    iframe.src = FINTOC_PAYMENT_URL;
    iframe.style.cssText = 'width: 100%; flex: 1; border: none; display: block; min-height: 0;';
    iframe.allow = 'payment';
    
    // Create account number section
    const accountSection = document.createElement('div');
    accountSection.style.cssText = 'padding: 20px; background-color: #ffffff; border-top: 1px solid #e5e5e5; flex-shrink: 0;';
    
    const accountLabel = document.createElement('label');
    accountLabel.style.cssText = 'display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; color: #000;';
    accountLabel.textContent = 'numero de cuenta de donde se transfiere';
    
    const accountInput = document.createElement('input');
    accountInput.type = 'text';
    accountInput.id = 'accountNumber';
    accountInput.style.cssText = 'width: 100%; padding: 12px 16px; border: 1px solid #e5e5e5; border-radius: 6px; font-size: 14px; font-family: inherit; margin-bottom: 16px;';
    accountInput.placeholder = 'ingresa el numero de cuenta';
    
    const submitOfferButton = document.createElement('button');
    submitOfferButton.type = 'button';
    submitOfferButton.className = 'submit-offer-button';
    submitOfferButton.textContent = 'subir oferta';
    submitOfferButton.style.cssText = 'width: 100%; padding: 16px; background-color: #000000; color: #ffffff; border: none; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; transition: background-color 0.2s; font-family: inherit;';
    
    // Handle submit offer button click
    submitOfferButton.addEventListener('click', async () => {
        const accountNumber = accountInput.value.trim();
        if (!accountNumber) {
            alert('por favor ingresa el numero de cuenta');
            return;
        }
        
        submitOfferButton.disabled = true;
        submitOfferButton.textContent = 'subiendo...';
        
        try {
            // Update payment status with account number (keep status as pending for admin review)
            const paymentResponse = await fetch(`${API_BASE_URL}/jobs/${jobId}/payment`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    paymentStatus: 'paid',
                    paymentIntentId: accountNumber
                })
            });
            
            if (!paymentResponse.ok) {
                throw new Error('error al actualizar el estado del pago');
            }
            
            // Success message
            accountSection.innerHTML = '<div style="padding: 20px; text-align: center;"><p style="font-size: 18px; font-weight: 600; color: #000; margin-bottom: 10px;">¡oferta enviada exitosamente!</p><p style="color: #666;">tu trabajo será revisado y publicado pronto.</p></div>';
            
            // Close modal after 2 seconds
            setTimeout(() => {
                submitModal.classList.remove('active');
                document.body.style.overflow = '';
                submitForm.reset();
                iframeContainer.remove();
                paymentButton.style.display = 'block';
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting offer:', error);
            alert('error al subir la oferta: ' + (error.message || 'por favor intenta de nuevo'));
            submitOfferButton.disabled = false;
            submitOfferButton.textContent = 'subir oferta';
        }
    });
    
    accountSection.appendChild(accountLabel);
    accountSection.appendChild(accountInput);
    accountSection.appendChild(submitOfferButton);
    
    iframeContainer.appendChild(iframeTitle);
    iframeContainer.appendChild(iframe);
    iframeContainer.appendChild(accountSection);
    
    // Insert before payment button
    paymentButton.parentNode.insertBefore(iframeContainer, paymentButton);
}

// Form submission
submitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(submitForm);
    const data = Object.fromEntries(formData);
    
    const paymentButton = submitForm.querySelector('.payment-button');
    const originalText = paymentButton.textContent;
    
    try {
        // Step 1: Create job
        paymentButton.disabled = true;
        paymentButton.textContent = 'creando trabajo...';
        
        console.log('Submitting job with data:', {
            companyName: data.companyName,
            jobTitle: data.jobTitle,
            team: data.team
        });
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        let jobResponse;
        try {
            jobResponse = await fetch(`${API_BASE_URL}/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    companyName: data.companyName,
                    companyWebsite: data.companyWebsite,
                    jobTitle: data.jobTitle,
                    jobLocation: data.jobLocation,
                    jobType: data.jobType,
                    experienceLevel: data.experienceLevel,
                    remoteOnsite: data.remoteOnsite,
                    compensation: data.compensation,
                    team: data.team,
                    applicationLink: data.applicationLink,
                    submitterName: data.yourName,
                    submitterEmail: data.yourEmail
                }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
        } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
                throw new Error('la solicitud tardó demasiado. por favor intenta de nuevo.');
            }
            throw fetchError;
        }
        
        console.log('Job response status:', jobResponse.status);
        console.log('Job response ok:', jobResponse.ok);
        console.log('Job response headers:', jobResponse.headers.get('content-type'));
        
        // Check if response is JSON
        const contentType = jobResponse.headers.get('content-type');
        let responseData;
        
        if (contentType && contentType.includes('application/json')) {
            responseData = await jobResponse.json();
            console.log('Job response data:', responseData);
        } else {
            // If not JSON, get text and log it
            const textResponse = await jobResponse.text();
            console.error('Non-JSON response received:', textResponse);
            throw new Error('el servidor devolvió una respuesta inválida. por favor intenta de nuevo.');
        }
        
        if (!jobResponse.ok) {
            throw new Error(responseData.error || 'error al crear el trabajo');
        }
        
        // Handle both 'jobId' and 'id' in response
        const jobId = responseData.jobId || responseData.id;
        
        if (!jobId) {
            console.error('No jobId in response:', responseData);
            throw new Error('no se recibió el ID del trabajo');
        }
        
        console.log('Job created successfully with ID:', jobId);
        
        // Step 2: Show payment iframe
        paymentButton.textContent = originalText;
        showPaymentIframe(jobId);
        
    } catch (error) {
        console.error('Error submitting job:', error);
        console.error('Error stack:', error.stack);
        alert('error enviando el trabajo: ' + (error.message || 'por favor intenta de nuevo'));
        paymentButton.disabled = false;
        paymentButton.textContent = originalText;
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Load initial jobs - try loading all first to debug
    console.log('Initializing page...');
    console.log('Loading all jobs first to verify they exist...');
    const allJobs = await fetchJobs(null);
    console.log(`Found ${allJobs.length} total approved jobs on page load`);
    
    // Now load design jobs
    await loadJobs('design');
});

// Handle escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && submitModal.classList.contains('active')) {
        submitModal.classList.remove('active');
        document.body.style.overflow = '';
        submitForm.reset();
        // Remove countdown if exists
        const countdownContainer = document.getElementById('countdown-container');
        if (countdownContainer) {
            countdownContainer.remove();
        }
    }
});
