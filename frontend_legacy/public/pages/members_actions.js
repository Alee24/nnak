// Member Action Functions using centralized AdminAPI

// View Member Profile
async function viewMemberProfile(memberId) {
    window.location.href = `profile.html?id=${memberId}`;
}

// Edit Member
function editMember(memberId) {
    Swal.fire({
        title: 'Edit Member',
        text: 'This feature will open the edit form',
        icon: 'info'
    });
}

// Toggle Member Status
async function toggleMemberStatus(memberId, currentStatus) {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'active' ? 'Activate' : 'Suspend';

    const result = await Swal.fire({
        title: `${action} Member?`,
        text: `Are you sure you want to ${action.toLowerCase()} this member?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: newStatus === 'active' ? '#10b981' : '#f59e0b',
        confirmButtonText: `Yes, ${action}`,
        customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl',
            cancelButton: 'rounded-xl'
        }
    });

    if (result.isConfirmed) {
        try {
            const data = await AdminAPI.updateMemberStatus(memberId, newStatus);

            await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Member has been ${newStatus}`,
                timer: 1500,
                showConfirmButton: false
            });

            if (typeof loadMembers === 'function') loadMembers();
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }
}

// Award CPD Modal
async function awardCPD(memberId, memberName) {
    document.getElementById('cpdMemberId').value = memberId;
    document.getElementById('cpdMemberName').textContent = memberName;
    document.getElementById('cpdForm').reset();
    document.getElementById('cpdDate').value = new Date().toISOString().split('T')[0];

    const modal = document.getElementById('awardCPDModal');
    if (modal) modal.classList.remove('hidden', 'modal-hidden');
    if (window.lucide) lucide.createIcons();
}

async function submitAwardCPD() {
    const memberId = document.getElementById('cpdMemberId').value;
    const points = parseInt(document.getElementById('cpdPoints').value);
    const activityType = document.getElementById('cpdActivityType').value;
    const description = document.getElementById('cpdDescription').value;
    const date = document.getElementById('cpdDate').value;

    if (!points || points <= 0) {
        return Swal.fire('Validation Error', 'Please enter valid points', 'warning');
    }

    try {
        const data = await AdminAPI.awardCPDPoints(memberId, {
            points,
            activity_type: activityType,
            description,
            awarded_date: date
        });

        closeModal('awardCPDModal');
        await Swal.fire({
            icon: 'success',
            title: 'Success',
            text: data.message,
            timer: 2000,
            showConfirmButton: false
        });
        if (typeof loadMembers === 'function') loadMembers();
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

// Update License Modal
async function updateLicense(memberId, memberName) {
    document.getElementById('licenseMemberId').value = memberId;
    document.getElementById('licenseMemberName').textContent = memberName;
    document.getElementById('licenseForm').reset();

    const modal = document.getElementById('updateLicenseModal');
    if (modal) modal.classList.remove('hidden', 'modal-hidden');
    if (window.lucide) lucide.createIcons();
}

async function submitUpdateLicense() {
    const memberId = document.getElementById('licenseMemberId').value;
    const licenseNumber = document.getElementById('licenseNumber').value;
    const expiryDate = document.getElementById('licenseExpiryDate').value;
    const licenseStatus = document.getElementById('licenseStatus').value;

    const updates = {};
    if (licenseNumber) updates.license_number = licenseNumber;
    if (expiryDate) updates.license_expiry_date = expiryDate;
    if (licenseStatus) updates.license_status = licenseStatus;

    if (Object.keys(updates).length === 0) {
        return Swal.fire('Validation Error', 'Please provide at least one field to update', 'warning');
    }

    try {
        const data = await AdminAPI.updateLicense(memberId, updates);

        closeModal('updateLicenseModal');
        await Swal.fire({
            icon: 'success',
            title: 'Success',
            text: data.message,
            timer: 2000,
            showConfirmButton: false
        });
        if (typeof loadMembers === 'function') loadMembers();
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

// Delete Member
async function deleteMember(memberId) {
    const result = await Swal.fire({
        title: 'Delete Member?',
        text: "This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Delete Member',
        customClass: {
            popup: 'rounded-2xl',
            confirmButton: 'rounded-xl',
            cancelButton: 'rounded-xl'
        }
    });

    if (result.isConfirmed) {
        try {
            await AdminAPI.deleteMember(memberId);

            await Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Member has been removed.',
                timer: 1500,
                showConfirmButton: false
            });

            if (typeof loadMembers === 'function') loadMembers();
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }
}

// Helper: Get Status Pill
function getStatusPill(status) {
    const styles = {
        active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        suspended: 'bg-rose-100 text-rose-700 border-rose-200',
        inactive: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    const style = styles[status] || styles.inactive;
    return `<span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style}">${status}</span>`;
}

// Helper: Close Modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden', 'modal-hidden');
}
