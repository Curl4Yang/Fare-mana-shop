// Supabase Edge Function — notify-new-review
// ============================================================
// Déclenchée par un Database Webhook Supabase sur INSERT dans
// public.reviews. Envoie un e-mail de notification à Soraya à
// chaque nouvel avis PUBLIÉ automatiquement (aucune approbation
// préalable : l'e-mail n'est qu'une notification informative).
//
// Cette fonction tourne côté serveur (Supabase), jamais dans le
// navigateur : la clé de l'API d'envoi d'e-mail n'est donc jamais
// exposée dans le frontend ni commitée sur GitHub — elle vit
// uniquement dans les "secrets" du projet Supabase (voir
// SUPABASE-SETUP.md, section "Notification e-mail").
// ============================================================

// @ts-ignore — Deno est fourni par l'environnement d'exécution Supabase
Deno.serve(async (req: Request) => {
  try {
    const payload = await req.json();

    // Un Database Webhook Supabase envoie { type, table, record, ... }
    // "record" contient la ligne qui vient d'être insérée.
    const review = payload?.record;
    if (!review) {
      return new Response(JSON.stringify({ ok: false, error: "no record in payload" }), { status: 400 });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const NOTIFY_TO = Deno.env.get("NOTIFY_TO_EMAIL") || "faremana44@gmail.com";
    if (!RESEND_API_KEY) {
      // Configuration manquante côté serveur : on log l'erreur mais on
      // ne fait jamais échouer l'insertion elle-même (le webhook ne doit
      // jamais empêcher la publication de l'avis).
      console.error("RESEND_API_KEY manquant dans les secrets de la fonction.");
      return new Response(JSON.stringify({ ok: false, error: "email not configured" }), { status: 200 });
    }

    const destinationLabel = review.destination === "bora" ? "Bora Bora" : "Marseille & environs";
    const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
    const dateStr = new Date(review.created_at).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

    // Échappement HTML basique : on ne fait jamais confiance au contenu
    // saisi par un visiteur avant de l'insérer dans l'e-mail HTML.
    const esc = (s: unknown) =>
      String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

    const html = `
      <div style="font-family:Georgia,serif;color:#17301f;max-width:520px;margin:0 auto;">
        <p style="color:#ac7c3c;letter-spacing:.08em;text-transform:uppercase;font-size:12px;">Fare Mana — Nouvel avis publié</p>
        <h2 style="margin:6px 0 18px;">Un nouvel avis vient d'être publié</h2>
        <p style="color:#ac7c3c;font-size:18px;letter-spacing:2px;">${stars}</p>
        <p style="font-style:italic;">“${esc(review.review_text)}”</p>
        <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
          <tr><td style="padding:4px 0;color:#6b6459;">Prénom</td><td style="padding:4px 0;">${esc(review.first_name)}</td></tr>
          <tr><td style="padding:4px 0;color:#6b6459;">Destination</td><td style="padding:4px 0;">${esc(destinationLabel)}</td></tr>
          <tr><td style="padding:4px 0;color:#6b6459;">Soin</td><td style="padding:4px 0;">${esc(review.treatment || "Non précisé")}</td></tr>
          <tr><td style="padding:4px 0;color:#6b6459;">Date</td><td style="padding:4px 0;">${esc(dateStr)}</td></tr>
          <tr><td style="padding:4px 0;color:#6b6459;">E-mail du client (privé)</td><td style="padding:4px 0;">${esc(review.email_private)}</td></tr>
        </table>
        <p style="margin:26px 0;">
          <a href="https://faremana.com/admin.html"
             style="background:#17301f;color:#f7f1e6;text-decoration:none;padding:12px 22px;border-radius:100px;display:inline-block;">
            Gérer cet avis
          </a>
        </p>
        <p style="font-size:12px;color:#6b6459;">
          Cet avis est déjà publié automatiquement sur le site. Ce message est
          uniquement une notification — vous pouvez le supprimer depuis
          l'espace d'administration s'il n'est pas approprié.
        </p>
      </div>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Domaine d'expédition par défaut fourni par Resend en attendant
        // une vérification de domaine (voir SUPABASE-SETUP.md).
        from: Deno.env.get("NOTIFY_FROM_EMAIL") || "Fare Mana <onboarding@resend.dev>",
        to: [NOTIFY_TO],
        subject: `Nouvel avis Fare Mana — ${destinationLabel} (${review.rating}/5)`,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Échec de l'envoi Resend:", errText);
      return new Response(JSON.stringify({ ok: false, error: errText }), { status: 200 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error("Erreur inattendue dans notify-new-review:", err);
    // On répond toujours 200 : cette fonction ne doit jamais faire
    // échouer l'insertion de l'avis, seulement tenter la notification.
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 200 });
  }
});
