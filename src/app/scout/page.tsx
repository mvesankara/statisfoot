"use client";
import React, { useMemo, useState } from "react";

/**
 * Statisfoot – Interfaces scouts (saisie) & recruteurs (lecture)
 * - Tech stack: React + Tailwind. Compatible shadcn/ui (drop-in replacement for buttons/inputs if needed).
 * - Notes sur 5 (style avis Google) avec étoiles cliquables.
 * - Mapping direct vers la base proposée: rating_sheet / rating_value / rating_dimension.
 * - Données factices incluses; plug API via onSubmit.
 */

/*********************************
 * Types (alignés DB / API)
 *********************************/
export type RatingDimension = {
  id: number; // rating_dimension.id
  code: string; // ex: TECH_PASS
  label: string;
  weight_pct?: number; // optionnel (affiché au survol)
  scale_max?: number; // par défaut 5
};

export type RatingTemplate = {
  id: number;
  name: string;
  position_code?: string; // GK, CB, FB, DM, CM, AM, W, ST
  dimensions: RatingDimension[];
};

export type Player = {
  id: number;
  first_name: string;
  last_name: string;
  age?: number;
  club?: string;
  position?: string; // ex: Milieu offensif
  photo_url?: string;
};

export type RatingValueDTO = { dimension_id: number; score: number };

/*********************************
 * Données de démonstration
 *********************************/
const playerDemo: Player = {
  id: 112545,
  first_name: "Michel",
  last_name: "Ndong",
  age: 24,
  club: "AS Mangasport",
  position: "Milieu offensif",
  photo_url:
    "https://images.unsplash.com/photo-1600486913747-55e0876a2adb?q=80&w=640&auto=format&fit=crop",
};

// Gabarit par défaut (tech/tactique/physique/mental) – notes /5
const TEMPLATE_MID_OFF: RatingTemplate = {
  id: 1001,
  name: "Milieu offensif – Senior",
  position_code: "AM",
  dimensions: [
    // Technique
    { id: 1, code: "TECH_PASS", label: "Qualité de passe", weight_pct: 15, scale_max: 5 },
    { id: 2, code: "TECH_FIRST_TOUCH", label: "Premier contrôle", weight_pct: 10, scale_max: 5 },
    { id: 3, code: "TECH_DRIBBLE", label: "Dribble / 1v1", weight_pct: 15, scale_max: 5 },
    { id: 4, code: "TECH_FINISH", label: "Finition", weight_pct: 10, scale_max: 5 },
    // Tactique
    { id: 5, code: "TACT_VISION", label: "Vision / Créativité", weight_pct: 15, scale_max: 5 },
    { id: 6, code: "TACT_POSITIONING", label: "Placement", weight_pct: 10, scale_max: 5 },
    { id: 7, code: "TACT_TRANSITION", label: "Transitions off/def", weight_pct: 5, scale_max: 5 },
    { id: 8, code: "TACT_DISCIPLINE", label: "Respect des consignes", weight_pct: 5, scale_max: 5 },
    // Physique
    { id: 9, code: "PHYS_SPEED", label: "Vitesse / Accélération", weight_pct: 5, scale_max: 5 },
    { id: 10, code: "PHYS_POWER", label: "Puissance / Duels", weight_pct: 5, scale_max: 5 },
    // Mental
    { id: 11, code: "MENTAL_CONCENTRATION", label: "Concentration", weight_pct: 3, scale_max: 5 },
    { id: 12, code: "MENTAL_GRIT", label: "Combativité", weight_pct: 1, scale_max: 5 },
    { id: 13, code: "MENTAL_LEADERSHIP", label: "Leadership", weight_pct: 1, scale_max: 5 },
    { id: 14, code: "MENTAL_FAIRPLAY", label: "Attitude / Fair-play", weight_pct: 0.5, scale_max: 5 },
  ],
};

/*********************************
 * UI – widgets
 *********************************/
function StarInput({
  value,
  max = 5,
  onChange,
  size = "text-2xl",
  ariaLabel,
}: {
  value: number;
  max?: number;
  onChange: (v: number) => void;
  size?: string;
  ariaLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-1" aria-label={ariaLabel} role="radiogroup">
      {stars.map((s) => {
        const active = (hover ?? value) >= s;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={value === s}
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(null)}
            className={`transition-transform ${active ? "scale-105" : "opacity-40"}`}
            title={`${s} / ${max}`}
          >
            <span className={`${size}`}>{active ? "★" : "☆"}</span>
          </button>
        );
      })}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">{title}</div>
      {children}
    </div>
  );
}

