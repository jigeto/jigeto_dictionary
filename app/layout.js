export const metadata = {
  title: "Jigeto Dictionary",
  description: "Your personal English-Bulgarian vocabulary",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
