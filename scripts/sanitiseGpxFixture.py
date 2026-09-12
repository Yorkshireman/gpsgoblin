"""Sanitise a permissioned exporter fixture; never preserve its route or measurements.

Usage: python3 scripts/sanitiseGpxFixture.py source.gpx destination.gpx
Review the result and add source/licence/provenance notes before committing it.
"""
import argparse
import datetime
from pathlib import Path
import xml.etree.ElementTree as ET

arguments = argparse.ArgumentParser(description=__doc__)
arguments.add_argument('source', type=Path)
arguments.add_argument('destination', type=Path)
arguments.add_argument('--max-points', type=int)
options = arguments.parse_args()
source, destination = options.source, options.destination
if options.max_points is not None and options.max_points < 1:
    raise ValueError('max-points must be positive')
for _, namespace in ET.iterparse(source, events=['start-ns']):
    prefix, uri = namespace
    ET.register_namespace(prefix, uri)
root = ET.parse(source).getroot()
creator = root.get('creator', '')
if creator not in ['bikerouter.de 2025.46', 'GPSBabel - http://www.gpsbabel.org', 'StravaGPX']:
    raise ValueError('Review and explicitly allow this exporter before sanitising')
version = root.get('version', '')
point_index = 0
for parent in root.iter():
    for child in list(parent):
        if child.tag.split('}')[-1] in ['metadata', 'author', 'email', 'link', 'url', 'urlname', 'bounds', 'extensions']:
            parent.remove(child)
# Optional bounded excerpt: preserve source point order without claiming a full import.
retained_points = 0
if options.max_points is not None:
    for parent in root.iter():
        for child in list(parent):
            if child.tag.split('}')[-1] in ['trkpt', 'rtept', 'wpt']:
                retained_points += 1
                if retained_points > options.max_points:
                    parent.remove(child)
for element in root.iter():
    name = element.tag.split('}')[-1]
    element.attrib.clear()
    element.tail = None
    if element is root:
        element.attrib.update(version=version, creator=creator)
    if name in ['trkpt', 'rtept', 'wpt']:
        element.attrib.update(lat='0', lon=f'{point_index * 0.00001:.5f}')
        point_index += 1
    if name == 'ele':
        element.text = str(100 + point_index % 20)
    elif name == 'time':
        element.text = (datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc) + datetime.timedelta(seconds=point_index)).isoformat().replace('+00:00', 'Z')
    elif name in ['name', 'desc', 'cmt']:
        element.text = 'Sanitised exporter fixture'
    else:
        element.text = None
ET.indent(root, space='  ')
contents = ET.tostring(root, encoding='unicode')
destination.write_text('<?xml version="1.0" encoding="utf-8"?>\n<!-- Modified for GPSGoblin: all locations, times, measurements and descriptive data sanitised. See README.md for provenance and permission. -->\n' + contents + '\n')
print(f'{destination.name}: GPX {version}, {point_index} sanitised points')
