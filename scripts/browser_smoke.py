#!/usr/bin/env python3
"""Real Chromium smoke tests against the packaged static website over localhost.

Requires playwright + its Chromium browser. No LLM target is contacted.
"""
import os
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()
base = f'http://127.0.0.1:{server.server_address[1]}/'
try:
    with sync_playwright() as pw:
        launch={'headless': True, 'args':['--no-sandbox','--disable-dev-shm-usage']}
        if os.environ.get('CHROMIUM_PATH'):
            launch['executable_path']=os.environ['CHROMIUM_PATH']
        browser=pw.chromium.launch(**launch)
        for width,height in ((1366,850),(1024,768),(390,844)):
            context=browser.new_context(viewport={'width':width,'height':height}, reduced_motion='reduce', accept_downloads=True)
            page=context.new_page()
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(base+'#/',wait_until='domcontentloaded',timeout=15000)
            page.locator('#hero-query').wait_for(timeout=15000)
            assert page.locator('#topnav .tnav-link').count()==11
            assert page.locator('.topnav .tnav-link[href="#/atlas"]').is_visible() == (width>760)
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), 'unexpected horizontal document overflow'
            page.locator('#hero-query').fill('RC-221')
            page.locator('#hero-query').press('Enter')
            page.locator('#payload-search').wait_for(timeout=10000)
            assert page.locator('#payload-search').input_value()=='RC-221'
            assert 'RC-221' in page.locator('#payload-preview').inner_text()
            page.locator('#payload-search').fill('NO_MATCH_123XYZ')
            assert 'No matching payload' in page.locator('#payload-preview').inner_text()
            assert page.evaluate('location.hash')=='#/payloads'
            page.locator('#payload-search').fill('RC-213')
            assert page.evaluate('location.hash')=='#/payloads/RC-213'
            href=page.locator('.payload-download').first.get_attribute('href')
            assert href and (ROOT/href.lstrip('/')).is_file(),f'missing downloadable asset {href}'
            page.locator('#payload-search').fill('RC-208')
            assert page.locator('#payload-variant option').count()>1
            old=page.locator('#payload-visible-text').inner_text()
            page.locator('#payload-variant').select_option(index=1)
            assert page.locator('#payload-visible-text').inner_text()!=old
            # Exercise UI feedback rather than assuming clipboard permission in every browser.
            page.locator('#payload-copy').click()
            page.locator('#payload-copy').get_by_text('Copied!',exact=False).wait_for(timeout=3000)
            page.goto(base+'#/glossary')
            assert 'AITG' in page.locator('#main').inner_text()
            page.goto(base+'#/baseline')
            page.locator('#baseline-export').wait_for(timeout=5000)
            page.locator('#baseline-target').select_option('Agent')
            assert page.locator('.baseline-check').count() == 8, 'agent assessment shortlist'
            page.locator('#baseline-target').select_option('All')
            assert page.locator('.baseline-check').count() == 32, 'all 32 AITG objectives remain reachable'
            with page.expect_download(timeout=5000) as dl:
                page.locator('#baseline-md-export').click()
            assert dl.value.suggested_filename == 'AIHACKBins-assessment-notes.md'
            page.locator('.baseline-review').first.select_option('passed')
            assert page.locator('.baseline-review').first.input_value()=='passed'
            with page.expect_download(timeout=5000) as dl:
                page.locator('#baseline-export').click()
            assert dl.value.suggested_filename.endswith('.csv')
            page.goto(base+'#/technique/RC-221')
            page.locator('#tech-evidence-export').wait_for(timeout=5000)
            with page.expect_download(timeout=5000) as dl:
                page.locator('#tech-evidence-export').click()
            assert dl.value.suggested_filename == 'AIHACKBins-RC-221-evidence-note.md'
            page.goto(base+'#/about')
            assert 'Responsible use and disclaimer' in page.locator('#main').inner_text()
            assert page.locator('.site-disclaimer a').count() == 1
            page.goto(base+'#/lab/RC-221')
            assert 'RC-221' in page.locator('#main').inner_text()
            page.goto(base+'#/')
            page.locator('#theme-btn').click()
            assert page.locator('html').get_attribute('data-theme') in ('light','dark')
            if width<=760:
                page.locator('#hamburger').click()
                assert page.locator('#mobile-menu').is_visible()
                page.locator('#hamburger').click()
                assert not page.locator('#mobile-menu').is_visible()
            assert not errors,repr(errors)
            print(f'PASS: Chromium {width}px homepage, search, empty results, variants, copy, fixture, glossary, baseline export, lab, theme, mobile menu')
            context.close()
        browser.close()
finally:
    server.shutdown()
    server.server_close()
