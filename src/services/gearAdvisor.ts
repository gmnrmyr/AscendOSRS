interface BankItemLike {
  osrsId?: number;
  name: string;
  quantity: number;
  estimatedPrice: number;
}

interface GoalLike {
  itemId?: number;
}

// O advisor é deliberadamente conservador. Stats iguais/maiores não bastam para
// declarar BIS: passivas, estilo de ataque e usos especiais também contam.
// Novos itens entram nesta base versionada depois de revisão; até lá o app não
// inventa uma relação. `reviewedAt` deixa explícita a idade do conhecimento.
export type GearAdviceLevel = 'sell' | 'review';

export interface GearRelation {
  id: string;
  betterName: string;
  candidateIds: number[];
  level: GearAdviceLevel;
  reason: string;
  caveat?: string;
  goalTriggerIds?: number[];
  goalRequiresOwnedAll?: number[];
  ownedTriggerAll?: number[];
  reviewedAt: string;
  sources: string[];
}

export interface GearSellAdvice {
  relationId: string;
  level: GearAdviceLevel;
  betterName: string;
  reason: string;
  caveat?: string;
  reviewedAt: string;
  sources: string[];
  items: Array<{
    osrsId: number;
    name: string;
    quantity: number;
    value: number;
    characters: string[];
  }>;
  totalValue: number;
}

export const GEAR_KNOWLEDGE_REVIEWED_AT = '2026-08-11';
export const DEFAULT_SELL_FLOOR = 5_000_000;

// Relações iniciais de alto valor, focadas no bank/goals real. A estrutura é
// extensível: itens futuros exigem somente uma nova relação, sem mudar a UI.
export const GEAR_RELATIONS: GearRelation[] = [
  {
    id: 'masori-mask-f-over-armadyl-helm',
    betterName: 'Masori mask (f)',
    candidateIds: [11826],
    level: 'sell',
    reason: 'Masori mask (f) domina Armadyl helmet em dano à distância e também em defesa.',
    caveat: 'Armadyl helmet ainda é exigido por um clue/Falo; Masori mask (f) não o substitui nessa etapa.',
    goalTriggerIds: [27235],
    ownedTriggerAll: [27235],
    reviewedAt: GEAR_KNOWLEDGE_REVIEWED_AT,
    sources: [
      'https://oldschool.runescape.wiki/w/Masori_armour',
      'https://oldschool.runescape.wiki/w/Armadyl_armour',
    ],
  },
  {
    id: 'masori-body-f-over-armadyl-body',
    betterName: 'Masori body (f)',
    candidateIds: [11828],
    level: 'sell',
    reason: 'Masori body (f) domina Armadyl chestplate em dano à distância e defesa.',
    caveat: 'Armadyl pode ser quebrado em plates para fortificar Masori; considere esse uso antes de vender no GE.',
    goalTriggerIds: [27238],
    ownedTriggerAll: [27238],
    reviewedAt: GEAR_KNOWLEDGE_REVIEWED_AT,
    sources: [
      'https://oldschool.runescape.wiki/w/Masori_armour',
      'https://oldschool.runescape.wiki/w/Armadyl_armour',
    ],
  },
  {
    id: 'masori-chaps-f-over-armadyl-skirt',
    betterName: 'Masori chaps (f)',
    candidateIds: [11830],
    level: 'sell',
    reason: 'Masori chaps (f) dominam Armadyl chainskirt em dano à distância e defesa.',
    caveat: 'Armadyl pode ser quebrado em plates para fortificar Masori; considere esse uso antes de vender no GE.',
    goalTriggerIds: [27241],
    ownedTriggerAll: [27241],
    reviewedAt: GEAR_KNOWLEDGE_REVIEWED_AT,
    sources: [
      'https://oldschool.runescape.wiki/w/Masori_armour',
      'https://oldschool.runescape.wiki/w/Armadyl_armour',
    ],
  },
  {
    id: 'elder-maul-over-dwh',
    betterName: 'Elder maul',
    candidateIds: [13576],
    level: 'sell',
    reason: 'É o upgrade direto de defence reduction: mais precisão e redução de 35%, contra 30% da DWH.',
    caveat: 'A DWH continua sendo uma arma de uma mão e funciona como hammer em usos específicos.',
    goalTriggerIds: [21003],
    ownedTriggerAll: [21003],
    reviewedAt: GEAR_KNOWLEDGE_REVIEWED_AT,
    sources: [
      'https://oldschool.runescape.wiki/w/Elder_maul',
      'https://oldschool.runescape.wiki/w/Dragon_warhammer',
    ],
  },
  {
    id: 'zcb-over-acb',
    betterName: 'Zaryte crossbow',
    candidateIds: [11785],
    level: 'sell',
    reason: 'ZCB é o upgrade direto da ACB: mais precisão e efeitos de enchanted bolts superiores.',
    caveat: 'A ACB é componente para criar a própria ZCB e conta como item Armadylean em GWD.',
    goalTriggerIds: [26374],
    ownedTriggerAll: [26374],
    reviewedAt: GEAR_KNOWLEDGE_REVIEWED_AT,
    sources: [
      'https://oldschool.runescape.wiki/w/Zaryte_crossbow',
      'https://oldschool.runescape.wiki/w/Armadyl_crossbow',
    ],
  },
  {
    id: 'torva-over-bandos',
    betterName: 'Torva armour',
    candidateIds: [11832, 11834], // chestplate, tassets
    level: 'sell',
    reason: 'Torva é o upgrade direto de força e defesa sobre Bandos para melee geral.',
    caveat: 'A regra só cobre chestplate/tassets; não trata usos cosméticos ou setups de baixo orçamento.',
    goalTriggerIds: [31145, 26384, 26386], // set no Ascend + peças individuais
    ownedTriggerAll: [26384, 26386],
    reviewedAt: GEAR_KNOWLEDGE_REVIEWED_AT,
    sources: [
      'https://oldschool.runescape.wiki/w/Torva_armour',
      'https://oldschool.runescape.wiki/w/Bandos_armour',
    ],
  },
  {
    id: 'ancestral-over-virtus-general',
    betterName: 'Ancestral robes',
    candidateIds: [26241, 26243, 26245],
    level: 'review',
    reason: 'Ancestral oferece mais magic damage no uso geral: 9% no set contra 6% do Virtus.',
    caveat: 'Virtus é superior com combat spells de Ancient Magicks e pode valer a pena manter.',
    goalTriggerIds: [21049, 21018, 21021, 21024],
    ownedTriggerAll: [21018, 21021, 21024],
    reviewedAt: GEAR_KNOWLEDGE_REVIEWED_AT,
    sources: [
      'https://oldschool.runescape.wiki/w/Ancestral_robes',
      'https://oldschool.runescape.wiki/w/Virtus_robes',
    ],
  },
  {
    id: 'fang-vw-over-rapier-overlap',
    betterName: 'Osmumten’s fang + Voidwaker',
    candidateIds: [22324],
    level: 'review',
    reason: 'Fang cobre stab contra defesa alta e Voidwaker cobre special attack, reduzindo bastante o espaço da rapier.',
    caveat: 'Rapier ainda é melhor como stab principal contra alvos de defesa baixa e para treino geral.',
    goalTriggerIds: [27690],
    goalRequiresOwnedAll: [26219],
    ownedTriggerAll: [26219, 27690],
    reviewedAt: GEAR_KNOWLEDGE_REVIEWED_AT,
    sources: [
      'https://oldschool.runescape.wiki/w/Voidwaker',
      'https://oldschool.runescape.wiki/w/Ghrazi_rapier',
      'https://oldschool.runescape.wiki/w/Osmumten%27s_fang',
    ],
  },
  {
    id: 'shadow-over-sang-overlap',
    betterName: 'Tumeken’s shadow',
    candidateIds: [22323],
    level: 'review',
    reason: 'Shadow domina o Sang como powered staff de DPS na maior parte do PvM endgame.',
    caveat: 'Sang continua útil por cura, custo/risco menor e situações em que o Shadow perde eficiência.',
    goalTriggerIds: [27277],
    ownedTriggerAll: [27277],
    reviewedAt: GEAR_KNOWLEDGE_REVIEWED_AT,
    sources: [
      'https://oldschool.runescape.wiki/w/Tumeken%27s_shadow',
      'https://oldschool.runescape.wiki/w/Sanguinesti_staff',
    ],
  },
];

