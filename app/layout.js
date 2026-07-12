import './globals.css';
import Particles from '../components/Particles';

export const metadata = {
  metadataBase: new URL('https://natsu-time-capsule.vercel.app'),
  title: '夏のタイムカプセル Letter',
  description: '1年後の自分への手紙を、デジタルのタイムカプセルに。Luna One-Man Live「夏のタイムカプセル」',
  // 検索エンジンにインデックスさせない（URLを知る人だけがアクセスできる状態にする）
  robots: { index: false, follow: false },
  openGraph: {
    title: '夏のタイムカプセル Letter',
    description: '1年後の自分への手紙を、デジタルのタイムカプセルに。',
    type: 'website',
    images: ['/og.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '夏のタイムカプセル Letter',
    description: '1年後の自分への手紙を、デジタルのタイムカプセルに。',
    images: ['/og.jpg'],
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
