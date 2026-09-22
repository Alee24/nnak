import React from 'react';

const CertificatePrintable = React.forwardRef(({ member, branding }, ref) => {
    const fullName = `${member?.first_name || ''} ${member?.last_name || ''}`.trim() || 'MEMBER NAME';
    const memberNo = member?.membership_number || member?.member_id || 'MMS-0000';
    const category = member?.role?.replace(/_/g, ' ').toUpperCase() || 'FULL CHAMPIONSHIP MEMBER';
    const joinDate = member?.join_date || member?.created_at || new Date().toISOString().split('T')[0];

    return (
        <div ref={ref} style={{
            width: '794px',
            height: '1123px',
            backgroundColor: '#ffffff',
            position: 'relative',
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            overflow: 'hidden',
            fontFamily: 'Inter, Georgia, serif',
            border: '16px solid #064e3b'
        }}>
            {/* Inner Gold Border */}
            <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                right: '12px',
                bottom: '12px',
                border: '2px solid #059669',
                pointerEvents: 'none'
            }} />

            {/* Header Crest */}
            <div style={{ textTransform: 'center', textAlign: 'center', marginTop: '30px' }}>
                <div style={{
                    width: '70px',
                    height: '70px',
                    margin: '0 auto 16px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: '900',
                    fontSize: '24px',
                    boxShadow: '0 10px 15px -3px rgba(5,150,105,0.4)'
                }}>
                    MMS
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#064e3b', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 }}>
                    MMS GOLF & COUNTRY CLUB
                </h1>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#059669', letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: '6px' }}>
                    Championship Estate & Links • Est. 1987
                </p>
            </div>

            {/* Main Title */}
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <h2 style={{ fontSize: '38px', fontFamily: 'Georgia, serif', fontWeight: '400', color: '#0f172a', fontStyle: 'italic', margin: 0 }}>
                    Certificate of Official Membership
                </h2>
                <div style={{ width: '120px', height: '2px', backgroundColor: '#059669', margin: '16px auto 0' }} />
            </div>

            {/* Body Text */}
            <div style={{ textAlign: 'center', padding: '0 40px', spaceY: '20px' }}>
                <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 16px' }}>
                    This is to certify that
                </p>
                <div style={{ fontSize: '36px', fontWeight: '900', color: '#064e3b', textTransform: 'uppercase', letterSpacing: '0.02em', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', display: 'inline-block', minWidth: '400px' }}>
                    {fullName}
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.8', maxWidth: '580px', margin: '24px auto 0', fontWeight: '500' }}>
                    Is a duly registered and active member in good standing of MMS Golf Club, entitled to full golfing rights, World Handicap System (WHS) index tracking, and all privileges of the clubhouse.
                </p>

                <div style={{ display: 'flex', justifyCenter: 'center', justifyContent: 'center', gap: '40px', marginTop: '30px' }}>
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Membership Number</span>
                        <span style={{ fontSize: '16px', fontWeight: '900', color: '#059669', fontFamily: 'monospace' }}>{memberNo}</span>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Membership Category</span>
                        <span style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{category}</span>
                    </div>
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 24px', borderRadius: '12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block' }}>Date of Admission</span>
                        <span style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>{joinDate}</span>
                    </div>
                </div>
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 40px', marginBottom: '30px' }}>
                <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '4px', marginBottom: '6px', fontWeight: '900', fontSize: '14px', color: '#0f172a' }}>
                        General Manager
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Club Executive Committee</span>
                </div>

                <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    border: '3px double #059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '900',
                    color: '#059669',
                    textAlign: 'center',
                    textTransform: 'uppercase'
                }}>
                    OFFICIAL<br/>SEAL
                </div>

                <div style={{ textAlign: 'center', width: '200px' }}>
                    <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '4px', marginBottom: '6px', fontWeight: '900', fontSize: '14px', color: '#0f172a' }}>
                        Club Captain
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>PGA Golf Committee</span>
                </div>
            </div>
        </div>
    );
});

CertificatePrintable.displayName = 'CertificatePrintable';

export default CertificatePrintable;
