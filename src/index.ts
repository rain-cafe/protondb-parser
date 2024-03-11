import { writeFile } from 'fs/promises';
import { join } from 'path';
import { protondb } from './utils';
import { isAfter, subMonths } from 'date-fns';

export async function main() {
  await protondb.update();

  const reportsByMonth = await protondb.reports();

  const currentReportsByMonth = reportsByMonth.filter(({ date }) => isAfter(date, subMonths(new Date(), 1)));

  let allRelevantReports: protondb.Report[] = [];
  for (const reportsOfMonth of currentReportsByMonth) {
    console.log(`Retrieving ${reportsOfMonth.date.toDateString()}...`);
    const reports = await protondb.report(reportsOfMonth);

    console.log(`Total Reports: ${reports.length}`);

    const relevantReports = reports.filter(
      (report) =>
        report.responses.installs === 'yes' &&
        (report.responses.customizationsUsed?.protonfixes ||
          report.responses.customizationsUsed?.protontricks ||
          report.responses.customizationsUsed?.winetricks) &&
        // /(?:tweak|trick)/g.test(report.responses.notes.extra) &&
        isAfter(report.timestamp, Date.now() / 1000 - 2678400 * 1)
    );

    console.log(`Found ${relevantReports.length} relevant reports for ${reportsOfMonth.date.toDateString()}!`);
    allRelevantReports = [...allRelevantReports, ...relevantReports];
  }

  await writeFile(join(import.meta.dirname, '../reports.json'), JSON.stringify(allRelevantReports, null, 2), 'utf-8');
}

main();
