// app/(auth)/login/icon.jsx

export const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

export const LockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.8}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

export const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
    <path
      fill="#EA4335"
      d={
        "M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.08-6.08C34.38 3.09 29.47 1 24 1 14.82 1 7.07 6.48 3.64 14.22l7.08 5.5C12.44 13.72 17.74 9.5 24 9.5z"
      }
    />
    <path
      fill="#4285F4"
      d={
        "M46.5 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.67c-.55 2.96-2.2 5.47-4.67 7.16l7.19 5.58C43.12 37.5 46.5 31.44 46.5 24.5z"
      }
    />
    <path
      fill="#FBBC05"
      d={
        "M10.72 28.28A14.56 14.56 0 019.5 24c0-1.49.26-2.93.72-4.28l-7.08-5.5A23.94 23.94 0 001 24c0 3.86.92 7.5 2.55 10.73l7.17-6.45z"
      }
    />
    <path
      fill="#34A853"
      d={
        "M24 47c5.47 0 10.06-1.81 13.41-4.91l-7.19-5.58c-1.88 1.26-4.28 2-6.22 2-6.26 0-11.56-4.22-13.28-9.93l-7.17 6.45C7.07 41.52 14.82 47 24 47z"
      }
    />
  </svg>
);

// ADD DEFAULT EXPORT - This is required for the route icon
const LoginIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" x2="3" y1="12" y2="12" />
  </svg>
);

export default LoginIcon;