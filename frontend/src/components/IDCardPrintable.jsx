import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const IDCardPrintable = React.forwardRef(({ member, branding }, ref) => {
    const photoUrl = member?.profile_picture || member?.profile_photo || member?.profile_image;
    const fullName = `${member?.first_name || ''} ${member?.last_name || ''}`.trim() || 'MEMBER NAME';
    const memberNo = member?.membership_number || member?.member_id || 'MMS-0000';
    const handicap = member?.handicap_index !== undefined ? member.handicap_index : '0.0';
    const role = member?.role?.replace(/_/g, ' ') || 'Full Member';

    return (
        <div ref={ref} style={{
            position: 'relative',
            width: '480px',
            height: '300px',
            borderRadius: '16px',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            overflow: 'hidden',
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%)',
            color: '#ffffff',
            border: '2px solid #059669',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
        }}>
            {/* Top Gold Crest Bar */}
            <div style={{
                height: '65px',
                padding: '0 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.03)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #059669, #047857)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: '14px',
                        color: '#ffffff',
                        border: '1px solid #10b981'
                    }}>
                        MMS
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: '900', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f8fafc' }}>
                            MMS Golf Club
                        </div>
                        <div style={{ fontSize: '8px', fontWeight: '700', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#34d399' }}>
                            Official Gold Privilege Card
                        </div>
                    </div>
                </div>
                <div style={{
                    fontSize: '9px',
                    fontWeight: '900',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#6ee7b7',
                    border: '1px solid rgba(16, 185, 129, 0.4)'
                }}>
                    WHS SANCTIONED
                </div>
            </div>

            {/* Main Card Body */}
            <div style={{ display: 'flex', padding: '16px 20px', gap: '16px', height: '175px' }}>
                {/* Photo frame */}
                <div style={{
                    width: '105px',
                    height: '130px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '2px solid #059669',
                    backgroundColor: '#0f172a',
                    flexShrink: 0,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                }}>
                    {photoUrl ? (
                        <img src={photoUrl} alt="Member" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '36px' }}>
                            👤
                        </div>
                    )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8' }}>
                            MEMBER NAME
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '900', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.01em', marginTop: '1px' }}>
                            {fullName}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                        <div>
                            <div style={{ fontSize: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
                                MEMBER NO
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '900', color: '#34d399', fontFamily: 'monospace' }}>
                                {memberNo}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
                                WHS HANDICAP
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '900', color: '#fbbf24' }}>
                                {handicap}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
                                CATEGORY
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: '800', color: '#f1f5f9', textTransform: 'uppercase' }}>
                                {role}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '8px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
                                EXPIRES
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: '800', color: '#f1f5f9' }}>
                                {member?.membership_expiry_date || '31 DEC 2027'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR Code */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <div style={{ padding: '4px', backgroundColor: '#ffffff', borderRadius: '6px' }}>
                        <QRCodeCanvas
                            value={`https://mms.kkdes.co.ke/verify/${memberNo}`}
                            size={56}
                            level="M"
                        />
                    </div>
                    <span style={{ fontSize: '7px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.1em' }}>SCAN VERIFY</span>
                </div>
            </div>

            {/* Bottom Footer Bar */}
            <div style={{
                height: '35px',
                background: 'rgba(0,0,0,0.4)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 20px',
                fontSize: '8px',
                color: '#94a3b8',
                fontWeight: '700'
            }}>
                <span>MMS GOLF CLUB • CHAMPIONSHIP COURSE</span>
                <span style={{ color: '#34d399' }}>WWW.MMSGOLFCLUB.CO.KE</span>
            </div>
        </div>
    );
});

IDCardPrintable.displayName = 'IDCardPrintable';

export default IDCardPrintable;
