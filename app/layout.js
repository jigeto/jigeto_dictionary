export const metadata = {
  title: "Jigeto Dictionary",
  description: "My personal English dictionary",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <style>{`input[type='checkbox'] { transform: scale(1.2); }`}</style>
        {children}
      </body>
    </html>
  );
}