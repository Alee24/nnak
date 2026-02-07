import React from 'react';
import { toTitleCase } from '../utils/formatters';

/**
 * Senior UI/UX Architectural Certificate Component
 * Optimized for high-fidelity PDF export
 * Zero-overlap Flexbox architecture
 */
const CertificatePrintable = React.forwardRef(({ member, branding }, ref) => {
    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Authority Design System
    const brandGreen = '#006400';
    const brandCrimson = '#E11D48';
    const bodyText = '#333333';
    const labelText = '#64748b';
    const serifFont = 'Cambria, Georgia, serif';
    const sansFont = 'Cambria, Georgia, serif';

    return (
        <div ref={ref} style={{
            width: '794px',
            height: '1123px',
            backgroundColor: '#ffffff',
            position: 'relative',
            padding: '60px 80px',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            overflow: 'hidden',
            fontFamily: sansFont
        }}>
            {/* 1. Architectural Frame System - BORDERS REMOVED AS REQUESTED */}


            {/* Visual Corner Anchors */}
            <div style={{ position: 'absolute', top: '32px', left: '32px', width: '80px', height: '80px', borderTop: `6px solid ${brandCrimson}`, borderLeft: `6px solid ${brandCrimson}`, zIndex: 10 }}></div>
            <div style={{ position: 'absolute', top: '32px', right: '32px', width: '80px', height: '80px', borderTop: `6px solid ${brandCrimson}`, borderRight: `6px solid ${brandCrimson}`, zIndex: 10 }}></div>
            <div style={{ position: 'absolute', bottom: '32px', left: '32px', width: '80px', height: '80px', borderBottom: `6px solid ${brandCrimson}`, borderLeft: `6px solid ${brandCrimson}`, zIndex: 10 }}></div>
            <div style={{ position: 'absolute', bottom: '32px', right: '32px', width: '80px', height: '80px', borderBottom: `6px solid ${brandCrimson}`, borderRight: `6px solid ${brandCrimson}`, zIndex: 10 }}></div>

            {/* 2. Content Stack */}
            <div style={{
                position: 'relative',
                zIndex: 20,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>

                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '40px' }}>
                    {branding?.system_logo ? (
                        <img src={branding.system_logo} alt="NNAK Logo" style={{ display: 'block', margin: '0 auto 24px auto', height: '120px', width: 'auto' }} crossOrigin="anonymous" />
                    ) : (
                        <div style={{ width: '100px', height: '100px', borderRadius: '50px', backgroundColor: brandGreen, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px', fontWeight: 'bold', margin: '0 auto 20px auto' }}>NNAK</div>
                    )}

                    <h1 style={{
                        fontFamily: serifFont,
                        fontSize: '36px',
                        fontWeight: '900',
                        color: brandGreen,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        margin: '0 0 8px 0',
                        lineHeight: '1.2'
                    }}>
                        {branding?.association_name || 'National Nurses Association of Kenya'}
                    </h1>
                    <p style={{
                        color: brandCrimson,
                        fontSize: '16px',
                        fontWeight: '700',
                        fontStyle: 'italic',
                        letterSpacing: '0.2em',
                        margin: 0
                    }}>
                        "{branding?.association_tagline || 'Advancing the Nursing Profession Through Excellence'}"
                    </p>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                    <h2 style={{
                        fontFamily: serifFont,
                        fontSize: '48px',
                        fontWeight: '400',
                        color: '#1a1a1a',
                        margin: 0,
                        lineHeight: '1'
                    }}>
                        Certificate of Membership
                    </h2>
                </div>

                {/* Recipient Section */}
                <div style={{ textAlign: 'center', width: '100%', marginBottom: '50px' }}>
                    <p style={{
                        fontFamily: sansFont,
                        fontSize: '14px',
                        fontWeight: '800',
                        color: labelText,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5em',
                        marginBottom: '30px'
                    }}>
                        THIS IS TO CERTIFY THAT
                    </p>

                    <h3 style={{
                        fontFamily: serifFont,
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: brandGreen,
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        margin: '0 auto 20px auto',
                        borderBottom: `1px solid #e2e8f0`,
                        paddingBottom: '10px',
                        display: 'inline-block',
                        minWidth: '85%'
                    }}>
                        {toTitleCase(member?.first_name)} {toTitleCase(member?.last_name)}
                    </h3>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '60px',
                        marginTop: '10px',
                        fontFamily: sansFont,
                        fontSize: '13px',
                        fontWeight: '800',
                        color: '#1a1a1a',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em'
                    }}>
                        <span>MEMBER NO: <span style={{ color: brandGreen, fontWeight: '900' }}>{member?.member_id || 'PENDING'}</span></span>
                        <span>LICENSE NO: <span style={{ color: brandGreen, fontWeight: '900' }}>{member?.registration_number || member?.license_number || 'REQUIRED'}</span></span>
                    </div>
                </div>

                {/* Declaration Paragraph - FIXED CONCATENATION */}
                <div style={{
                    textAlign: 'center',
                    maxWidth: '660px',
                    margin: '0 auto 60px auto',
                    lineHeight: '1.6',
                    fontSize: '18px',
                    color: bodyText,
                    fontFamily: sansFont
                }}>
                    Has been duly registered as a member in good standing of the National Nurses Association of Kenya, committed to upholding excellence in nursing practice
                </div>

                {/* Footer Section - FLEXBOX ARCHITECTURE */}
                <div style={{
                    marginTop: 'auto',
                    width: '100%',
                    paddingBottom: '60px'
                }}>
                    {/* Top Row: Date & Signature */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: '40px',
                        padding: '0 20px'
                    }}>
                        {/* Date Left-Aligned */}
                        <div style={{ textAlign: 'left', minWidth: '220px' }}>
                            <div style={{ fontSize: '12px', color: labelText, textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.1em', marginBottom: '6px' }}>Date of Issue</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a1a' }}>{currentDate}</div>
                        </div>

                        {/* Signature Right-Aligned */}
                        <div style={{ textAlign: 'right', minWidth: '280px' }}>
                            <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '5px' }}>
                                {branding?.authorised_signature ? (
                                    <img src={branding.authorised_signature} alt="Signature" style={{ maxHeight: '50px', width: 'auto' }} crossOrigin="anonymous" />
                                ) : (
                                    <div style={{ height: '1px', width: '200px', backgroundColor: '#cbd5e1' }}></div>
                                )}
                            </div>
                            <div style={{ height: '2px', width: '260px', backgroundColor: '#1a1a1a', marginLeft: 'auto', marginBottom: '10px' }}></div>
                            <div style={{ fontSize: '14px', fontWeight: '900', color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>National Executive Chairman</div>
                            <div style={{ fontSize: '12px', color: labelText, fontWeight: '700', textTransform: 'uppercase', marginTop: '4px' }}>National Nurses Association of Kenya</div>
                        </div>
                    </div>

                    {/* Bottom Row: Status & Verification Center-Aligned */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            backgroundColor: `${brandGreen}10`,
                            color: brandGreen,
                            padding: '6px 20px',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontWeight: '900',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase'
                        }}>
                            Active Member
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: labelText,
                            textTransform: 'uppercase',
                            letterSpacing: '0.3em',
                            fontWeight: 'bold'
                        }}>
                            Verification Portal: https://portal.nnak.or.ke/verify
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

CertificatePrintable.displayName = 'CertificatePrintable';

export default CertificatePrintable;
