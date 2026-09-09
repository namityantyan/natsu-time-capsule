import { isSubmissionsOpen } from '../lib/config';
import SubmitClient from '../components/SubmitClient';

// 受付中かどうかは期限・環境変数で決まるため、リクエストごとにサーバー側で判定して渡す。
export const dynamic = 'force-dynamic';

export default function SubmitPage() {
  return <SubmitClient submissionsOpen={isSubmissionsOpen()} />;
}
