import {
  Gem,
  Handshake,
  MapPin,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/**
 * Resolve o ícone de um diferencial pela semântica do título.
 * Os diferenciais são livres (JSONB editável no admin), então o ícone
 * é inferido por palavras-chave em vez de ser configurado manualmente.
 */
const RULES: [RegExp, LucideIcon][] = [
  [/atend|contato|cliente|personal/i, Handshake],
  [/curadoria|sele[cç][aã]o|exclus|qualidade/i, Gem],
  [/local|regi[aã]o|mercado|conhecimento|litoral|cidade/i, MapPin],
  [/transpar|confian|segur|honest|integridade/i, ShieldCheck],
];

export function differentialIcon(title: string): LucideIcon {
  for (const [re, icon] of RULES) {
    if (re.test(title)) return icon;
  }
  return TrendingUp;
}
