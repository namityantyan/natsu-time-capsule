import { isRevealed } from '../../lib/config';
import LettersClient from '../../components/LettersClient';

// 開封状態は環境変数で決まるため、リクエストごとにサーバー側で判定してクライアントへ渡す。
export const dynamic = 'force-dynamic';

export default function LettersPage() {
  const revealed = isRevealed();
  const preview = !revealed && process.env.PREVIEW_LETTERS === 'true';
  return <LettersClient initialRevealed={revealed} initialPreview={preview} />;
}
