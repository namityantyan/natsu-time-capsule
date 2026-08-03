import Countdown from '../../components/Countdown';
import { getCopy } from '../../lib/copy';

export const metadata = { title: '保存しました — 夏のタイムカプセル' };

export default async function DonePage() {
  const copy = await getCopy();
  return (
    <div className="center-page">
      <div className="panel">
        <div className="icon">✉️</div>
        <h2 style={{ marginTop: 14 }}>{copy.done_heading}</h2>
        <p className="muted small" style={{ marginTop: 10, whiteSpace: 'pre-line' }}>
          {copy.done_body}
        </p>
        <Countdown />
        <div className="btn-row">
          <a className="btn btn-ghost" href="/">もう1通書く</a>
          <a className="btn" href="/letters">公開ページを見る</a>
        </div>
      </div>
    </div>
  );
}
