// Đường dẫn: src/styles/authStyles.js

export const authStyles = {
  // Container & Layout
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '480px',
    padding: '40px'
  },

  cardSmall: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    width: '100%',
    maxWidth: '420px',
    padding: '40px'
  },

  // Header
  header: {
    textAlign: 'center',
    marginBottom: '32px'
  },

  logo: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '50%',
    padding: '12px',
    marginBottom: '16px'
  },

  logoIcon: {
    width: '32px',
    height: '32px'
  },

  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px'
  },

  subtitle: {
    color: '#6b7280',
    fontSize: '14px'
  },

  // Alert Boxes
  successBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '24px'
  },

  successIcon: {
    color: '#16a34a',
    width: '20px',
    height: '20px',
    flexShrink: 0,
    marginTop: '2px'
  },

  successText: {
    color: '#166534',
    fontSize: '14px',
    margin: 0
  },

  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px'
  },

  errorBoxFlex: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px'
  },

  errorContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },

  errorIcon: {
    color: '#dc2626',
    width: '20px',
    height: '20px',
    flexShrink: 0,
    marginTop: '2px'
  },

  errorTitle: {
    color: '#991b1b',
    fontWeight: '500',
    fontSize: '14px',
    marginBottom: '4px'
  },

  errorText: {
    color: '#991b1b',
    fontSize: '14px',
    margin: 0
  },

  errorList: {
    color: '#b91c1c',
    fontSize: '14px',
    paddingLeft: '20px',
    margin: 0
  },

  // Form
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },

  nameRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },

  field: {
    display: 'flex',
    flexDirection: 'column'
  },

  fieldHalf: {
    display: 'flex',
    flexDirection: 'column'
  },

  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },

  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },

  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#9ca3af',
    width: '20px',
    height: '20px',
    pointerEvents: 'none'
  },

  input: {
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit'
  },

  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Buttons
  submitButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: '600',
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
    marginTop: '8px'
  },

  submitButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },

  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },

  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
    fontSize: '20px'
  },

  // Links
  forgotPasswordContainer: {
    textAlign: 'right',
    marginTop: '-8px'
  },

  forgotPasswordLink: {
    color: '#764ba2',
    fontSize: '13px',
    textDecoration: 'none',
    fontWeight: '500'
  },

  footer: {
    marginTop: '24px',
    textAlign: 'center'
  },

  footerText: {
    color: '#6b7280',
    fontSize: '14px',
    margin: 0
  },

  footerLink: {
    color: '#764ba2',
    fontWeight: '600',
    textDecoration: 'none'
  }
};