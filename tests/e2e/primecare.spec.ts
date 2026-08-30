import { expect, test } from "@playwright/test";

function openDate(projectName: string) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + (projectName.startsWith("mobile") ? 4 : 2));
  while (date.getUTCDay() === 0) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

test("public home and appointment pages expose the primary journey", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/PrimeCare/i);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/your smile/i);
  await expect(page.getByRole("link", { name: /book now/i }).first()).toBeVisible();

  await page.goto("/appointment", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: /request your dental appointment/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /request appointment/i })).toBeDisabled();
});

test("patient can book, find, and cancel an appointment", async ({ page }, testInfo) => {
  const email = `e2e-${testInfo.project.name}@example.com`;
  await page.goto("/appointment", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/full name/i).fill("PrimeCare Test Patient");
  await page.getByLabel(/^email/i).fill(email);
  await page.getByLabel(/^phone/i).fill("+1 555 010 2200");
  await page.getByLabel(/preferred date/i).fill(openDate(testInfo.project.name));

  const time = page.getByLabel(/preferred time/i);
  await expect(time).toBeEnabled();
  await expect(time.locator("option").nth(1)).toBeAttached();
  await time.selectOption({ index: 1 });
  await page.getByLabel(/i consent/i).check();
  await page.getByRole("button", { name: /request appointment/i }).click();

  await expect(page.getByRole("status")).toContainText(/appointment request was saved/i);
  const reference = (await page.locator(".appointment-reference").textContent())?.trim();
  expect(reference).toMatch(/^PC-/);

  await page.getByRole("link", { name: /check or cancel this appointment/i }).click();
  await page.getByLabel(/appointment reference/i).fill(reference!);
  await page.getByLabel(/email used for booking/i).fill(email);
  await page.getByRole("button", { name: /check appointment/i }).click();
  await expect(page.getByRole("status")).toHaveText("Appointment found.");
  await expect(page.locator(".appointment-status-card")).toContainText("PrimeCare Test Patient");

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /cancel appointment/i }).click();
  await expect(page.getByRole("status")).toHaveText("The appointment was cancelled.");
  await expect(page.locator(".appointment-status-card .badge")).toHaveText("cancelled");
});

test("administrator route requires authentication and accepts valid credentials", async ({ page }) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  expect(email, "ADMIN_EMAIL must be configured for browser tests").toBeTruthy();
  expect(password, "ADMIN_PASSWORD must be configured for browser tests").toBeTruthy();
  await page.goto("/admin", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard overview" })).toBeVisible();
});
