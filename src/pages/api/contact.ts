import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, email, subject, message } = data;

    // 1. Simple Server-Side Input Validation
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address format." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Production Integration Reference (Placeholder)
    // To send emails using Cloudflare in production, you can tie env variables to services:
    // e.g., Resend, Mailgun, SendGrid:
    // const apiKey = env.RESEND_API_KEY;
    // await fetch("https://api.resend.com/emails", { ... });

    // For now, we simulate a database save or success email delivery trigger
    console.log(`Received contact form submission from ${name} (${email}): [${subject}] - ${message}`);

    // Return success response to the client
    return new Response(
      JSON.stringify({ 
        message: "Thank you! Your message has been received. I will get back to you shortly." 
      }),
      { 
        status: 200, 
        headers: { 
          "Content-Type": "application/json",
          // Add basic security headers
          "X-Content-Type-Options": "nosniff"
        } 
      }
    );
  } catch (error) {
    console.error("Error handling contact form submission:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Handle options requests (pre-flight checks if invoked cross-origin)
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
};
