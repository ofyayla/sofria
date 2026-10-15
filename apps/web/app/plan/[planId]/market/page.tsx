"use client";

import Link from "next/link";
import { use } from "react";
import { AisleSection } from "../../../../components/mode1/market/AisleSection";
import { ProgressBar } from "../../../../components/mode1/market/ProgressBar";
import { Button } from "../../../../components/ui/Button";
import { usePlanStore } from "../../../../stores/plan.store";
import { useShoppingStore } from "../../../../stores/shopping.store";

export default function ShoppingListPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = use(params);
  const plan = usePlanStore((s) => s.currentPlan);
  // KRİTİK: `isChecked`/`toggleItem` metod REFERANSLARI hiç değişmez (zustand
  // action'ları sabittir) — bunları seçmek bileşeni checkedByPlan VERİSİNE
  // abone etmez, bu yüzden başka bir satırı işaretlemek bu bileşenin yeniden
  // render olmasını hiç tetiklemiyordu (localStorage doğru güncelleniyordu,
  // ekran hiç yenilenmiyordu). Gerçek kullanıcı testinde bulundu. Fix:
  // gerçek veriye (checkedByPlan) abone ol, checked durumunu ondan türet.
  const checkedByPlan = useShoppingStore((s) => s.checkedByPlan);
  const toggleItem = useShoppingStore((s) => s.toggleItem);

  if (!plan || plan.planId !== planId) {
    return (
      <div className="flex flex-col items-center gap-3 text-center py-16">
        <h2 className="font-display font-bold text-[20px] text-ink">Bu plana ait alışveriş listesi bulunamadı</h2>
        <Link href="/plan">
          <Button variant="primary">Yeni plan oluştur</Button>
        </Link>
      </div>
    );
  }

  const allItems = plan.shoppingList.aisles.flatMap((a) => a.items);
  const planChecks = checkedByPlan[plan.planId] ?? {};
  const checkedCount = allItems.filter((item) => planChecks[item.slug]).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-bold text-[26px] tracking-[-0.4px] text-ink">Alışveriş listesi</h1>
        <Link href={`/plan/${plan.planId}`}>
          <Button variant="ghost">← Plana dön</Button>
        </Link>
      </div>

      <ProgressBar checked={checkedCount} total={allItems.length} />

      {plan.shoppingList.aisles.map((group) => (
        <AisleSection
          key={group.aisle}
          group={group}
          isItemChecked={(slug) => Boolean(planChecks[slug])}
          onToggleItem={(slug) => toggleItem(plan.planId, slug)}
        />
      ))}
    </div>
  );
}
