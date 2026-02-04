// Member Action Functions

// View Member Profile
async function viewMemberProfile(memberId) {
    const modal = document.getElementById('viewMemberModal');
    modal.classList.remove('hidden', 'modal-hidden');

    try {
        const response = await AdminAPI.getMember(memberId);
        const member = response;

        document.getElementById('profileMemberName').textContent = `${member.first_name} ${member.last_name}`;
        document.getElementById('profileMemberId').textContent = member.member_id;

        // Get CPD history
        const cpdResponse = await fetch(`http://localhost:8000/index.php?request=api/member/${memberId}/cpd-points`, {
            credentials: 'include'
        });
        const cpdData = await cpdResponse.json();

        const content = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Personal Info -->
                <div class="space-y-4">
                    <h4 class="text-sm font-bold text-gray-500 uppercase">Personal Information</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="text-xs text-gray-500">Full Name</label>
                            <p class="text-sm font-medium text-gray-900">${member.first_name} ${member.last_name}</p>
                        </div>
                        <div>
                            <label class="text-xs text-gray-500">Member ID</label>
                            <p class="text-sm font-medium text-gray-900">${member.member_id || 'Pending'}</p>
                        </div>
                        <div>
                            <label class="text-xs text-gray-500">Email</label>
                            <p class="text-sm font-medium text-gray-900">${member.email}</p>
                       </div>
                        <div>
                            <label class="text-xs text-gray-500">Phone</label>
                            <p class="text-sm font-medium text-gray-900">${member.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="text-xs text-gray-500">Status</label>
                            <p>${getStatusPill(member.status)}</p>
                        </div>
                    </div>
                </div>
                
                <!-- License Info -->
                <div class="space-y-4">
                    <h4 class="text-sm font-bold text-gray-500 uppercase">License Information</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="text-xs text-gray-500">License Number</label>
                            <p class="text-sm font-medium text-gray-900">${member.license_number || 'Not Set'}</p>
                        </div>
                        <div>
                            <label class="text-xs text-gray-500">Expiry Date</label>
                            <p class="text-sm font-medium text-gray-900">${member.license_expiry_date || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="text-xs text-gray-500">License Status</label>
                            <p class="text-sm font-medium text-gray-900 capitalize">${member.license_status || 'not_set'}</p>
                        </div>
                        <div>
                            <label class="text-xs text-gray-500">Total CPD Points</label>
                            <p class="text-2xl font-bold text-purple-600">${member.total_cpd_points || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- CPD Points History -->
            <div class="mt-6">
                <h4 class="text-sm font-bold text-gray-500 uppercase mb-4">CPD Points History</h4>
                ${cpdData.history && cpdData.history.length > 0 ? `
                    <div class="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                        ${cpdData.history.map(h => `
                            <div class="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p class="text-sm font-medium text-gray-900">${h.activity_type}</p>
                                    <p class="text-xs text-gray-500">${h.description || ''}</p>
                                    <p class="text-xs text-gray-400 mt-1">${h.awarded_date} • Awarded by ${h.awarded_by_name} ${h.awarded_by_last_name}</p>
                                </div>
                                <span class="text-lg font-bold text-purple-600">+${h.points}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-sm text-gray-500 text-center py-4">No CPD points awarded yet</p>'}
            </div>
        `;

        document.getElementById('memberProfileContent').innerHTML = content;
        lucide.createIcons();

    } catch (error) {
        console.error('Error loading member profile:', error);
        Swal.fire('Error', 'Failed to load member profile', 'error');
        closeModal('viewMemberModal');
    }
}

// Edit Member
function editMember(memberId) {
    Swal.fire({
        title: 'Edit Member',
        text: 'This feature will open the edit form',
        icon: 'info'
    });
    // TODO: Implement edit functionality (can reuse addMemberModal with pre-filled data)
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
            const response = await fetch(`http://localhost:8000/index.php?request=api/member/${memberId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (response.ok) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: `Member has been ${newStatus}`,
                    timer: 1500,
                    showConfirmButton: false
                });
                loadMembers();
            } else {
                throw new Error(data.error || 'Failed to update status');
            }
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }
}

// Award CPD Points
function openAwardCPDModal(memberId, memberName) {
    document.getElementById('cpdMemberId').value = memberId;
    document.getElementById('cpdMemberName').textContent = memberName;
    document.getElementById('cpdPoints').value = '';
    document.getElementById('cpdActivityType').value = 'Manual Award';
    document.getElementById('cpdDescription').value = '';
    document.getElementById('cpdDate').value = new Date().toISOString().split('T')[0];

    const modal = document.getElementById('awardCPDModal');
    modal.classList.remove('hidden', 'modal-hidden');
    lucide.createIcons();
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
        const response = await fetch(`http://localhost:8000/index.php?request=api/member/${memberId}/cpd-points`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                points,
                activity_type: activityType,
                description,
                awarded_date: date
            })
        });

        const data = await response.json();

        if (response.ok) {
            closeModal('awardCPDModal');
            await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: data.message,
                timer: 2000,
                showConfirmButton: false
            });
            loadMembers();
        } else {
            throw new Error(data.error || 'Failed to award CPD points');
        }
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}

// Update License
function openUpdateLicenseModal(memberId, memberName) {
    document.getElementById('licenseMemberId').value = memberId;
    document.getElementById('licenseMemberName').textContent = memberName;
    document.getElementById('licenseNumber').value = '';
    document.getElementById('licenseExpiryDate').value = '';
    document.getElementById('licenseStatus').value = 'active';

    const modal = document.getElementById('updateLicenseModal');
    modal.classList.remove('hidden', 'modal-hidden');
    lucide.createIcons();
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
        const response = await fetch(`http://localhost:8000/index.php?request=api/member/${memberId}/license`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updates)
        });

        const data = await response.json();

        if (response.ok) {
            closeModal('updateLicenseModal');
            await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: data.message,
                timer: 2000,
                showConfirmButton: false
            });
            loadMembers();
        } else {
            throw new Error(data.error || 'Failed to update license');
        }
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
}
