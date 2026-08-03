import './globals.css';
import Particles from '../components/Particles';
import { CopyProvider } from '../components/CopyProvider';
import { getCopy } from '../lib/copy';

export const metadata = {
  metadataBase: new URL('https://timecapsule.ast-luna.com'),
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

export default async function RootLayout({ children }) {
  const copy = await getCopy();
  return (
    <html lang="ja">
      <body>
        <Particles />
        <CopyProvider value={copy}>
          <main>{children}</main>
        </CopyProvider>
        <footer>Luna — 夏のタイムカプセル</footer>
      </body>
    </html>
  );
}
