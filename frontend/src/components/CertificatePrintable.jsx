import React from 'react';

/**
 * Pure HTML/CSS Certificate Component for Export
 * NO TAILWIND CLASSES - Only inline styles with standard CSS
 */
const CertificatePrintable = React.forwardRef(({ member, branding }, ref) => {
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div ref={ref} style={{
            width: '794px',
            height: '1123px',
            backgroundColor: '#ffffff',
            position: 'relative',
            padding: '64px',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: '"Merriweather", serif'
        }}>
            {/* Outer Border - Thick Green */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                border: '16px solid #016938',
                pointerEvents: 'none'
            }}></div>

            {/* Inner Border - Thin Green */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                right: '20px',
                bottom: '20px',
                border: '2px solid #016938',
                pointerEvents: 'none'
            }}></div>

            {/* Corner Ornaments */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', width: '64px', height: '64px', borderTop: '4px solid #E11D48', borderLeft: '4px solid #E11D48', zIndex: 20 }}></div>
            <div style={{ position: 'absolute', top: '20px', right: '20px', width: '64px', height: '64px', borderTop: '4px solid #E11D48', borderRight: '4px solid #E11D48', zIndex: 20 }}></div>
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '64px', height: '64px', borderBottom: '4px solid #E11D48', borderLeft: '4px solid #E11D48', zIndex: 20 }}></div>
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '64px', height: '64px', borderBottom: '4px solid #E11D48', borderRight: '4px solid #E11D48', zIndex: 20 }}></div>

            {/* Content Container */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '32px',
                flex: 1
            }}>
                {/* Logo */}
                <div style={{ marginTop: '40px' }}>
                    {branding?.system_logo ? (
                        <img src={branding.system_logo} alt="Logo" style={{ width: '120px', height: '120px', objectFit: 'contain' }} crossOrigin="anonymous" />
                    ) : (
                        <div style={{
                            width: '120px',
                            height: '120px',
                            backgroundColor: '#d1fae5',
                            borderRadius: '9999px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#065f46',
                            border: '3px solid #10b981'
                        }}>NNAK</div>
                    )}
                </div>

                {/* Association Name */}
                <h1 style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#016938',
                    textAlign: 'center',
                    margin: 0,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                }}>
                    National Nurses Association of Kenya
                </h1>

                {/* Certificate Title */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <h2 style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: '48px',
                        fontWeight: 'bold',
                        color: '#1f2937',
                        margin: 0,
                        marginBottom: '8px',
                        letterSpacing: '0.1em'
                    }}>
                        CERTIFICATE
                    </h2>
                    <p style={{
                        fontSize: '20px',
                        color: '#6b7280',
                        fontStyle: 'italic',
                        margin: 0,
                        letterSpacing: '0.15em'
                    }}>
                        OF MEMBERSHIP
                    </p>
                </div>

                {/* Decorative Line */}
                <div style={{
                    width: '200px',
                    height: '2px',
                    background: 'linear-gradient(to right, transparent, #016938, transparent)',
                    margin: '20px 0'
                }}></div>

                {/* Watermark-like Logo in Background */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.03,
                    width: '500px',
                    height: '500px',
                    zIndex: -1,
                    pointerEvents: 'none'
                }}>
                    {branding?.system_logo && (
                        <img src={branding.system_logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
                    )}
                </div>

                <div style={{
                    textAlign: 'center',
                    maxWidth: '660px',
                    lineHeight: '1.6',
                    fontSize: '18px',
                    color: '#374151',
                    margin: '0 auto'
                }}>
                    <p style={{ margin: '0 0 20px 0', letterSpacing: '0.01em', fontSize: '19px' }}>
                        This{" "}is{" "}to{" "}certify{" "}that
                    </p>

                    <h3 style={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: '42px',
                        fontWeight: 'bold',
                        color: '#016938',
                        margin: '10px 0 25px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderBottom: '2px solid #016938',
                        paddingBottom: '8px',
                        display: 'inline-block',
                        minWidth: '90%'
                    }}>
                        {member?.first_name?.trim()}{" "}{member?.last_name?.trim()}
                    </h3>

                    <p style={{ margin: '25px 0', fontSize: '18px' }}>
                        is{" "}a{" "}registered{" "}member{" "}in{" "}good{" "}standing{" "}of{" "}the{" "}
                        <span style={{ fontWeight: 'bold', color: '#016938' }}>
                            National{" "}Nurses{" "}Association{" "}of{" "}Kenya
                        </span>,{" "}
                        and{" "}is{" "}assigned{" "}the{" "}official{" "}membership{" "}number{" "}
                        <strong style={{ color: '#016938', borderBottom: '1px solid #01693820' }}>
                            {member?.member_id}
                        </strong>.
                    </p>

                    <p style={{
                        margin: '25px 0',
                        fontSize: '17px',
                        fontStyle: 'italic',
                        opacity: 0.95,
                        lineHeight: '1.5'
                    }}>
                        This{" "}certificate{" "}acknowledges{" "}their{" "}unwavering{" "}commitment{" "}to{" "}the{" "}nursing{" "}profession{" "}
                        and{" "}their{" "}tireless{" "}dedication{" "}to{" "}upholding{" "}the{" "}highest{" "}standards{" "}of{" "}patient{" "}care,{" "}
                        clinical{" "}excellence,{" "}and{" "}professional{" "}integrity.
                    </p>
                </div>

                {/* Date and Signatures */}
                <div style={{
                    marginTop: 'auto',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    paddingTop: '60px'
                }}>
                    {/* Date */}
                    <div style={{ textAlign: 'center', minWidth: '200px' }}>
                        <div style={{
                            borderTop: '2px solid #1f2937',
                            paddingTop: '8px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1f2937'
                        }}>
                            {currentDate}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            Date{" "}of{" "}Issue
                        </div>
                    </div>

                    {/* Signature */}
                    <div style={{ textAlign: 'center', minWidth: '250px' }}>
                        <div style={{
                            height: '60px',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            marginBottom: '8px'
                        }}>
                            {branding?.authorised_signature ? (
                                <img
                                    src={branding.authorised_signature}
                                    alt="Signature"
                                    style={{
                                        height: '50px',
                                        objectFit: 'contain',
                                        filter: 'brightness(0) saturate(100%) invert(18%) sepia(87%) saturate(2643%) hue-rotate(224deg) brightness(85%) contrast(106%)'
                                    }}
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <div style={{
                                    fontSize: '24px',
                                    fontStyle: 'italic',
                                    color: '#1e3a8a',
                                    fontFamily: 'cursive'
                                }}>Signature</div>
                            )}
                        </div>
                        <div style={{
                            borderTop: '2px solid #1f2937',
                            paddingTop: '8px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1f2937'
                        }}>
                            Authorized{" "}Signatory
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginTop: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            National{" "}Nurses{" "}Association{" "}of{" "}Kenya
                        </div>
                    </div>
                </div>

                {/* Footer Seal/Badge */}
                <div style={{
                    marginTop: '40px',
                    textAlign: 'center',
                    fontSize: '10px',
                    color: '#9ca3af',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase'
                }}>
                    Voice{" "}of{" "}the{" "}Nursing{" "}Profession
                </div>
            </div>
        </div>
    );
});

CertificatePrintable.displayName = 'CertificatePrintable';

export default CertificatePrintable;
