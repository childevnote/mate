import './globals.css'

export const metadata = {
  title: 'Mate',
  description: '대학생활의 모든 것, mate와 함께',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}