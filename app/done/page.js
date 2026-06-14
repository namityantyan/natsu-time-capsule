import Countdown from '../../components/Countdown';

export const metadata = { title: '保存しました — 夏のタイムカプセル' };

export default function DonePage() {
  return (
    <div className="center-page">
      <div className="panel">
        <div className="icon">✉️</div>
        <h2 style={{ marginTop: 14 }}>タイムカプセルに保存されました</h2>
        <p className="muted small" style={{ marginTop: 10 }}>
          あなたの手紙は静かに眠りにつきました。<br />
          2027年9月12日、もう一度ここで会いましょう。
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
