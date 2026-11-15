// Business details shown across the website. Change them here only.
export const BRAND_NAME = "Halifax Accessible, Mobility, and Airport Transfers";
export const TAGLINE = "Special Service for Special People";

// Name of the hourly option where the driver helps and stays with the passenger. Also set in server/src/config/pricing.ts.
export const ASSISTANCE_NAME = "Personal Assistance";

// Contact details. Phone and WhatsApp are from the owner's other websites: please confirm them.
export const PHONE_DISPLAY = "902-441-2015";
export const PHONE_LINK = "+19024412015";      // used for tap-to-call and text links
export const WHATSAPP_NUMBER = "19024412015";  // country code + number, no spaces or "+"
export const EMAIL = "Accessibleridehhfx@gmail.com";        // main email customers write to
export const SUPPORT_EMAIL = "Customersupporthfx@gmail.com"; // customer support: CC on the email button, and listed in the footer
export const ETRANSFER_EMAIL = "halifaxhds2021@gmail.com"; // TODO: the email that receives Interac e-Transfers

// Ready-made links for the contact buttons.
export const CONTACT_LINKS = {
  call: `tel:${PHONE_LINK}`,
  text: `sms:${PHONE_LINK}`,
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
  // Opens a new email to the main address with customer support in CC.
  // encodeURIComponent turns "@" into "%40", the standard way to write an address after "?cc=".
  email: `mailto:${EMAIL}?cc=${encodeURIComponent(SUPPORT_EMAIL)}`,
  supportEmail: `mailto:${SUPPORT_EMAIL}`,
};