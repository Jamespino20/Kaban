import Link from "next/link";

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      {/* Agapay Branding */}
      <div className="mb-8">
        <img
          src="/images/agapay_titled.png"
          alt="Agapay Logo"
          className="h-12 w-auto"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Iyong Agapay, Ating Tagumpay
        </p>
      </div>

      {/* 404 Message */}
      <h1 className="text-3xl font-bold mb-4 text-primary">
        404 – Page not found
      </h1>
      <p className="mb-6 max-w-xl text-muted-foreground">
        Sorry, we couldn’t find the page you’re looking for.
      </p>

      {/* Action Button */}
      <Link
        href="/"
        className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
      >
        Go to Homepage
      </Link>
    </div>
  );
}