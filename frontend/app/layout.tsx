import { ReactNode } from 'react';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html className={cn("font-sans", geist.variable)}>
      <body>
        {children}
      </body>
    </html>
  );
}
