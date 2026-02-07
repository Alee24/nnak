import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

/**
 * Pure HTML/CSS ID Card Component for Export
 * NO TAILWIND CLASSES - Only inline styles with standard CSS
 */
const IDCardPrintable = React.forwardRef(({ member, branding }, ref) => {
    return (
        <div ref={ref} style={{
            position: 'relative',
            width: '480px',
            height: '300px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden',
            boxShadow: 'none',
            background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6, #e5e7eb)',
            border: '1px solid #d1d5db'
        }}>

            {/* Top Red Header Bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100%',
                height: '85px',
                zIndex: 2,
                paddingLeft: '100px',
                paddingRight: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-end',
                background: 'linear-gradient(to bottom, #dc2626, #b91c1c)',
                borderBottom: '2px solid #991b1b'
            }}>
                <h1 style={{
                    fontSize: '15px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    textAlign: 'right',
                    lineHeight: 1.1,
                    margin: 0,
                    maxWidth: '300px'
                }}>
                    National Nurses Association of Kenya
                </h1>
                <p style={{
                    fontSize: '10px',
                    color: '#fca5a5',
                    fontStyle: 'italic',
                    textAlign: 'right',
                    marginTop: '2px',
                    marginBottom: 0
                }}>
                    Voice of the{" "}Nursing Profession
                </p>
                <div style={{
                    width: '60%',
                    height: '1px',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    margin: '3px 0'
                }}></div>
                <p style={{
                    fontSize: '8px',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    textAlign: 'right',
                    margin: 0,
                    opacity: 0.9
                }}>
                    MEMBER OF THE INTERNATIONAL COUNCIL OF NURSES
                </p>
                <p style={{
                    fontSize: '9px',
                    fontWeight: '900',
                    color: '#ffe4e6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    textAlign: 'right',
                    marginTop: '1px',
                    marginBottom: 0
                }}>
                    MEMBERSHIP CARD
                </p>
            </div>

            {/* Logo Container - Overhanging */}
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '20px',
                zIndex: 10,
                width: '90px',
                height: '100px',
                backgroundColor: '#ffffff',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px',
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                border: '1px solid #e5e7eb'
            }}>
                {branding?.system_logo ? (
                    <img src={branding.system_logo} alt="Logo" style={{ width: '75px', height: '75px', objectFit: 'contain' }} crossOrigin="anonymous" />
                ) : (
                    <div style={{
                        width: '70px',
                        height: '70px',
                        backgroundColor: '#d1fae5',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#065f46',
                        border: '2px solid #10b981'
                    }}>NNAK</div>
                )}
            </div>

            {/* Left Red Vertical Line */}
            <div style={{
                position: 'absolute',
                top: '100px',
                left: 0,
                width: '12px',
                height: '140px',
                backgroundColor: '#dc2626',
                borderTopRightRadius: '12px',
                borderBottomRightRadius: '12px',
                zIndex: 1
            }}></div>

            {/* Main Content Container */}
            <div style={{
                position: 'absolute',
                top: '85px',
                left: 0,
                width: '100%',
                height: '215px',
                display: 'flex',
                padding: '16px 20px',
                zIndex: 5
            }}>

                {/* Left Side: Details & Signature */}
                <div style={{
                    flex: 1,
                    paddingLeft: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ marginTop: '0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {/* Vertical stack of rows with horizontal label/value */}
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '800', minWidth: '70px' }}>Name:</span>
                            <span style={{ fontSize: '14px', fontWeight: '900', color: '#111827', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                {member?.first_name?.trim()} {member?.last_name?.trim()}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 'bold', minWidth: '70px' }}>ID No:</span>
                            <span style={{ fontSize: '14px', fontWeight: '900', color: '#111827' }}>{member?.id_number}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 'bold', minWidth: '70px' }}>Member No:</span>
                            <span style={{ fontSize: '14px', fontWeight: '900', color: '#111827' }}>{member?.member_id?.replace('NNAK', '')}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '6px' }}>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: '#6b7280', fontWeight: 'bold', minWidth: '70px' }}>Valid Till:</span>
                            <span style={{ fontSize: '14px', fontWeight: '900', color: '#111827' }}>31/12/2027</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingBottom: '4px' }}>
                        <div style={{ padding: '3px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '4px', flexShrink: 0 }}>
                            <QRCodeCanvas
                                value={`https://members.nnak.or.ke/verify/${member?.member_id}`}
                                size={48}
                                level="M"
                                includeMargin={false}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ height: '30px', display: 'flex', alignItems: 'flex-end', borderBottom: '1px solid #d1d5db', minWidth: '110px' }}>
                                {branding?.authorised_signature && (
                                    <img src={branding.authorised_signature} alt="Sign" style={{ height: '38px', objectFit: 'contain' }} crossOrigin="anonymous" />
                                )}
                            </div>
                            <span style={{ fontSize: '8px', color: '#6b7280', fontWeight: 'bold', marginTop: '4px', textTransform: 'uppercase' }}>Authorized Signature</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Photo with Red Frame */}
                <div style={{
                    width: '140px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: '8px'
                }}>
                    <div style={{
                        width: '120px',
                        height: '140px',
                        background: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
                        padding: '6px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            border: '3px solid #e5e7eb',
                            backgroundColor: '#ffffff',
                            overflow: 'hidden',
                            position: 'relative'
                        }}>
                            {member?.profile_picture ? (
                                <img src={member.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', color: '#d1d5db', fontSize: '48px' }}>
                                    👤
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

IDCardPrintable.displayName = 'IDCardPrintable';

export default IDCardPrintable;
