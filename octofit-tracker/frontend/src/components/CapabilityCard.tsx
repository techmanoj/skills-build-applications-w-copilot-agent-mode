import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  emptyMessage: string;
  isEmpty: (data: T) => boolean;
  children: (data: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, endpoint, emptyMessage, isEmpty, children }: Props<T>) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    getJson<T>(endpoint).then((result) => {
      if (active) setData(result);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Unknown error');
    });
    return () => {
      active = false;
    };
  }, [endpoint]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {error ? <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>
      : data === undefined ? <p role="status">Loading {title.toLowerCase()}...</p>
        : isEmpty(data) ? <p>{emptyMessage}</p>
          : children(data)}
  </div></section>;
}
