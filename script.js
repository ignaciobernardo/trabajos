// Sample job data
const sampleJobs = {
    design: [
        {
            company: "Figma",
            logo: "https://www.google.com/s2/favicons?domain=figma.com&sz=64",
            title: "Product Designer, AI",
            location: "Onsite or remote SF/NY",
            type: "Full-time",
            experience: "Mid level",
            salary: "$164K-$294K",
            applyLink: "https://figma.com/jobs"
        },
        {
            company: "Notion",
            logo: "https://www.google.com/s2/favicons?domain=notion.so&sz=64",
            title: "Creative Studio Operations Manager",
            location: "Onsite New York, NY",
            type: "Full-time",
            experience: "Mid/Senior",
            salary: "$140K-$170K",
            applyLink: "https://notion.so/jobs"
        },
        {
            company: "Specialized",
            logo: "https://www.google.com/s2/favicons?domain=specialized.com&sz=64",
            title: "Leader of Design - Color & Concepts",
            location: "Onsite Morgan Hill, CA",
            type: "Full-time",
            experience: "Senior",
            salary: "$129K-$225K",
            applyLink: "https://specialized.com/jobs"
        },
        {
            company: "Adobe",
            logo: "https://www.google.com/s2/favicons?domain=adobe.com&sz=64",
            title: "Sr Designer, Brand",
            location: "Onsite SF/NY",
            type: "Full-time",
            experience: "Senior",
            salary: "$117K-227K",
            applyLink: "https://adobe.com/jobs"
        },
        {
            company: "Twenty",
            logo: "https://www.google.com/s2/favicons?domain=twenty.com&sz=64",
            title: "Product Designer Freelance",
            location: "Hybrid Paris, FR",
            type: "Contract",
            experience: "Entry/Mid",
            salary: "$2K-$10K/mo",
            applyLink: "https://twenty.com/jobs"
        },
        {
            company: "Replit",
            logo: "https://www.google.com/s2/favicons?domain=replit.com&sz=64",
            title: "Brand Designer",
            location: "Hybrid Foster City, CA",
            type: "Full-time",
            experience: "Mid level",
            salary: "$150K-$220K",
            applyLink: "https://replit.com/jobs"
        },
        {
            company: "Retool",
            logo: "https://www.google.com/s2/favicons?domain=retool.com&sz=64",
            title: "Product Designer, Hub",
            location: "Onsite San Francisco, CA",
            type: "Full-time",
            experience: "Mid level",
            salary: "$181K-$255K",
            applyLink: "https://retool.com/jobs"
        },
        {
            company: "Yarn",
            logo: "https://www.google.com/s2/favicons?domain=yarn.com&sz=64",
            title: "Founding Product Designer",
            location: "Onsite New York, NY",
            type: "Full-time",
            experience: "Entry level",
            salary: "$150K-$220K",
            applyLink: "https://yarn.com/jobs"
        },
        {
            company: "Vercel",
            logo: "https://www.google.com/s2/favicons?domain=vercel.com&sz=64",
            title: "Senior Brand Designer",
            location: "Remote USA, Argentina",
            type: "Full-time",
            experience: "Senior",
            salary: "$150K-$220K",
            applyLink: "https://vercel.com/jobs"
        },
        {
            company: "Vercel",
            logo: "https://www.google.com/s2/favicons?domain=vercel.com&sz=64",
            title: "Senior Product Designer",
            location: "Hybrid SF/NY",
            type: "Full-time",
            experience: "Senior",
            salary: "$150K-$220K",
            applyLink: "https://vercel.com/jobs"
        },
        {
            company: "Netflix",
            logo: "https://www.google.com/s2/favicons?domain=netflix.com&sz=64",
            title: "Senior Product Designer, Live",
            location: "Remote USA",
            type: "Full-time",
            experience: "Senior",
            salary: "$150K-$220K",
            applyLink: "https://netflix.com/jobs"
        },
        {
            company: "Shield AI",
            logo: "https://www.google.com/s2/favicons?domain=shield.ai&sz=64",
            title: "Senior Staff Product Designer",
            location: "Onsite Dallas, TX",
            type: "Full-time",
            experience: "Senior",
            salary: "$150K-$220K",
            applyLink: "https://shield.ai/jobs"
        }
    ],
    engineering: []
};

