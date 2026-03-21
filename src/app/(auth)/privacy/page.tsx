export default function PrivacyPage() {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: March 21, 2026</p>

      <h2>What We Collect</h2>
      <p>When you sign up, we collect your email address and password (hashed). When you use Tracker, we store the entries, tracker types, and images you create.</p>

      <h2>How We Use It</h2>
      <p>Your data is used solely to provide the Tracker service. We don't analyze, sell, or share your data with third parties.</p>

      <h2>Where Your Data Lives</h2>
      <p>Your data is stored on Supabase (database) and Cloudflare R2 (images). Both are reputable cloud providers with strong security practices.</p>

      <h2>Data Export & Deletion</h2>
      <p>You can export your entries as JSON from any tracker page. To delete your account and all associated data, contact us.</p>

      <h2>Cookies</h2>
      <p>We use essential cookies for authentication. No tracking or analytics cookies are used.</p>

      <h2>Contact</h2>
      <p>Questions about privacy? Reach out via the About page.</p>
    </div>
  );
}