interface OwnedStack {
  osrsId: number;
  name: string;
  quantity: number;
  value: number;
  characters: Set<string>;
}

function bankIndex(bankData: Record<string, BankItemLike[]>): Map<number, OwnedStack> {
  const out = new Map<number, OwnedStack>();
  for (const [character, items] of Object.entries(bankData || {})) {
    for (const item of items || []) {
      if (!item.osrsId || item.quantity <= 0) continue;
      const current = out.get(item.osrsId) || {
        osrsId: item.osrsId,
        name: item.name,
        quantity: 0,
        value: 0,
        characters: new Set<string>(),
      };
      current.quantity += Math.floor(item.quantity);
      current.value += Math.floor(item.quantity) * Math.max(0, item.estimatedPrice || 0);
      current.characters.add(character);
      out.set(item.osrsId, current);
    }
  }
  return out;
}

function adviceForRelation(
  relation: GearRelation,
  owned: Map<number, OwnedStack>,
  minimumValue: number,
): GearSellAdvice | null {
  const items = relation.candidateIds
    .map((id) => owned.get(id))
    .filter((item): item is OwnedStack => Boolean(item && item.value >= minimumValue))
    .map((item) => ({
      osrsId: item.osrsId,
      name: item.name,
      quantity: item.quantity,
      value: item.value,
      characters: [...item.characters].sort(),
    }));
  if (items.length === 0) return null;
  return {
    relationId: relation.id,
    level: relation.level,
    betterName: relation.betterName,
    reason: relation.reason,
    caveat: relation.caveat,
    reviewedAt: relation.reviewedAt,
    sources: relation.sources,
    items,
    totalValue: items.reduce((sum, item) => sum + item.value, 0),
  };
}

export function goalSellAdvice(
  goal: GoalLike,
  bankData: Record<string, BankItemLike[]>,
  minimumValue = DEFAULT_SELL_FLOOR,
): GearSellAdvice[] {
  if (!goal.itemId) return [];
  const owned = bankIndex(bankData);
  return GEAR_RELATIONS
    .filter((relation) => relation.goalTriggerIds?.includes(goal.itemId!))
    .filter((relation) => (relation.goalRequiresOwnedAll || []).every((id) => owned.has(id)))
    .map((relation) => adviceForRelation(relation, owned, minimumValue))
    .filter((advice): advice is GearSellAdvice => Boolean(advice))
    .sort((a, b) => b.totalValue - a.totalValue);
}

export function bankSellAdvice(
  bankData: Record<string, BankItemLike[]>,
  minimumValue = DEFAULT_SELL_FLOOR,
): GearSellAdvice[] {
  const owned = bankIndex(bankData);
  return GEAR_RELATIONS
    .filter((relation) => relation.ownedTriggerAll?.every((id) => owned.has(id)))
    .map((relation) => adviceForRelation(relation, owned, minimumValue))
    .filter((advice): advice is GearSellAdvice => Boolean(advice))
    .sort((a, b) => b.totalValue - a.totalValue);
}
