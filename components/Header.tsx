import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#fef8fb]/70 backdrop-blur-xl flex items-center justify-between px-6 h-16">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[#69558e] text-2xl">
          bubble_chart
        </span>
        <h1 className="text-2xl font-bold text-[#69558e] font-[var(--font-headline)] tracking-tight">
          Sabaijai
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-[#69558e]/10 text-[#69558e] hover:opacity-80 transition-opacity">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#d6beff]">
          <img
            alt="Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUIQjYUSWO5Nni5ufkVnZ5zaHNdY7knagqxXk3rnKYdyfHJAE67Cvv17sGKRpbtCSXOuDQQLZ8CztjQc-nI7CB9fvG-3M9tmS1tCkCH4M3JTv27U48Osi6WDbEardWhIqpm9NxI-sERxuFcougmIN-iJF3GUUo6FuM2bA53wnCE9QRIiplNWKs3unf3GwrUR1CuZSrXlQZsJ5x44AlxcuxYsXdnMzKxdrVu1axKRgDSOfO8jrB3SGd6qj8Sb1K6I7l1F1bmZ1zCC0q"
          />
        </div>
      </div>
    </header>
  );
}
