import * as archive from './archive';
import { exists, readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { format, parse } from 'date-fns';

const PROTON_DB_DIR = join(import.meta.dirname, '../../.proton-db');
const PROTON_DB_OUT_DIR = join(PROTON_DB_DIR, 'out');
const PROTON_DB_REPO_DIR = join(PROTON_DB_DIR, 'protondb-data-master');
const PROTON_DB_ZIP = join(import.meta.dirname, '../../.proton-db.zip');
const PROTON_DB_DATA = 'https://github.com/bdefore/protondb-data/archive/refs/heads/master.zip';

export async function update(): Promise<void> {
  const zipDownloaded = await exists(PROTON_DB_ZIP);
  if (zipDownloaded) {
    console.log('protondb-data has already been downloaded, skipping...');
  } else {
    console.log('Downloading protondb-data...');
    await archive.download(PROTON_DB_DATA, PROTON_DB_ZIP);
    console.log('Download complete!');
  }

  const isExtracted = await exists(PROTON_DB_REPO_DIR);
  if (isExtracted) {
    console.log('protondb-data has already been extracted, skipping...');
  } else {
    console.log('Extracting protondb-data...');
    await archive.extract(PROTON_DB_ZIP, PROTON_DB_DIR);
    console.log('Extraction complete!');
  }
}

export async function reports(): Promise<ReportArchive[]> {
  const files = await readdir(join(PROTON_DB_REPO_DIR, 'reports'));

  return files
    .filter((file) => file.endsWith('.tar.gz'))
    .map((file) => ({
      date: parse(file, `'reports_'MMMd'_'yyyy'.tar.gz'`, new Date()),
      file,
      path: join(PROTON_DB_REPO_DIR, 'reports', file),
    }));
}

export async function report(reportArchive: ReportArchive): Promise<Report[]> {
  const REPORT_DIR = join(PROTON_DB_OUT_DIR, format(reportArchive.date, 'yyyy-MM-dd'));

  await archive.extract(reportArchive.path, REPORT_DIR);
  const content = await readFile(join(REPORT_DIR, '/reports_piiremoved.json'), 'utf-8');

  return JSON.parse(content);
}

export type ReportArchive = {
  date: Date;
  file: string;
  path: string;
};

export type Report = {
  app: {
    steam: {
      appId: string;
    };
    title: string;
  };

  responses: {
    answerToWhatGame: string;
    appSelectionMethod: string;
    installs: 'yes' | 'no';
    audioFaults?: 'yes' | 'no';
    extra?: 'yes' | 'no';
    graphicalFaults?: 'yes' | 'no';
    inputFaults?: 'yes' | 'no';
    isImpactedByAntiCheat?: 'yes' | 'no';
    isMultiplayerImportant?: 'yes' | 'no';
    onlineMultiplayerAttempted?: 'yes' | 'no';
    opens?: 'yes' | 'no';
    performanceFaults?: 'yes' | 'no';
    localMultiplayerAttempted?: 'yes' | 'no';
    saveGameFaults?: 'yes' | 'no';
    significantBugs?: 'yes' | 'no';
    stabilityFaults?: 'yes' | 'no';
    startsPlay?: 'yes' | 'no';
    customizationsUsed?: {
      protonfixes?: boolean;
      protontricks?: boolean;
      winetricks?: boolean;
    };
    notes?: {
      extra: string;
      verdict: string;
    };
    protonVersion: string;
    type: string;
    verdict: 'yes' | 'no';
    windowingFaults: 'yes' | 'no';
  };

  timestamp: number;

  systemInfo: {
    cpu: string;
    gpu: string;
    gpuDriver: string;
    kernel: string;
    os: string;
    ram: string;
  };
};
