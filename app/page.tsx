import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Leaf,
  LockKeyhole,
  QrCode,
  ShieldCheck,
} from "lucide-react";

const featureCards = [
  {
    icon: "/sassbeyond/features_icon01.png",
    tone: "bg-[#fff7d7]",
    title: "Controle QR code",
    text: "Un scan suffit pour verifier si un intervenant est autorise sur site.",
  },
  {
    icon: "/sassbeyond/features_icon02.png",
    tone: "bg-[#efe7ff]",
    title: "Habilitations a jour",
    text: "Suivez les statuts actifs, expires ou suspendus sans fichier eparpille.",
  },
  {
    icon: "/sassbeyond/features_icon03.png",
    tone: "bg-[#e2f4ff]",
    title: "Preuve de passage",
    text: "Chaque verification terrain devient une trace exploitable par l'agence.",
  },
  {
    icon: "/sassbeyond/features_icon04.png",
    tone: "bg-[#ffe8de]",
    title: "Acces securise",
    text: "Le back-office reste reserve aux responsables et administrateurs.",
  },
];

const processItems = [
  {
    icon: "/sassbeyond/business_icon01.png",
    image: "/lantana-verify/dashboard-authorizations.png",
    title: "Centralisez les collaborateurs",
    text: "Importez vos equipes, associez-les aux agences, aux entreprises du groupe et aux missions terrain.",
    reverse: false,
  },
  {
    icon: "/sassbeyond/business_icon02.png",
    image: "/lantana-verify/access-rights-badge.png",
    title: "Attribuez les droits d'acces",
    text: "Definissez les dates de validite, les statuts et les suspensions depuis un espace unique.",
    reverse: true,
  },
  {
    icon: "/sassbeyond/business_icon03.png",
    image: "/lantana-verify/field-qr-scan.png",
    title: "Verifiez sur chantier",
    text: "Les encadrants ou clients scannent le QR code et voient instantanement si l'acces est conforme.",
    reverse: false,
  },
];

const metrics = [
  ["30 sec", "controle terrain"],
  ["24/7", "verification disponible"],
  ["1 outil", "pour agences et siege"],
];

