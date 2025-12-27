/**
 * Job Board Frontend
 */

const API_BASE = window.location.origin + '/api';
const PAYMENT_URL = 'https://fintoc.me/admin/15000';

// =============================================================================
// DOM ELEMENTS
// =============================================================================

const jobsGrid = document.getElementById('jobsGrid');
const submitModal = document.getElementById('submitModal');
const submitForm = document.getElementById('submitForm');
const submitJobBtn = document.getElementById('submitJobBtn');
const closeModal = document.getElementById('closeModal');
const tabs = document.querySelectorAll('.tab');

// =============================================================================
// JOB RENDERING
// =============================================================================

function renderJobs(jobs) {
  if (!jobs?.length) {
    jobsGrid.innerHTML = `
      <p style="grid-column: 1/-1; text-align: center; color: #666; padding: 40px;">
        no hay trabajos disponibles en este momento.
      </p>
    `;
    return;
  }
  
  jobsGrid.innerHTML = jobs.map(job => {
    const logoHtml = job.logo 
      ? `<div class="company-logo">
           <img src="${job.logo}" alt="${job.company}" 
                onerror="this.style.display='none'; this.parentElement.textContent='${job.company.charAt(0).toUpperCase()}';">
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

// =============================================================================
// API CALLS
// =============================================================================

async function fetchJobs(team = null) {
  try {
    const url = team ? `${API_BASE}/jobs?team=${encodeURIComponent(team)}` : `${API_BASE}/jobs`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Error fetching jobs');
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

async function createJob(data) {
  const response = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || 'Error al crear trabajo');
  }
  
  return response.json();
}

async function updatePayment(jobId, accountNumber) {
  const response = await fetch(`${API_BASE}/jobs/${jobId}/payment`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentStatus: 'paid',
      paymentIntentId: accountNumber
    })
  });
  
  if (!response.ok) throw new Error('Error al actualizar pago');
  
  return response.json();
}

// =============================================================================
// UI HELPERS
// =============================================================================

async function loadJobs(category) {
  jobsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666; padding: 40px;">cargando...</p>';
  
  const teamMap = { design: 'design', engineering: 'engineering', product: 'product', growth: 'growth' };
  const team = teamMap[category.toLowerCase()] || null;
  
  const jobs = await fetchJobs(team);
  renderJobs(jobs);
}

function openModal() {
  submitModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModalHandler() {
  submitModal.classList.remove('active');
  document.body.style.overflow = '';
  submitForm.reset();
  
  const iframe = document.getElementById('payment-iframe-container');
  if (iframe) iframe.remove();
  
  const paymentBtn = submitForm.querySelector('.payment-button');
  if (paymentBtn) paymentBtn.style.display = 'block';
}

function showPaymentIframe(jobId) {
  const paymentButton = submitForm.querySelector('.payment-button');
  paymentButton.style.display = 'none';
  
  const existingIframe = document.getElementById('payment-iframe-container');
  if (existingIframe) existingIframe.remove();
  
  const container = document.createElement('div');
  container.id = 'payment-iframe-container';
  container.className = 'full-width';
  container.style.cssText = `
    grid-column: 1 / -1; margin: 20px 0; border-radius: 8px; overflow: hidden;
    border: 1px solid #e5e5e5; display: flex; flex-direction: column;
    max-height: calc(95vh - 200px); min-height: 800px;
  `;
  
  container.innerHTML = `
    <div style="padding: 16px; background: #f5f5f5; border-bottom: 1px solid #e5e5e5; font-weight: 600;">
      completa el pago
    </div>
    <iframe src="${PAYMENT_URL}" style="flex: 1; border: none; min-height: 0;" allow="payment"></iframe>
    <div style="padding: 20px; border-top: 1px solid #e5e5e5;">
      <label style="display: block; font-weight: 500; margin-bottom: 8px;">
        numero de cuenta de donde se transfiere
      </label>
      <input type="text" id="accountNumber" placeholder="ingresa el numero de cuenta"
             style="width: 100%; padding: 12px; border: 1px solid #e5e5e5; border-radius: 6px; margin-bottom: 16px;">
      <button type="button" id="submitOfferBtn"
              style="width: 100%; padding: 16px; background: #000; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
        subir oferta
      </button>
    </div>
  `;
  
  paymentButton.parentNode.insertBefore(container, paymentButton);
  
  // Handle submit
  document.getElementById('submitOfferBtn').addEventListener('click', async () => {
    const accountNumber = document.getElementById('accountNumber').value.trim();
    if (!accountNumber) {
      alert('por favor ingresa el numero de cuenta');
      return;
    }
    
    const btn = document.getElementById('submitOfferBtn');
    btn.disabled = true;
    btn.textContent = 'subiendo...';
    
    try {
      await updatePayment(jobId, accountNumber);
      
      container.querySelector('div:last-child').innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <p style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">¡oferta enviada exitosamente!</p>
          <p style="color: #666;">tu trabajo será revisado y publicado pronto.</p>
        </div>
      `;
      
      setTimeout(closeModalHandler, 2000);
    } catch (error) {
      alert('error al subir la oferta: ' + error.message);
      btn.disabled = false;
      btn.textContent = 'subir oferta';
    }
  });
}

