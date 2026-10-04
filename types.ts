export interface Site {
  name: string;
  main_url: string;
  backup_url: string;
  tags: string[];
}

export type Category = 'online' | 'pan' | 'bt';

export type InfoType = 'emby' | 'ok' | null;