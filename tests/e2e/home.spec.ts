import { expect, test } from "@playwright/test";

test("renders the generator screen", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Coverletter");
  await expect(page.getByRole("heading", { name: "Генератор" })).toBeVisible();
  await expect(page.getByLabel("Текст вакансии")).toBeVisible();
});