// =============================================================================
// FORM SUBMISSION
// =============================================================================

async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(submitForm);
  const data = Object.fromEntries(formData);
  const paymentButton = submitForm.querySelector('.payment-button');
  const originalText = paymentButton.textContent;
  
  try {
    paymentButton.disabled = true;
    paymentButton.textContent = 'creando trabajo...';
    
    const jobData = {
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
    };
    
    const result = await createJob(jobData);
    const jobId = result.jobId || result.id;
    
    if (!jobId) throw new Error('No se recibió ID del trabajo');
    
    paymentButton.textContent = originalText;
    showPaymentIframe(jobId);
  } catch (error) {
    console.error('Submit error:', error);
    alert('error enviando el trabajo: ' + error.message);
    paymentButton.disabled = false;
    paymentButton.textContent = originalText;
  }
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

submitJobBtn.addEventListener('click', (e) => {
  e.preventDefault();
  openModal();
});

closeModal.addEventListener('click', closeModalHandler);

submitModal.addEventListener('click', (e) => {
  if (e.target === submitModal) closeModalHandler();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && submitModal.classList.contains('active')) {
    closeModalHandler();
  }
});

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    loadJobs(tab.getAttribute('data-tab'));
  });
});

submitForm.addEventListener('submit', handleFormSubmit);

// =============================================================================
// THEME TOGGLE
// =============================================================================

const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

// Check saved preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  root.classList.add('light-mode');
  themeToggle.textContent = 'dark mode';
}

themeToggle.addEventListener('click', (e) => {
  e.preventDefault();
  root.classList.toggle('light-mode');
  
  const isLight = root.classList.contains('light-mode');
  themeToggle.textContent = isLight ? 'dark mode' : 'light mode';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// =============================================================================
// SUBSCRIBE FUNCTIONALITY
// =============================================================================

const subscribeToggle = document.getElementById('subscribeToggle');
const subscribeCollapse = document.getElementById('subscribeCollapse');
const subscribeEmail = document.getElementById('subscribeEmail');
const subscribeBtn = document.getElementById('subscribeBtn');
const subscribeFeedback = document.getElementById('subscribeFeedback');

subscribeToggle.addEventListener('click', (e) => {
  e.preventDefault();
  subscribeCollapse.classList.toggle('active');
  if (subscribeCollapse.classList.contains('active')) {
    setTimeout(() => subscribeEmail.focus(), 100);
  }
});

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFeedback(message, isSuccess) {
  subscribeFeedback.textContent = message;
  subscribeFeedback.className = 'subscribe-feedback show ' + (isSuccess ? 'success' : 'error');
  
  if (isSuccess) {
    setTimeout(() => {
      subscribeFeedback.classList.remove('show');
      subscribeEmail.value = '';
    }, 3000);
  }
}

subscribeBtn.addEventListener('click', () => {
  const email = subscribeEmail.value.trim();
  
  if (!email) {
    showFeedback('ingresa tu email', false);
    return;
  }
  
  if (!validateEmail(email)) {
    showFeedback('email inválido', false);
    return;
  }
  
  // Simulate success (replace with real API call)
  subscribeBtn.textContent = '...';
  subscribeBtn.disabled = true;
  
  setTimeout(() => {
    showFeedback('¡agregado! te avisaremos de nuevos trabajos.', true);
    subscribeBtn.textContent = '→';
    subscribeBtn.disabled = false;
  }, 500);
});

subscribeEmail.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    subscribeBtn.click();
  }
});

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  loadJobs('design');
});
