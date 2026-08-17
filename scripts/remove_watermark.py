import os
import sys
import requests
import cv2
import numpy as np
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')
BASE = 'https://integrations.emergentagent.com/objstore/api/v1/storage'
API = 'https://art-gallery-3d-1.preview.emergentagent.com'

key = requests.post(f'{BASE}/init', json={'emergent_key': os.environ['EMERGENT_LLM_KEY']}, timeout=30).json()['storage_key']

arts = requests.get(f'{API}/api/artworks', timeout=30).json()
paths = []
for a in arts:
    urls = [a['image']] + [m['url'] for m in a.get('media', []) if m['type'] == 'image']
    for u in urls:
        if u.startswith('/api/files/'):
            p = u.replace('/api/files/', '', 1)
            if p not in paths:
                paths.append(p)

for p in paths:
    ext = p.split('.')[-1].lower()
    if ext not in ('png', 'webp', 'jpg', 'jpeg'):
        print(p.split('/')[-1], 'skipped (not image)')
        continue
    data = requests.get(f'{API}/api/files/{p}', timeout=60).content
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    h, w = img.shape[:2]
    x0, y0 = int(w * 0.86), int(h * 0.86)
    roi = img[y0:h, x0:w]
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    mask = ((gray > 120).astype(np.uint8)) * 255
    mask = cv2.dilate(mask, np.ones((7, 7), np.uint8))
    masked_px = int((mask > 0).sum())
    if masked_px < 500:
        print(p.split('/')[-1], 'clean, skipped')
        continue
    if masked_px > 25000:
        print(p.split('/')[-1], 'SKIPPED: bright-heavy corner (likely UV/texture map), manual review needed')
        continue
    full = np.zeros((h, w), np.uint8)
    full[y0:h, x0:w] = mask
    out = cv2.inpaint(img, full, 7, cv2.INPAINT_TELEA)
    fmt = '.png' if ext == 'png' else '.webp'
    params = [cv2.IMWRITE_PNG_COMPRESSION, 6] if ext == 'png' else [cv2.IMWRITE_WEBP_QUALITY, 95]
    ok, buf = cv2.imencode(fmt, out, params)
    ct = 'image/png' if ext == 'png' else 'image/webp'
    r = requests.put(f'{BASE}/objects/{p}', headers={'X-Storage-Key': key, 'Content-Type': ct}, data=buf.tobytes(), timeout=120)
    print(p.split('/')[-1], 'masked px:', masked_px, 'put:', r.status_code)