function HeroPhoneMockup() {
  return (
    <div
      className="relative mx-auto h-[610px] w-[320px] rounded-[2.1rem] bg-[#4338e8] p-[14px] shadow-[0_42px_80px_rgba(0,0,0,0.42)]"
      aria-label="Telephone affichant un acces valide"
    >
      <div className="relative h-full w-full rounded-[2rem] border-[6px] border-[#e8eef5] bg-white p-5 text-slate-950 shadow-inner">
        <div className="absolute left-1/2 top-3 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-[#d9dde5]" />
        <div className="mt-7 flex items-center justify-between text-[10px] font-bold text-slate-500">
          <span>...</span>
          <span className="h-2 w-5 rounded-sm border border-slate-300" />
        </div>

        <div className="mt-7 flex items-center justify-between">
          <span className="text-2xl font-black leading-none">Lantana Verify</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
          </span>
        </div>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
          Controle terrain
        </p>

        <div className="mt-7 rounded-lg border border-emerald-100 bg-emerald-50 p-5 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-[7px] border-emerald-500 text-emerald-600">
            <CheckCircle2 className="h-14 w-14" />
          </div>
          <p className="mt-5 rounded-lg bg-emerald-600 px-4 py-3 text-lg font-black text-white">
            ACCES VALIDE
          </p>
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-black">Equipe paysage</p>
              <p className="text-xs font-semibold text-slate-500">Intervention autorisee</p>
            </div>
          </div>
          <div className="mx-auto mt-4 grid h-28 w-28 grid-cols-5 gap-1 rounded-lg bg-white p-2 shadow-inner">
            {Array.from({ length: 25 }).map((_, index) => (
              <span
                key={index}
                className={`rounded-[2px] ${
                  [0, 1, 3, 4, 5, 7, 9, 11, 12, 13, 15, 17, 19, 20, 21, 23, 24].includes(index)
                    ? "bg-slate-950"
                    : "bg-slate-100"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-5 rounded-lg bg-[#4338e8] p-4 text-white">
          <div className="mb-4 grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
            <span>QR</span>
            <span>Statut</span>
            <span>Trace</span>
          </div>
          <Link
            href="/login"
            className="flex h-10 items-center justify-center rounded-lg bg-white text-xs font-black uppercase tracking-[0.08em] text-[#4338e8]"
          >
            Confirmer
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MarketingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-[#111827]/75 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 text-white">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-400 text-slate-950">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-lg font-black leading-5">Lantana Verify</span>
              <span className="block text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
                Groupe Lantana
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-bold text-white/80 md:flex">
            <a href="#fonctionnalites" className="transition hover:text-white">
              Fonctionnalites
            </a>
            <a href="#process" className="transition hover:text-white">
              Process
            </a>
            <a href="#preuve" className="transition hover:text-white">
              Terrain
            </a>
          </nav>

          <Link
            href="/login"
            className="rounded-lg bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-100"
          >
            Connexion
          </Link>
        </div>
      </header>

      <section className="relative isolate min-h-[92vh] bg-[#111827] pt-20 text-white">
        <Image
          src="/sassbeyond/banner_bg01.png"
          alt=""
          fill
          priority
          className="object-cover opacity-65"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(17,24,39,0.98)_0%,rgba(22,45,57,0.82)_48%,rgba(17,24,39,0.40)_100%)]" />

        <div className="relative z-10 mx-auto grid min-h-[calc(92vh-5rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-emerald-50">
              <Leaf className="h-4 w-4 text-emerald-300" />
              Logiciel de controle d&apos;acces pour les entreprises du paysage
            </div>

            <h1 className="text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Controlez vos acces terrain en temps reel.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-100 sm:text-xl">
              Lantana Verify adapte le principe du template SassBeyond a votre metier:
              habilitations, QR codes, scans, preuves de controle et pilotage multi-agences.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
              >
                Acceder au logiciel
                <LockKeyhole className="h-4 w-4" />
              </Link>
              <a
                href="#fonctionnalites"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10"
              >
                Decouvrir
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {metrics.map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/15 bg-white/10 p-4">
                  <p className="text-3xl font-black text-emerald-200">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-200">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[620px] lg:block">
            <div className="absolute right-10 top-0">
              <HeroPhoneMockup />
            </div>
            <div className="absolute bottom-16 left-2 w-80 rounded-lg border border-white/15 bg-white p-5 text-slate-950 shadow-2xl">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-sm font-black">Acces valide</p>
                  <p className="text-xs font-semibold text-slate-500">
                    Equipe paysage - Intervention autorisee
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="relative bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
              Fonctionnalites
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Les services essentiels du controle d&apos;acces terrain.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {featureCards.map((feature) => (
              <article
                key={feature.title}
                className="flex gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
              >
                <span
                  className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-lg ${feature.tone}`}
                >
                  <Image src={feature.icon} alt="" width={42} height={42} />
                </span>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-4 text-sm font-black text-white transition hover:bg-emerald-700"
            >
              Voir le back-office
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="process" className="bg-[#f7fbfb] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-700">
              Process metier
            </p>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
              Du siege au chantier, le controle reste simple.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Le template est adapte pour presenter une application SaaS claire: un parcours
              court, des preuves visibles et une entree directe vers la connexion.
            </p>
          </div>

          <div className="mt-16 grid gap-20">
            {processItems.map((item) => (
              <article
                key={item.title}
                className="grid items-center gap-10 lg:grid-cols-2"
              >
                <div className={item.reverse ? "lg:order-2" : ""}>
                  <Image src={item.icon} alt="" width={68} height={68} />
                  <h3 className="mt-8 max-w-xl text-4xl font-black tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">{item.text}</p>
                  <Link
                    href="/login"
                    className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
                  >
                    Se connecter
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div
                  className={`relative rounded-lg bg-white p-4 shadow-[0_30px_80px_rgba(15,23,42,0.10)] ${
                    item.reverse ? "lg:order-1" : ""
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={760}
                    height={520}
                    className="h-auto w-full rounded-lg"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="preuve" className="relative overflow-hidden bg-white py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.55fr_1fr] lg:px-8">
          <div className="hidden overflow-hidden rounded-lg shadow-[0_30px_80px_rgba(15,23,42,0.14)] lg:block">
            <Image
              src="/lantana-verify/proof-access-control.png"
              alt="Preuve de controle d'acces valide sur chantier"
              width={760}
              height={430}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <h2 className="text-4xl font-black tracking-tight sm:text-5xl">
              Une preuve lisible pour chaque controle.
            </h2>
            <p className="mt-6 text-2xl font-semibold leading-10 text-slate-700">
              Les equipes terrain savent immediatement si l&apos;intervenant est autorise.
              Les responsables gardent une vision fiable des scans, statuts et alertes.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <QrCode className="h-7 w-7" />
              </span>
              <div>
                <p className="font-black">Verification QR code</p>
                <p className="text-sm font-semibold text-slate-500">
                  Pour agences, encadrants et clients du Groupe Lantana
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-16 text-white">
        <Image
          src="/sassbeyond/newsletter_bg.png"
          alt=""
          fill
          className="object-cover opacity-25"
          sizes="100vw"
        />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-200">
              Lantana Verify
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Accedez au logiciel de controle d&apos;acces.
            </h2>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-emerald-100"
          >
            Connexion securisee
            <LockKeyhole className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="font-semibold text-slate-700">
            Lantana Verify - Controle d&apos;acces paysage
          </p>
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
