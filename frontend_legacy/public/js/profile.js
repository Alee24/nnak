/**
 * Profile Page Scripts
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Get Member ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('id');

    if (!memberId) {
        Swal.fire('Error', 'No member ID provided', 'error').then(() => {
            window.location.href = 'members.html';
        });
        return;
    }

    // 2. Initialize UI
    if (window.lucide) lucide.createIcons();
    setupTabSwitching();

    // 3. Load Data
    await loadProfileData(memberId);
});

/**
 * Switch Tabs
 */
function setupTabSwitching() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            // Update Buttons
            tabs.forEach(t => {
                t.classList.remove('tab-active', 'bg-indigo-600', 'text-white');
                t.classList.add('text-gray-500');
            });
            tab.classList.add('tab-active');
            tab.classList.remove('text-gray-500');

            // Update Content
            contents.forEach(c => c.classList.add('hidden'));
            document.getElementById(`tab-${target}`).classList.remove('hidden');

            if (window.lucide) lucide.createIcons();
        });
    });
}

/**
 * Fetch and Render Member Data
 */
async function loadProfileData(id) {
    try {
        const result = await AdminAPI.get(`/member/${id}/profile`);

        if (!result || !result.success) {
            throw new Error(result.error || 'Failed to load profile');
        }

        const m = result.member;
        const cpd = result.cpd_summary;
        const interactions = result.interactions;

        // --- Render Summary Card ---
        document.getElementById('memberName').innerText = `${m.first_name} ${m.last_name}`;
        document.getElementById('memberEmail').innerText = m.email;
        document.getElementById('memberPhone').innerText = m.phone || 'N/A';
        document.getElementById('memberRank').innerText = m.rank_name || 'Member';
        document.getElementById('cpdPoints').innerText = cpd.total || 0;
        document.getElementById('statusText').innerText = m.status;

        const photo = document.getElementById('profilePhoto');
        if (m.profile_photo) {
            photo.src = m.profile_photo;
        } else {
            photo.src = `https://ui-avatars.com/api/?name=${m.first_name}+${m.last_name}&background=6366f1&color=fff&size=128`;
        }

        // Status Indicator Color
        const indicator = document.getElementById('statusIndicator');
        const statusLabel = document.getElementById('statusLabel');
        indicator.className = 'w-2 h-2 rounded-full ' + (m.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500');

        // --- Render Overview Tab ---
        document.getElementById('fullLegalName').innerText = `${m.first_name} ${m.last_name}`;
        document.getElementById('physicalAddress').innerText = (m.address || m.city) ? `${m.address || ''}, ${m.city || ''}` : 'Not provided';
        document.getElementById('nationalId').innerText = m.id_number || 'Not provided';
        document.getElementById('membershipNo').innerText = m.member_id || m.membership_number || 'PENDING';
        document.getElementById('primaryPhone').innerText = m.phone || 'N/A';
        document.getElementById('joinDate').innerText = m.registration_date ? new Date(m.registration_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
        document.getElementById('lastPayment').innerText = cpd.last_award ? new Date(cpd.last_award).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No history';

        // --- Render ID Card Preview ---
        document.getElementById('card-name').innerText = `${m.first_name} ${m.last_name}`;
        document.getElementById('card-id').innerText = m.member_id || 'PENDING';
        document.getElementById('card-national-id').innerText = m.id_number || 'N/A';

        // Calculate Validity (e.g., end of next year or current year)
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 2); // 2 years validity example
        document.getElementById('card-validity').innerText = `December, ${expiry.getFullYear()}`;

        const cardPhoto = document.getElementById('cardPhoto');
        const cardPlaceholder = document.getElementById('cardPlaceholder');

        if (m.profile_photo) {
            cardPhoto.src = m.profile_photo;
            cardPhoto.classList.remove('hidden');
            cardPlaceholder.classList.add('hidden');
        } else {
            cardPhoto.classList.add('hidden');
            cardPlaceholder.classList.remove('hidden');
        }

        // --- Render Certificate Preview ---
        document.getElementById('cert-name').innerText = `${m.first_name} ${m.last_name}`;
        document.getElementById('cert-number').innerText = m.member_id || 'PENDING';
        document.getElementById('cert-date').innerText = m.registration_date ? new Date(m.registration_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A';

        // --- Render Interactions Log ---
        renderInteractions(interactions);

    } catch (error) {
        console.error('Profile Load Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Load Failed',
            text: error.message
        });
    }
}

/**
 * Render Interaction Log
 */
function renderInteractions(logs) {
    const container = document.getElementById('interactionList');

    if (!logs || logs.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg data-lucide="info" width="48" class="mb-4 opacity-20"></svg>
                <p class="text-sm italic">No interactions recorded yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = logs.map(log => {
        let icon = 'activity';
        let color = 'bg-blue-50 text-blue-600';

        if (log.action_type === 'STATUS_CHANGE') {
            icon = 'refresh-cw';
            color = 'bg-orange-50 text-orange-600';
        } else if (log.action_type === 'CPD_AWARD') {
            icon = 'award';
            color = 'bg-green-50 text-green-600';
        }

        return `
            <div class="flex gap-4 p-5 hover:bg-gray-50 rounded-2xl transition group">
                <div class="flex-shrink-0">
                    <div class="p-2.5 ${color} rounded-xl group-hover:scale-110 transition">
                        <svg data-lucide="${icon}" width="18"></svg>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start mb-1">
                        <h4 class="font-bold text-gray-900 text-sm tracking-tight">${log.action_type.replace('_', ' ')}</h4>
                        <span class="text-[10px] font-medium text-gray-400 uppercase tracking-widest">${new Date(log.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="text-sm text-gray-500 leading-relaxed">${log.description}</p>
                </div>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

/**
 * Download ID Card PDF
 */
async function downloadIdCard() {
    const { jsPDF } = window.jspdf;

    // Show Loading
    Swal.fire({
        title: 'Generating PDF...',
        text: 'Preparing your digital ID card',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        const cardEl = document.getElementById('card-container');

        // Capture element
        const canvas = await html2canvas(cardEl, {
            scale: 3,
            useCORS: true,
            backgroundColor: null,
            logging: false
        });

        // Generate PDF
        const doc = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');

        // Center on A4 page (A4 width = 210mm)
        // Card is 600px x 340px
        const pdfWidth = 100; // Increase width slightly for better print size (~10cm)
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const x = (210 - pdfWidth) / 2;
        const y = 20;

        doc.addImage(imgData, 'PNG', x, y, pdfWidth, pdfHeight);

        // Get filename
        const name = document.getElementById('card-name').innerText.replace(/\s+/g, '_');
        doc.save(`NNAK_ID_${name}.pdf`);

        Swal.close();

        // Success Toast
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
        Toast.fire({
            icon: 'success',
            title: 'ID Card Downloaded'
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Download Failed',
            text: 'Could not generate PDF. Please try again.'
        });
    }
}

/**
 * Download Certificate PDF
 */
async function downloadCertificate() {
    const { jsPDF } = window.jspdf;

    // Show Loading
    Swal.fire({
        title: 'Generating Certificate...',
        text: 'Preparing your official document',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        const certEl = document.getElementById('certificate-container');

        // Capture element
        const canvas = await html2canvas(certEl, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        });

        // Generate PDF
        const doc = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');

        // A4 Dimensions: 210mm x 297mm
        const pdfWidth = 210;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // If height > 297, scale down to fit
        let finalWidth = pdfWidth;
        let finalHeight = pdfHeight;

        if (pdfHeight > 297) {
            finalHeight = 297;
            finalWidth = (canvas.width * finalHeight) / canvas.height;
        }

        const x = (210 - finalWidth) / 2;
        const y = (297 - finalHeight) / 2;

        doc.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);

        // Get filename
        let name = 'Member';
        const nameEl = document.getElementById('cert-name');
        if (nameEl) {
            name = nameEl.innerText.replace(/\s+/g, '_');
        }
        doc.save(`NNAK_Certificate_${name}.pdf`);

        Swal.close();

        // Success Toast
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
        Toast.fire({
            icon: 'success',
            title: 'Certificate Downloaded'
        });

    } catch (error) {
        console.error('Certificate Generation Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Download Failed',
            text: 'Could not generate Certificate. Please try again.'
        });
    }
}
