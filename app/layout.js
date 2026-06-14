import './globals.css';
import Particles from '../components/Particles';

export const metadata = {
  title: '夏のタイムカプセル Letter',
  description: '1年後の自分への手紙を、デジタルのタイムカプセルに。Luna One-Man Live「夏のタイムカプセル」',
  openGraph: {
    title: '夏のタイムカプセル Letter',
    description: '1年後の自分への手紙を、デジタルのタイムカプセルに。',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#080b18',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <Particles />
        <main>{children}</main>
        <footer>Luna — 夏のタイムカプセル</footer>
      </body>
    </html>
  );
}
