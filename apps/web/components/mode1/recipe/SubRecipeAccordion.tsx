import { UNIT_LABELS, type SubRecipe } from "@sofria/shared";

type SubRecipeAccordionData = Pick<SubRecipe, "servings" | "prepMinutes" | "cookMinutes" | "difficulty" | "ingredients" | "instructions">;

export function SubRecipeAccordion({ subRecipe }: { subRecipe: SubRecipeAccordionData }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 text-[14px] text-ink-muted">
        <span className="tabular-nums">{subRecipe.servings} porsiyon</span>
        <span className="tabular-nums">{subRecipe.prepMinutes + subRecipe.cookMinutes} dk</span>
        <span>{subRecipe.difficulty}</span>
      </div>

      <div>
        <h4 className="font-sans font-semibold text-[13px] text-ink-secondary mb-2">Malzemeler</h4>
        <ul className="flex flex-col">
          {subRecipe.ingredients.map((ing) => (
            <li key={ing.slug} className="flex gap-3 py-2.5 border-b border-divider text-[15px] last:border-0">
              <span className="tabular-nums text-[14px] text-brand font-medium min-w-[4.5rem]">
                {ing.amount} {UNIT_LABELS[ing.unit]}
              </span>
              <span className="text-ink-secondary">{ing.displayName}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-sans font-semibold text-[13px] text-ink-secondary mb-2">Yapılışı</h4>
        <ol className="flex flex-col gap-3 text-[15px] text-ink-secondary pl-5 list-decimal">
          {subRecipe.instructions.map((step) => (
            <li key={step.order}>{step.text}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
