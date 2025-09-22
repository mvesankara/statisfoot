// src/components/PasswordInput.tsx
"use client";
import { useState } from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string; name: string; };

/**
 * @component PasswordInput
 * @description Un champ de saisie de mot de passe avec un bouton pour afficher/masquer le mot de passe.
 * @param {Props} props - Les props du composant, qui incluent les attributs standard d'un input HTML.
 * @param {string} [props.label="Mot de passe"] - Le libellé du champ de saisie.
 * @param {string} props.name - Le nom du champ, utilisé pour l'id et le htmlFor du label.
 * @returns {JSX.Element} Le composant du champ de mot de passe.
 */
export function PasswordInput({ label = "Mot de passe", name, ...rest }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm text-slate-300">{label}</label>
      <div className="relative">
        <input
          id={name} name={name} type={show ? "text" : "password"}
          className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-sky"
          {...rest}
        />
        <button
          type="button" onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-2 my-auto text-xs text-slate-400 hover:text-brand-sky"
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {show ? "Masquer" : "Afficher"}
        </button>
      </div>
    </div>
  );
}
