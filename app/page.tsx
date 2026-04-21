import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Leaf,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Smartphone,
  UsersRound,
} from "lucide-react";

const benefits = [
  {
    icon: QrCode,
    title: "Controle instantane par QR code",
    text: "Chaque collaborateur dispose d'une preuve terrain lisible en quelques secondes par vos equipes ou vos clients.",
  },
  {
    icon: BadgeCheck,
    title: "Habilitations toujours a jour",
    text: "Statuts actif, expire ou suspendu visibles sans tableur, avec une lecture claire pour les agences et les encadrants.",
  },
  {
    icon: FileCheck2,
    title: "Tracabilite des verifications",
    text: "Les scans et incidents sont centralises pour simplifier les controles qualite, securite et conformite.",
  },
  {
    icon: UsersRound,
    title: "Pense pour les equipes paysage",
    text: "Suivi des jardiniers, chefs d'equipe, sous-traitants et intervenants multi-sites dans un espace unique.",
  },
];

const steps = [
  "Importez ou creez vos collaborateurs",
  "Attribuez les droits, agences et dates de validite",
  "Generez le QR code et verifiez sur chantier",
];

const metrics = [
  { value: "30 sec", label: "pour controler un intervenant" },
  { value: "24/7", label: "verification terrain accessible" },
  { value: "1 vue", label: "pour piloter toutes les agences" },
];

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-slate-950/75 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-base font-bold leading-4">Domocare Verify</span>
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Controle d&apos;acces
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-white/80 md:flex">
            <a href="#solution" className="transition hover:text-white">
              Solution
            </a>
            <a href="#terrain" className="transition hover:text-white">
              Terrain
            </a>
            <a href="#pilotage" className="transition hover:text-white">
              Pilotage
            </a>
          </nav>

          <Link
            href="/login"
            className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-100"
          >
            Connexion
          </Link>
        </div>
      </header>

      <section className="relative isolate flex min-h-[86vh] items-center overflow-hidden bg-slate-950 px-4 pt-24 text-white sm:px-6 lg:px-8">
        <Image
          src="/sassbeyond/banner_bg01.png"
          alt=""
          fill
          priority
          className="object-cover opacity-45"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.94),rgba(15,23,42,0.70),rgba(2,6,23,0.35))]" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-2 text-sm font-semibold text-emerald-100">
              <Leaf className="h-4 w-4" />
              Logiciel de controle d&apos;acces pour entreprises du paysage
            </div>
            <h1 className="text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Domocare Verify
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100 sm:text-xl">
              Verifiez en temps reel qui intervient sur vos chantiers, quels droits sont valides
              et quelles preuves de controle ont ete tracees.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
              >
                Acceder au logiciel
                <LockKeyhole className="h-4 w-4" />
              </Link>
              <a
                href="#solution"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Voir la solution
                <Smartphone className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="relative hidden min-h-[520px] lg:block">
            <div className="absolute right-0 top-6 w-[88%]">
              <Image
                src="/sassbeyond/banner_app.png"
                alt="Apercu mobile du controle d'acces Domocare Verify"
                width={640}
                height={760}
                priority
                className="h-auto w-full drop-shadow-[0_36px_60px_rgba(0,0,0,0.35)]"
              />
            </div>
            <div className="absolute bottom-12 left-0 w-72 rounded-lg border border-white/15 bg-white/95 p-4 text-slate-950 shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-black">Acces valide</p>
                  <p className="text-xs text-slate-500">Chef d&apos;equipe - Chantier sud</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="solution" className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-lg border border-slate-200 bg-white p-6">
                <p className="text-4xl font-black text-emerald-700">{metric.value}</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">{metric.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  key={benefit.title}
                  className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-emerald-300">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-xl font-black tracking-tight">{benefit.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{benefit.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="terrain" className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:items-center">
          <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
            <Image
              src="/sassbeyond/business_img01.png"
              alt="Interface de pilotage pour controle d'acces"
              width={720}
              height={560}
              className="h-auto w-full object-cover"
            />
          </div>

          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-sm font-bold text-amber-900">
              <Clock3 className="h-4 w-4" />
              Du bureau au chantier
            </div>
            <h2 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
              Une verification claire pour les agences, les encadrants et les clients.
            </h2>
            <p className="mt-5 max-w-2xl leading-7 text-slate-600">
              Domocare Verify transforme vos habilitations en preuves d&apos;acces simples a
              consulter. Vos equipes terrain scannent, le siege pilote, et chaque controle
              reste exploitable.
            </p>

            <div className="mt-8 grid gap-4">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-4 rounded-lg border border-slate-200 p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-sm font-black text-white">
                    {index + 1}
                  </span>
                  <p className="font-bold text-slate-800">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pilotage" className="bg-slate-950 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-sky-400/15 px-3 py-2 text-sm font-bold text-sky-100">
                <BarChart3 className="h-4 w-4" />
                Pilotage multi-agences
              </div>
              <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
                Une vitrine publique, un back-office securise.
              </h2>
              <p className="mt-5 leading-7 text-slate-300">
                La page publique presente la valeur du logiciel. La connexion reste reservee
                aux administrateurs pour gerer collaborateurs, scans, incidents et parametrage.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Agences", "Centralisez les droits par entite et secteur."],
                ["Securite", "Gardez une trace des statuts et suspensions."],
                ["Clients", "Donnez une preuve simple en cas de controle."],
                ["Reporting", "Suivez les volumes de scans et alertes."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <Building2 className="h-6 w-6 text-emerald-300" />
                  <h3 className="mt-4 text-lg font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="font-semibold text-slate-700">Domocare Verify - Controle d&apos;acces paysage</p>
          <div className="flex gap-4">
            <Link href="/login" className="font-bold text-slate-900 hover:text-emerald-700">
              Connexion
            </Link>
            <Link href="/verify" className="font-bold text-slate-900 hover:text-emerald-700">
              Verification QR
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
