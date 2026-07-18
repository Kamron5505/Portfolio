import {
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaFacebook,
  FaTelegram,
  FaYoutube,
  FaWhatsapp,
  FaDribbble,
  FaBehance,
  FaXTwitter,
} from 'react-icons/fa6';
import { FiGlobe } from 'react-icons/fi';
import type { IconType } from 'react-icons';

const MAP: Record<string, IconType> = {
  linkedin: FaLinkedin,
  github: FaGithub,
  instagram: FaInstagram,
  facebook: FaFacebook,
  telegram: FaTelegram,
  youtube: FaYoutube,
  whatsapp: FaWhatsapp,
  dribbble: FaDribbble,
  behance: FaBehance,
  x: FaXTwitter,
};

/** Список для выпадающего списка в админке. `website` — запасной вариант (глобус). */
export const ICON_NAMES = [...Object.keys(MAP), 'website'] as const;

export default function SocialIcon({ name, size = 18 }: { name: string; size?: number }) {
  const Icon = MAP[name] ?? FiGlobe;
  return <Icon size={size} aria-hidden />;
}
