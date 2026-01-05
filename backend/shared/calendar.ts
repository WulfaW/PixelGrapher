export interface CalendarRange {
  startSunday: Date;
  endSaturday: Date;
  weeksCount: number;
}

/**
 * GitHub contribution calendar aralığı: yılın içindeki haftaları hizalar.
 * Başlangıç: 1 Ocak'ın bulunduğu haftanın pazarı (UTC).
 * Bitiş: 31 Aralık'ın bulunduğu haftanın cumartesisi (UTC).
 * Haftalar: 52 veya 53 olabilir; her zaman tam hafta sayısı döner.
 */
export function getCalendarRange(year: number): CalendarRange {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const dec31 = new Date(Date.UTC(year, 11, 31));

  const start = new Date(jan1);
  start.setUTCDate(jan1.getUTCDate() - jan1.getUTCDay());

  const end = new Date(dec31);
  end.setUTCDate(dec31.getUTCDate() + (6 - dec31.getUTCDay()));

  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const weeksCount = Math.floor(diffDays / 7) + 1;

  return { startSunday: start, endSaturday: end, weeksCount };
}

/** Belirli hücre (hafta, gün) için tarih döner (UTC). */
export function dateForCell(dayIndex: number, weekIndex: number, range: CalendarRange): Date {
  const date = new Date(range.startSunday);
  date.setUTCDate(range.startSunday.getUTCDate() + weekIndex * 7 + dayIndex);
  return date;
}
