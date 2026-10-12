#!/usr/bin/env python3
"""Create a static Atom feed from data/changelog.json."""
from pathlib import Path
from datetime import date
import json,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
rows=json.loads((ROOT/'data/changelog.json').read_text(encoding='utf-8'))
NS='http://www.w3.org/2005/Atom';ET.register_namespace('',NS)
def el(parent,name,value=None):
 node=ET.SubElement(parent,'{'+NS+'}'+name)
 if value is not None:node.text=str(value)
 return node
feed=ET.Element('{'+NS+'}feed');el(feed,'id','https://aihackbins.org/feed.xml');el(feed,'title','AIHACKBins updates');el(feed,'link').set('href','https://aihackbins.org/feed.xml')
updated=max((str(x['date']) for x in rows),default=date.today().isoformat())
el(feed,'updated',updated+'T00:00:00Z')
for x in sorted(rows,key=lambda r:r['date'],reverse=True):
 entry=el(feed,'entry');url='https://aihackbins.org/#/technique/'+x['id'];el(entry,'title',x['title']);el(entry,'id',url+'?date='+x['date']);el(entry,'link').set('href',url);el(entry,'updated',x['date']+'T00:00:00Z');el(entry,'summary',x['summary'])
ET.indent(feed)
(ROOT/'feed.xml').write_bytes(ET.tostring(feed,encoding='utf-8',xml_declaration=True))
print('feed.xml generated')
