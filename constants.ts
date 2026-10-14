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

export interface FooterSection {
  backupSites: BackupSite[];
  relatedSites?: RelatedSite[];
  promoLinks: PromoLink[];
  bottomText: string;
  githubUrl: string;
}

export const SITES: Site[] = sitesData.sites as Site[];
export const EMBY_SECTION: EmbySection = sitesData.emby as EmbySection;
export const OK_SECTION: OkSection = sitesData.ok as OkSection;
export const FAQS_LIST: FaqItem[] = sitesData.faqs as FaqItem[];
export const FOOTER_SECTION: FooterSection = sitesData.footer as FooterSection;
