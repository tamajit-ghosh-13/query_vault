import './globals.css';
import { StoreProvider } from '@/context/StoreContext';

export const metadata = {
  title: 'Agrumea Farm — Dispensa Siciliana',
  description: 'Interactive Sicilian Pantry & Preserves E-Commerce Showcase built with Next.js, React, Three.js, GSAP, and Matter.js'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
