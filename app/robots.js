// 検索エンジンのクローラに全ページのクロールを禁止する（公開前の検索除け）
export default function robots() {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  };
}
