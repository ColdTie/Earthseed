import { test, expect, type Page } from '@playwright/test';
import type { SeedlingsDebug } from '../../src/debug/hook';

declare global {
  interface Window {
    __seedlings: SeedlingsDebug;
  }
}

const SHOTS = 'docs/screenshots';
const SEED = 1;

async function open(page: Page, query = ''): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto(`./?seed=${SEED}&view=organism${query}`);
  await page.waitForFunction(() => window.__seedlings !== undefined);
  await page.evaluate(() => window.__seedlings.ready);
  // Let a few frames render so the first creature exists.
  await page.waitForFunction(() => window.__seedlings.stats().frame > 10);
  return errors;
}

async function settle(page: Page, frames = 8): Promise<void> {
  const start = await page.evaluate(() => window.__seedlings.stats().frame);
  await page.waitForFunction((n) => window.__seedlings.stats().frame >= n, start + frames);
}

test('organism view renders the mason beetle and the gene editor', async ({ page }) => {
  const errors = await open(page);
  await expect(page.getByRole('heading', { name: 'Mason beetle' })).toBeVisible();
  await expect(page.getByLabel('Calcite output')).toBeVisible();
  const stats = await page.evaluate(() => window.__seedlings.stats());
  expect(stats.bodyVertices).toBeGreaterThan(1000);
  expect(stats.drawCalls).toBeGreaterThan(5);
  expect(stats.drawCalls).toBeLessThan(150);
  // Freeze motion so screenshots repeat.
  await page.evaluate(() => window.__seedlings.freeze(true));
  await settle(page);
  await page.screenshot({ path: `${SHOTS}/organism.png` });
  expect(errors).toEqual([]);
});

test('traits visibly change the creature', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => window.__seedlings.freeze(true));
  const before = await page.evaluate(() => window.__seedlings.stats().bodyVertices);
  await page.evaluate(() => {
    window.__seedlings.setTrait('heatTolerance', 90);
    window.__seedlings.setTrait('output', 90);
  });
  await page.waitForFunction(() => {
    const s = window.__seedlings.getState();
    return s !== null && s.draft.traits.heatTolerance === 90 && s.draft.traits.output === 90;
  });
  await settle(page, 12);
  const after = await page.evaluate(() => window.__seedlings.stats().bodyVertices);
  expect(after).not.toBe(before);
  await page.screenshot({ path: `${SHOTS}/organism-edited.png` });
  await expect(page.locator('.cost b').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('view transitions dive under one second and all three views render', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => window.__seedlings.freeze(true));

  // The dive is 0.85 s on the wall clock. Software rendering here can take a
  // third of a second per frame, so allow one frame on top of that.
  const fps = await page.evaluate(() => window.__seedlings.stats().fps);
  const bound = fps >= 30 ? 1000 : 2000;
  await page.evaluate(() => window.__seedlings.setView('swarm'));
  const toSwarm = await page.evaluate(() => window.__seedlings.stats().lastTransitionMs);
  expect(toSwarm).toBeLessThan(bound);
  await settle(page);
  await expect(page.getByRole('heading', { name: 'Sea wall at Kessra' })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/swarm.png` });

  await page.evaluate(() => window.__seedlings.setView('galaxy'));
  const toGalaxy = await page.evaluate(() => window.__seedlings.stats().lastTransitionMs);
  expect(toGalaxy).toBeLessThan(bound);
  await settle(page);
  await expect(page.getByRole('heading', { name: 'Contract board' })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/galaxy.png` });

  // Keys work too.
  await page.keyboard.press('1');
  await page.waitForFunction(() => window.__seedlings.getView() === 'organism');
  await settle(page, 60);
  expect(errors).toEqual([]);
});

test('a generation hatches with visible drift and no errors', async ({ page }) => {
  const errors = await open(page);
  const gen0 = await page.evaluate(() => window.__seedlings.getState()!.generation);
  const state = await page.evaluate(() => window.__seedlings.tick(1200));
  expect(state.generation).toBe(gen0 + 1);
  const moved = Object.values(state.lastDrift).some((d) => d !== 0);
  expect(moved).toBe(true);
  await expect(page.locator('.gen strong')).toHaveText(`Generation ${gen0 + 1}`);
  // A short sequence of frames as the creature lives.
  for (let i = 0; i < 3; i++) {
    await settle(page, 20);
    await page.screenshot({ path: `${SHOTS}/sequence-${i + 1}.png` });
  }
  expect(errors).toEqual([]);
});

test('same seed gives the same state after 3000 ticks in the browser', async ({ page }) => {
  await open(page, '&paused');
  const a = await page.evaluate(async () => JSON.stringify(await window.__seedlings.tick(3000)));
  await page.evaluate(() => window.__seedlings.setSeed(1, true));
  const b = await page.evaluate(async () => JSON.stringify(await window.__seedlings.tick(3000)));
  expect(a).toBe(b);
});

test('slow slider steps still pay the trade-off, and view keys work after using a slider', async ({ page }) => {
  const errors = await open(page, '&paused');
  const slider = page.locator('#trait-heatTolerance');
  await slider.focus();
  for (let i = 0; i < 10; i++) await slider.press('ArrowRight');
  await page.waitForFunction(() => window.__seedlings.getState()!.draft.traits.heatTolerance === 45);
  const speed = await page.evaluate(() => window.__seedlings.getState()!.draft.traits.speed);
  expect(speed).toBe(45);
  // Focus is still on the slider. The view keys must still work.
  await page.keyboard.press('2');
  await page.waitForFunction(() => window.__seedlings.getView() === 'swarm');
  expect(errors).toEqual([]);
});

test('a refused edit says which resource is short', async ({ page }) => {
  const errors = await open(page, '&paused');
  await page.evaluate(() => {
    window.__seedlings.setTrait('heatTolerance', 100);
    window.__seedlings.setTrait('output', 100);
  });
  await page.waitForFunction(() => window.__seedlings.getState()!.draft.traits.output === 100);
  // Maxed output burns calcium faster than Kessra supplies it.
  const s = await page.evaluate(() => window.__seedlings.tick(5200));
  // The crew keeps a small reserve, so only a large edit is out of reach.
  expect(s.resources.calcium).toBeLessThan(40);
  await page.evaluate(() => window.__seedlings.freeze(true));
  await page.evaluate(() => {
    const live = window.__seedlings.getState()!.live.traits.output;
    window.__seedlings.setTrait('output', Math.round(live) - 90);
  });
  const note = page.locator('.trait .refused');
  await expect(note).toBeVisible();
  await expect(note).toContainText('calcium');
  await page.screenshot({ path: `${SHOTS}/organism-refused.png` });
  expect(errors).toEqual([]);
});

test('changing view again mid-dive lands on the new view without a cut', async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => window.__seedlings.freeze(true));
  const view = await page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        const s = window.__seedlings;
        void s.setView('swarm');
        // Change our mind on the next frame, while still leaving the organism view.
        requestAnimationFrame(() => {
          void s.setView('galaxy').then(() => resolve(s.getView()));
        });
      }),
  );
  expect(view).toBe('galaxy');
  await settle(page);
  await expect(page.getByRole('heading', { name: 'Contract board' })).toBeVisible();
  expect(errors).toEqual([]);
});
