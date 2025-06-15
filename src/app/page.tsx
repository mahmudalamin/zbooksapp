import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to the client home page
  redirect('/client')
}