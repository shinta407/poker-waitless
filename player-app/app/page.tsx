import { redirect } from 'next/navigation'

export default function HomePage() {
  // サーバーサイドリダイレクト（より確実）
  redirect('/map')
}
