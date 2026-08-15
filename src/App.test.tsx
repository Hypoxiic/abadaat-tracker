import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { renderWithProviders } from './test/utils';

describe('App shell', () => {
  it('renders the dashboard at the root route', async () => {
    renderWithProviders(<App />);
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText('Abadaat Tracker home')).toBeInTheDocument();
  });

  it('offers a skip link for keyboard users', () => {
    renderWithProviders(<App />);
    expect(screen.getByRole('link', { name: /Skip to content/i })).toBeInTheDocument();
  });

  it('exposes a mobile bottom navigation bar (regression)', () => {
    // The previous layout hid navigation entirely below the `md` breakpoint,
    // leaving no way to move between pages on a phone.
    renderWithProviders(<App />);
    const bottomNav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(bottomNav).getAllByRole('link')).toHaveLength(5);
    expect(within(bottomNav).getByRole('link', { name: /Prayer/i })).toBeInTheDocument();
  });

  it('opens a navigation drawer from the header menu button', async () => {
    const { user } = renderWithProviders(<App />);

    await user.click(screen.getByRole('button', { name: /Open navigation menu/i }));

    const drawer = await screen.findByRole('dialog');
    expect(within(drawer).getByRole('link', { name: /History/i })).toBeInTheDocument();
    expect(within(drawer).getByRole('link', { name: /Settings/i })).toBeInTheDocument();
  });

  it('navigates between trackers', async () => {
    const { user } = renderWithProviders(<App />);
    await screen.findByRole('heading', { level: 1 });

    const bottomNav = screen.getByRole('navigation', { name: 'Primary' });
    await user.click(within(bottomNav).getByRole('link', { name: /Dhikr/i }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Remembrance' })).toBeInTheDocument();
  });

  it('shows a 404 page for an unknown route (regression)', async () => {
    renderWithProviders(<App />, { route: '/does-not-exist' });
    expect(await screen.findByText('404')).toBeInTheDocument();
  });

  it('shows the live next-prayer countdown in the header', async () => {
    renderWithProviders(<App />);
    expect(await screen.findByText(/ in \d+[hms]/i)).toBeInTheDocument();
  });
});

describe('ErrorBoundary', () => {
  const Boom: React.FC = () => {
    throw new Error('Simulated failure');
  };

  it('catches a render error instead of blanking the app', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulated failure/)).toBeInTheDocument();
    expect(screen.getByText(/your tracked data is safe/i)).toBeInTheDocument();

    spy.mockRestore();
  });

  it('renders its children when nothing throws', () => {
    renderWithProviders(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });
});
