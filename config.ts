// Configure your form submission endpoint here.
// Replace with your Google Apps Script Web App URL or any POST endpoint.
export const FORM_ENDPOINT =
  process.env.NEXT_PUBLIC_FORM_ENDPOINT ||
  "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";

export const SITE_CONFIG = {
  name: "Alder Projects",
  tagline: "Thoughtful Renovations for Vermont Homes",
  email: "hello@alderprojects.com",
  address: "Vermont",
  description:
    "Alder Projects connects Vermont homeowners with skilled, vetted craftspeople for renovations done right — on time, on budget, and built to last.",
};
