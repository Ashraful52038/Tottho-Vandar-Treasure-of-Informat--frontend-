export interface FaqItem {
  key: string;
  label: string;
  children: string;
}

export const SETTINGS_FAQ_ITEMS: FaqItem[] = [
  {
    key: '1',
    label: 'How do I change my password?',
    children: 'Go to the "Change Password" tab, enter your current password and your new password, then click "Update Password".'
  },
  {
    key: '2',
    label: 'What if I forgot my current password?',
    children: 'If you forgot your password, use the "Forgot Password?" tab. Enter your email and we\'ll send you a reset link.'
  },
  {
    key: '3',
    label: 'How long is the reset link valid?',
    children: 'The password reset link expires in 1 hour for security reasons. If it expires, you can request a new one.'
  },
  {
    key: '4',
    label: 'Why do I need to enter my current password to change it?',
    children: 'Requiring your current password prevents unauthorized changes. It ensures only you can modify your password.'
  },
  {
    key: '5',
    label: 'Can I use a password I used before?',
    children: 'No, you can not. For security, we recommend using a completely new password that you haven\'t used recently. This helps protect your account.'
  },
  {
    key: '6',
    label: 'What makes a strong password?',
    children: 'A strong password is at least 8 characters long and includes a mix of uppercase and lowercase letters, numbers, and symbols.'
  }
];
