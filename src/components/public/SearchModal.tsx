'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type SearchResult = {
  title: string;
  description: string;
  url: string;
  type: string;
  icon: string;
};

function normalizeUrl(url: string): string {
  return url
    .replace('index.php', '/')
    .replace('index.html', '/')
    .replace('sermons.php', '/sermons')
    .replace('events.php', '/events')
    .replace('ministries.php', '/ministries')
    .replace('ministries.html', '/ministries')
    .replace('leadership.php', '/leadership')
    .replace('discipleship.html', '/discipleship')
    .replace('contacts.html', '/contact')
    .replace('galley.php', '/gallery')
    .replace('galley.html', '/gallery');
}

export default function SearchModal() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  async function performSearch(query: string) {
    if (query.length < 2) {
      setShowResults(false);
      return;
    }
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.results || []);
    setShowResults(true);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.querySelector('#globalSearchInput') as HTMLInputElement;
    performSearch(input.value.trim());
  }

  return (
    <div className="modal fade" id="searchModal" tabIndex={-1} aria-labelledby="searchModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="searchModalLabel">
              Search
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form id="globalSearchForm" className="search-form" onSubmit={handleSubmit}>
              <div className="input-group input-group-lg">
                <input
                  type="text"
                  className="form-control"
                  id="globalSearchInput"
                  placeholder="Search sermons, events, ministries, discipleship programs..."
                  autoComplete="off"
                  onInput={(e) => performSearch((e.target as HTMLInputElement).value.trim())}
                />
                <button className="btn btn-primary" type="submit">
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </form>
            {showResults && (
              <div id="searchResults" className="search-results mt-4">
                <h6 className="mb-3">Search Results:</h6>
                <ul id="searchResultsList" className="list-unstyled">
                  {results.length === 0 ? (
                    <li className="text-muted">No results found. Try different keywords.</li>
                  ) : (
                    results.map((result, i) => (
                      <li key={i} className="mb-2">
                        <Link
                          href={normalizeUrl(result.url)}
                          className="search-result-link text-decoration-none"
                          data-bs-dismiss="modal"
                        >
                          <i className={`bi bi-${result.icon} me-2`}></i>
                          <strong>{result.title}</strong>
                          {result.description && (
                            <span className="d-block small text-muted ms-4">{result.description}</span>
                          )}
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
