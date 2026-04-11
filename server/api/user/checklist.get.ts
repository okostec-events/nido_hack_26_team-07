import { requireUser } from "../../utils/auth";
import { ensureSchema, getDb } from "../../utils/db";

type ChecklistRow = {
  item_index: number;
};

export default defineEventHandler(async (event) => {
  await ensureSchema();
  const user = await requireUser(event);
  const db = getDb();

  const rows = await db<ChecklistRow[]>`
    SELECT item_index
    FROM user_checklist_items
    WHERE user_id = ${user.id}
    ORDER BY item_index ASC
  `;

  return {
    completedIndexes: rows.map((row) => Number(row.item_index)),
  };
});
