#!/usr/bin/env python3
"""Fail CI for invalid AIHACKBins content or unresolved Git merge conflicts."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKERS = ('<<<<<<< ', '=======\n', '>>>>>>> ')
required = ['index.html', 'styles.css', 'app.js', 'README.md', 'data/entries.json', 'assets/logo.svg', 'assets/favicon.svg']
for name in required:
    assert (ROOT / name).is_file(), f'Missing required file: {name}'
for path in ROOT.rglob('*'):
    if not path.is_file() or path == Path(__file__).resolve() or '.git' in path.parts or path.suffix not in {'.json', '.md', '.js', '.css', '.html', '.svg', '.yml', '.yaml'}:
        continue
    text = path.read_text(encoding='utf-8')
    assert not any(marker in text for marker in MARKERS), f'Unresolved Git merge marker in: {path.relative_to(ROOT)}'
entries = json.loads((ROOT / 'data/entries.json').read_text(encoding='utf-8'))
assert isinstance(entries, list) and len(entries) >= 47, 'Expected at least 42 entries'
ids, slugs = set(), set()
for index, entry in enumerate(entries, 1):
    for key in ('id', 'slug', 'track', 'title', 'summary', 'objective', 'example', 'expected', 'defense', 'evidence', 'lab_status'):
        assert isinstance(entry.get(key), str) and entry[key].strip(), f'Entry {index}: missing {key}'
    assert entry.get('content_type') in {'Technique','Workflow','Case Study'}, f'Entry {index}: invalid content type'
    assert entry['track'] in {'Hacking AI', 'Hacking with AI'}, f'Entry {index}: invalid track'
    assert entry['id'] not in ids and entry['slug'] not in slugs, f'Entry {index}: duplicate id/slug'
    ids.add(entry['id']); slugs.add(entry['slug'])
    for key in ('prerequisites', 'steps', 'sources', 'tags'):
        assert isinstance(entry.get(key), list) and entry[key], f'Entry {index}: empty {key}'
    for source in entry['sources']:
        assert isinstance(source, dict) and source.get('title') and str(source.get('url', '')).startswith('https://'), f'Entry {index}: invalid reference'
for track in ('Hacking AI', 'Hacking with AI'):
    assert sum(e['track'] == track for e in entries) >= 18, f'Not enough entries in {track}'
assert sum(e['content_type'] == 'Case Study' for e in entries) >= 11
print(f'PASS: {len(entries)} entries, unique ids/slugs, no merge markers, required files present')

assert all(not x['slug'].startswith('/') for x in entries)
print('PASS: 47+ records, with Huntr and 0DIN source attribution')