// Get favicon from company website
async function getFavicon(websiteUrl) {
    if (!websiteUrl) return null;
    
    try {
        // Clean the URL
        let url = websiteUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        
        const domain = new URL(url).hostname;
        
        // Use Google's favicon service as a reliable fallback
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        return faviconUrl;
    } catch (error) {
        console.error('Error getting favicon:', error);
        return null;
    }
}

// Render job cards
function renderJobs(category = 'design') {
    const jobsGrid = document.getElementById('jobsGrid');
    const jobs = sampleJobs[category] || [];
    
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
            <button class="apply-button" onclick="window.open('${job.applyLink}', '_blank')">Apply</button>
        </div>
    `;
    }).join('');
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
});

submitModal.addEventListener('click', (e) => {
    if (e.target === submitModal) {
        submitModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Tab switching
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const category = tab.getAttribute('data-tab');
        renderJobs(category);
    });
});

// Form submission
submitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(submitForm);
    const data = Object.fromEntries(formData);
    
    // Get favicon from company website
    const companyWebsite = data.companyWebsite;
    const faviconUrl = await getFavicon(companyWebsite);
    
    // Add favicon to data
    data.faviconUrl = faviconUrl;
    
    // Show loading state
    const paymentButton = submitForm.querySelector('.payment-button');
    const originalText = paymentButton.textContent;
    paymentButton.disabled = true;
    paymentButton.textContent = 'Processing...';
    
    try {
        // Simulate payment processing
        await processPayment(data);
        
        // Add job to the appropriate category
        const team = data.team.toLowerCase();
        const category = team === 'design' ? 'design' : 'engineering';
        
        // Get domain for favicon fallback
        let faviconFallback = null;
        try {
            const domain = new URL(companyWebsite.startsWith('http') ? companyWebsite : 'https://' + companyWebsite).hostname;
            faviconFallback = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch (e) {
            console.error('Error parsing URL:', e);
        }
        
        const newJob = {
            company: data.companyName,
            logo: faviconUrl || faviconFallback,
            title: data.jobTitle,
            location: data.jobLocation,
            type: data.jobType,
            experience: data.experienceLevel,
            salary: data.compensation,
            applyLink: data.applicationLink
        };
        
        if (!sampleJobs[category]) {
            sampleJobs[category] = [];
        }
        
        sampleJobs[category].unshift(newJob);
        
        // Re-render jobs if on the correct tab
        const activeTab = document.querySelector('.tab.active');
        if (activeTab && activeTab.getAttribute('data-tab') === category) {
            renderJobs(category);
        }
        
        // Reset form and close modal
        submitForm.reset();
        submitModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Show success message
        alert('Job submitted successfully! Payment processed.');
        
    } catch (error) {
        console.error('Error submitting job:', error);
        alert('Error submitting job. Please try again.');
    } finally {
        paymentButton.disabled = false;
        paymentButton.textContent = originalText;
    }
});

// Payment processing function
async function processPayment(data) {
    // Simulate payment processing
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // In a real implementation, you would integrate with Stripe, PayPal, or another payment processor
            // For now, we'll simulate a successful payment
            console.log('Processing payment for:', data);
            console.log('Amount: $25');
            
            // Simulate API call
            const success = true; // In real app, this would be the result from payment API
            
            if (success) {
                resolve({ success: true, transactionId: 'txn_' + Date.now() });
            } else {
                reject(new Error('Payment failed'));
            }
        }, 1500);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderJobs('design');
    
    // Add favicon fetching when company website is entered
    const companyWebsiteInput = document.getElementById('companyWebsite');
    companyWebsiteInput.addEventListener('blur', async () => {
        const website = companyWebsiteInput.value.trim();
        if (website) {
            // Preview favicon (optional - could show it next to the input)
            const favicon = await getFavicon(website);
            if (favicon) {
                console.log('Favicon found:', favicon);
            }
        }
    });
});

// Handle escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && submitModal.classList.contains('active')) {
        submitModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

