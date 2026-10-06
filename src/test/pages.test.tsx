import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import Signs from '@/pages/Signs';
import NotFound from '@/pages/NotFound';
import Settings from '@/pages/Settings';
import SignCard from '@/components/learning/SignCard';
import { SIGNS } from '@/data/signs';

afterEach(cleanup);

/** Renders a page and lets async effects (voice loading) settle before assertions. */
const renderPage = async (ui: ReactElement, route = '/') => {
  const view = render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
  await act(async () => {});
  return view;
};

/** Shared structural accessibility assertions used by every page test. */
function expectAccessible(container: HTMLElement) {
  expect(container.querySelectorAll('h1')).toHaveLength(1);

  for (const img of container.querySelectorAll('img')) {
    expect(img.getAttribute('alt')).not.toBeNull();
  }

  for (const button of container.querySelectorAll('button')) {
    const associatedLabel =
      button.id && container.querySelector(`label[for="${button.id}"]`)?.textContent;
    const name =
      (button.textContent ?? '').trim() ||
      button.getAttribute('aria-label') ||
      button.getAttribute('aria-labelledby') ||
      associatedLabel;
    expect(name, `unnamed button: ${button.outerHTML.slice(0, 120)}`).toBeTruthy();
  }

  for (const input of container.querySelectorAll('input, textarea, select')) {
    const labelled =
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby') ||
      (input.id && container.querySelector(`label[for="${input.id}"]`));
    expect(labelled, `unlabelled field: ${input.outerHTML.slice(0, 120)}`).toBeTruthy();
  }

  const headings = [...container.querySelectorAll('h1, h2, h3')].map((h) =>
    Number(h.tagName.slice(1)),
  );
  for (let i = 1; i < headings.length; i++) {
    expect(headings[i] - headings[i - 1]).toBeLessThanOrEqual(1);
  }
}

describe('dictionary page', () => {
  it('renders the whole dictionary with accessible structure', async () => {
    const { container } = await renderPage(<Signs />, '/signs');
    expectAccessible(container);
    expect(
      screen.getByRole('heading', { level: 1, name: /sign dictionary/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/search signs/i)).toBeInTheDocument();
    expect(screen.getByText(`${SIGNS.length} results`)).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(SIGNS.length);
  });

  it('filters the list as the learner types', async () => {
    const user = userEvent.setup();
    await renderPage(<Signs />, '/signs');
    await user.type(screen.getByLabelText(/search signs/i), 'water');
    expect(screen.getByRole('heading', { level: 3, name: /water/i })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeLessThan(SIGNS.length);
  });

  it('explains an empty result set instead of showing a blank grid', async () => {
    const user = userEvent.setup();
    await renderPage(<Signs />, '/signs');
    await user.type(screen.getByLabelText(/search signs/i), 'qqqqzzzz');
    expect(screen.getByText(/no signs match/i)).toBeInTheDocument();
  });
});

describe('sign card', () => {
  it('links to the sign detail page and names the destination', async () => {
    const hello = SIGNS.find((s) => s.id === 'hello')!;
    await renderPage(<SignCard sign={hello} />);
    const link = screen.getByRole('link', { name: new RegExp(`lesson for ${hello.word}`, 'i') });
    expect(link).toHaveAttribute('href', '/sign/hello');
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(hello.word);
  });
});

describe('not found page', () => {
  it('offers a way back home', async () => {
    const { container } = await renderPage(<NotFound />, '/nope');
    expectAccessible(container);
    expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /sign dictionary/i })).toHaveAttribute('href', '/signs');
  });
});

describe('settings page', () => {
  it('exposes labelled switches and radio groups', async () => {
    const { container } = await renderPage(<Settings />, '/settings');
    expectAccessible(container);
    expect(screen.getByRole('heading', { level: 1, name: /settings/i })).toBeInTheDocument();

    const switches = screen.getAllByRole('switch');
    expect(switches.length).toBeGreaterThanOrEqual(5);
    for (const s of switches) expect(s).toHaveAttribute('aria-checked');

    expect(screen.getByRole('radiogroup', { name: /font size/i })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: /animation speed/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/preferred speech voice/i)).toBeInTheDocument();
  });

  it('toggles a preference when the switch is used', async () => {
    const user = userEvent.setup();
    await renderPage(<Settings />, '/settings');
    const darkMode = screen.getByRole('switch', { name: /dark mode/i });
    const before = darkMode.getAttribute('aria-checked');
    await user.click(darkMode);
    expect(darkMode.getAttribute('aria-checked')).not.toBe(before);
    await user.click(darkMode);
    expect(darkMode.getAttribute('aria-checked')).toBe(before);
  });
});
