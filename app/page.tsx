'use client'
import dynamic from 'next/dynamic'

// Dynamically import the component with no SSR to avoid hydration issues
const CryptoChartViewer = dynamic(
  () => import('./components/CryptoChartViewer'),
  { ssr: false }
)

export default function Home() {
  return (
    <main>
      <CryptoChartViewer />
    </main>
  )
}