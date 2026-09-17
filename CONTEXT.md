# GPSGoblin

GPSGoblin is a privacy-conscious collection of browser-based tools for GPS and
activity files. Files are processed on the person's device unless they choose
to create a share link.

## Sharing

**Share link**:
A bearer link whose URL fragment contains a compressed, versioned GPX file.
It is not stored by GPSGoblin; anyone with the link can open the contained
file.
_Avoid_: upload link, cloud share

**Sanitised share copy**:
A newly created, deliberately reduced GPX file used for optional privacy
sharing. It contains supported data outside protected areas and is distinct
from the person's unchanged original file.
_Avoid_: edited original, private mode

**Protected area**:
A circular area around a path's start or finish whose location data is omitted
from a sanitised share copy.
_Avoid_: hidden map area
