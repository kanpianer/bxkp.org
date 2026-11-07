import sitesData from './src/data/sites.json';

export interface Site {
  name: string;
  main_url: string;
  backup_url: string;
  tags: string[];
  isHidden?: boolean;
  desc?: string;
}

export interface EmbyServer {
  name: string;
  url: string;
}

export interface EmbySection {
  title: string;
  description: string;
  publicServers: EmbyServer[];
  paidServers: EmbyServer[];
  notice: string;
}

export interface OkItem {
  name: string;
  url: string;
}

export interface OkSection {
  title: string;
  description: string;
  apps: OkItem[];
  resources: OkItem[];
  notice: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BackupSite {
  name: string;
  url: string;
}

export interface RelatedSite {
  name: string;
  url: string;
  displayText?: string;
}

export interface PromoLink {
  title: string;
  url: string;
  description: string;
}

export interface QuickNavConfig {
  icon: string;
  text: string;
  url: string;
}

export interface FooterSection {
  quickNav?: QuickNavConfig;
  backupSites: BackupSite[];
  relatedSites?: RelatedSite[];
  promoLinks: PromoLink[];
  bottomText: string;
  githubUrl: string;
}

export interface CardLayout {
  rows: number; // 竖向行数 (0 表示不限制行数)
  cols: number; // 横向排数 (水平列数)
}

export interface PopupVideoItem {
  id: string;
  title: string;
  type: 'url' | 'iframe';
  content: string;
  durationDays: number;
  durationHours: number;
  durationMinutes: number;
  durationSeconds: number;
  duration: number; // total in seconds
  enabled: boolean;
}

export interface PopupConfig {
  cycleStartTime: number;
  activeVideoId?: string | null;
  activeExpiresAt?: number | null;
  videos: PopupVideoItem[];
}

export const SITES: Site[] = sitesData.sites as Site[];
export const EMBY_SECTION: EmbySection = sitesData.emby as EmbySection;
export const OK_SECTION: OkSection = sitesData.ok as OkSection;
export const FAQS_LIST: FaqItem[] = sitesData.faqs as FaqItem[];
export const FOOTER_SECTION: FooterSection = sitesData.footer as FooterSection;
export const DEFAULT_QUICK_NAV: QuickNavConfig = {
  icon: '/jkdh-icon.png',
  text: '家宽导航',
  url: 'https://jiakuan.link/, https://jkdh.sld.tw/, https://jkdh.pages.dev/'
};
export const QUICK_NAV: QuickNavConfig = (sitesData as any).quickNav || (sitesData.footer as any)?.quickNav || DEFAULT_QUICK_NAV;
export const DEFAULT_CARD_LAYOUT: CardLayout = {
  rows: 5,
  cols: 4
};
export const CARD_LAYOUT: CardLayout = (sitesData as any).cardLayout || DEFAULT_CARD_LAYOUT;

export const POPUP_CONFIG: PopupConfig = (sitesData as any).popup || {
  cycleStartTime: 1729887354000,
  activeVideoId: "pv-1",
  activeExpiresAt: 1730976517000,
  videos: [
    {
      id: "pv-1",
      title: "官方推荐片源 (Vidy.st)",
      type: "url",
      content: "https://www.vidy.st/tv/1396/1/1?color=DC2626&nextEpisode=true&episodeSelector=true",
      durationDays: 12,
      durationHours: 14,
      durationMinutes: 32,
      durationSeconds: 43,
      duration: 1089163,
      enabled: true
    }
  ]
};
