import { notFound } from 'next/navigation';
import { getLeagueConfig, LEAGUE_IDS, getLeagueThemeColors } from '@/lib/config/leagues';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Trophy, BarChart3, Calculator, Table } from 'lucide-react';

// Build-time static params üretimi
export function generateStaticParams() {
  return LEAGUE_IDS.map((leagueId) => ({
    leagueId: leagueId,
  }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ leagueId: string }> 
}): Promise<Metadata> {
  const { leagueId } = await params;
  const config = getLeagueConfig(leagueId);
  if (!config) return {};

  return {
    title: `${config.name} - VolleySimulator`,
    description: `${config.name} simülasyonu, istatistikleri ve tahmin oyunu.`,
    openGraph: {
      title: `${config.name} - VolleySimulator`,
      description: `${config.name} için puan tablosu, playoff ve tahmin simülasyonu.`,
    },
  };
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default async function LeagueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ leagueId: string }>;
}) {
  const { leagueId } = await params;
  const config = getLeagueConfig(leagueId);

  if (!config) {
    notFound();
  }

  const themeColors = getLeagueThemeColors(config.id);

  const navItems: NavItem[] = [
    {
      href: `/leagues/${leagueId}`,
      label: 'Güncel Durum',
      icon: <Table className="w-4 h-4" />,
    },
    {
      href: `/leagues/${leagueId}/tahminoyunu`,
      label: 'Tahmin Oyunu',
      icon: <Calculator className="w-4 h-4" />,
    },
    {
      href: `/leagues/${leagueId}/stats`,
      label: 'İstatistikler',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ];

  if (config.hasPlayoffs) {
    navItems.push({
      href: `/leagues/${leagueId}/playoffs`,
      label: 'Playoff',
      icon: <Trophy className="w-4 h-4" />,
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* League Header */}
      <div className={`w-full py-4 px-6 bg-gradient-to-r ${themeColors.gradient} text-white`}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{config.icon}</span>
              <div>
                <h1 className="text-xl font-bold">{config.name}</h1>
                <p className="text-sm opacity-80">{config.subtitle}</p>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="flex overflow-x-auto gap-2 p-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${themeColors.bg} ${themeColors.text} whitespace-nowrap text-sm font-medium`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