/*********************************
 * Interface – SCOUT (saisie)
 *********************************/
export function ScoutRatingForm({
  player = playerDemo,
  template = TEMPLATE_MID_OFF,
  defaultComment = "",
  onSubmit,
}: {
  player?: Player;
  template?: RatingTemplate;
  defaultComment?: string;
  onSubmit?: (payload: {
    player_id: number;
    template_id: number;
    overall_note: number;
    comment: string;
    values: RatingValueDTO[];
  }) => void | Promise<void>;
}) {
  const [scores, setScores] = useState<Record<number, number>>({});
  const [comment, setComment] = useState<string>(defaultComment);

  const grouped = useMemo(() => {
    // Regroupe par préfixe de code pour affichage
    const map: Record<string, RatingDimension[]> = { Technique: [], Tactique: [], Physique: [], Mental: [] };
    template.dimensions.forEach((d) => {
      if (d.code.startsWith("TECH_")) map["Technique"].push(d);
      else if (d.code.startsWith("TACT_")) map["Tactique"].push(d);
      else if (d.code.startsWith("PHYS_")) map["Physique"].push(d);
      else map["Mental"].push(d);
    });
    return map;
  }, [template]);

  const overall = useMemo(() => {
    const entries = Object.entries(scores);
    if (!entries.length) return 0;
    const sumWeights = entries.reduce((acc, [id, _]) => {
      const dim = template.dimensions.find((d) => d.id === Number(id));
      return acc + (dim?.weight_pct ?? 0);
    }, 0);
    const weighted = entries.reduce((acc, [id, v]) => {
      const dim = template.dimensions.find((d) => d.id === Number(id));
      const w = (dim?.weight_pct ?? 1) / 100;
      const max = dim?.scale_max ?? 5;
      return acc + (v / max) * w * 5; // normalise sur 5
    }, 0);
    return Number((weighted / (sumWeights ? sumWeights / 100 : entries.length)).toFixed(2));
  }, [scores, template]);

  const submit = async () => {
    const values: RatingValueDTO[] = Object.entries(scores).map(([id, score]) => ({
      dimension_id: Number(id),
      score,
    }));
    onSubmit?.({
      player_id: player.id,
      template_id: template.id,
      overall_note: overall,
      comment,
      values,
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      {/* En-tête joueur */}
      <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-sky-900 to-indigo-900 p-4 text-white shadow">
        <img src={player.photo_url} alt="player" className="h-16 w-16 rounded-xl object-cover" />
        <div className="flex-1">
          <div className="text-2xl font-bold">
            {player.first_name} {player.last_name}
          </div>
          <div className="text-sm opacity-90">
            {player.position} • {player.club} • {player.age} ans
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-80">Note globale (sur 5)</div>
          <div className="text-3xl font-bold">{overall.toFixed(2)}</div>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.entries(grouped).map(([section, dims]) => (
          <SectionCard key={section} title={section}>
            <div className="space-y-3">
              {dims.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{d.label}</div>
                    <div className="text-xs text-gray-500">
                      code: {d.code} • poids: {d.weight_pct ?? 0}% • /{d.scale_max ?? 5}
                    </div>
                  </div>
                  <StarInput
                    ariaLabel={d.label}
                    value={scores[d.id] ?? 0}
                    max={d.scale_max ?? 5}
                    onChange={(v) => setScores((s) => ({ ...s, [d.id]: v }))}
                  />
                </div>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>

      {/* Commentaire */}
      <SectionCard title="Commentaire (optionnel)">
        <textarea
          className="w-full rounded-xl border p-3 focus:outline-none focus:ring"
          rows={4}
          placeholder="Points forts, axes de progrès, moments clés observés…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </SectionCard>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          className="rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-50"
          type="button"
          onClick={() => {
            setScores({});
            setComment("");
          }}
        >
          Réinitialiser
        </button>
        <button
          className="rounded-xl bg-sky-600 px-5 py-2 font-semibold text-white shadow hover:bg-sky-700"
          type="button"
          onClick={submit}
        >
          Enregistrer la fiche
        </button>
      </div>
    </div>
  );
}

export default function ScoutPage() {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <ScoutRatingForm />
        </div>
    )
}
