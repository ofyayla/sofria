/**
 * Gerçek kullanıcı talebi: haftalık plan her zaman sabit "Pazartesi"den değil,
 * planın oluşturulduğu/görüntülendiği günün ERTESİ gününden başlamalı, ve gün
 * şeridinde gerçek takvim tarihi görünmeli. Bu tarihler LLM'den ASLA istenmez
 * (bkz. weeklyPlan.ts — dayPlanWithDateSchema) — LLM'in tarih aritmetiği
 * güvenilmez, bu yüzden tamamen burada, kod tarafında, deterministik hesaplanır.
 */

// JS Date.getDay(): 0=Pazar, 1=Pazartesi, ... 6=Cumartesi.
const TURKISH_WEEKDAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"] as const;

export interface PlanWeekDay {
  dayIndex: number;
  date: string;
  dayName: string;
}

/**
 * `daysCount` günlük bir plan üretir; dayIndex 0 her zaman ŞU ANKİ zamana
 * göre YARINDIR (bugün değil) — kullanıcı bir planı akşam açsa bile "bugünün
 * planı" değil "yarından başlayan hafta planı" gösterilir.
 */
export function computePlanWeek(daysCount: number, now: Date = new Date()): PlanWeekDay[] {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return Array.from({ length: daysCount }, (_, dayIndex) => {
    const date = new Date(tomorrow);
    date.setDate(tomorrow.getDate() + dayIndex);
    return { dayIndex, date: formatIsoDate(date), dayName: TURKISH_WEEKDAYS[date.getDay()]! };
  });
}

function formatIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
