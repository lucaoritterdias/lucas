import { PROFILE } from "../../data";
import { IconGithub, IconInstagram, IconLinkedin, IconWhatsapp } from "../icons";

/** The profiles, as stickers on the home desk and as links in the menu drawer. */
export const SOCIALS = [
  { name: "WhatsApp", href: PROFILE.whatsapp, icon: <IconWhatsapp />, color: "#25d366", shape: "round" },
  { name: "LinkedIn", href: PROFILE.linkedin, icon: <IconLinkedin />, color: "#0a66c2", shape: "square" },
  { name: "GitHub", href: PROFILE.github, icon: <IconGithub />, color: "#24292f", shape: "round" },
  { name: "Instagram", href: PROFILE.instagram, icon: <IconInstagram />, color: "#e1306c", shape: "square" },
];
