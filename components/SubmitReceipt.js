'use client';
import { useEffect, useState } from 'react';

// 投稿直後の「控え」。フォームで入力したニックネームとメールアドレスを表示し、
// 「自分の手紙を見る」で必要になる2点をスクショで残せるようにする。
// 値は送信時に sessionStorage へ保存したもの（URLやサーバーには載せない）。直接 /done を開いた場合は何も出さない。
export default function SubmitReceipt() {
  const [r, setR] = useState(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('natsu-receipt');
      if (raw) setR(JSON.parse(raw));
    } catch {}
  }, []);
  if (!r || !r.nickname || !r.email) return null;
  return (
    <div className="receipt">
      <p className="receipt-title">📸 スクショで保存してください</p>
      <dl className="receipt-rows">
        <div><dt>ニックネーム</dt><dd>{r.nickname}</dd></div>
        <div><dt>メールアドレス</dt><dd>{r.email}</dd></div>
      </dl>
      <p className="receipt-hint">公開ページの「自分の手紙を見る」で、この2つを入力すると自分の手紙を確認できます。</p>
    </div>
  );
}
