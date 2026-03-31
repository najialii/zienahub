import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// Root Layout MUST contain html and body tags
export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}