'use client';

import { useState, useCallback, useRef } from 'react';
import ConfirmDialog from './ConfirmDialog';

type DialogState =
  | { type: 'confirm'; message: string }
  | { type: 'alert'; message: string }
  | null;

type Resolver = (value: boolean) => void;

export function useDialog() {
  const [state, setState] = useState<DialogState>(null);
  const resolverRef = useRef<Resolver | null>(null);

  const confirm = useCallback((message: string) => {
    setState({ type: 'confirm', message });
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const alert = useCallback((message: string) => {
    setState({ type: 'alert', message });
    return new Promise<void>((resolve) => {
      resolverRef.current = () => resolve();
    });
  }, []);

  const handle = (result: boolean) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    setState(null);
    resolver?.(result);
  };

  const dialog = state ? (
    <ConfirmDialog
      open
      variant={state.type}
      message={state.message}
      onConfirm={() => handle(true)}
      onCancel={() => handle(false)}
    />
  ) : null;

  return { confirm, alert, dialog };
}
