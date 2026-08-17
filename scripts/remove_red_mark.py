import os
import requests
import cv2
import numpy as np
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')
BASE = 'https://integrations.emergentagent.com/objstore/api/v1/storage'
API = 'https://art-gallery-3d-1.preview.emergentagent.com'

key = requests.post(f'{BASE}/init', json={'emergent_key': os.environ['EMERGENT_LLM_KEY']}, timeout=30).json()['storage_key']

PATHS = [
    'kai-voss-portfolio/uploads/3fff273f-165e-4dc8-84c3-c814f43b553a.png',
    'kai-voss-portfolio/uploads/7cc51d14-db65-49dc-954e-5da8d7514855.png',
    'kai-voss-portfolio/uploads/5484b56e-05ca-42c3-b5cd-e9077c11031f.png',
    'kai-voss-portfolio/uploads/03e68df6-ee92-4c30-98a0-517673c19940.png',
]

for p in PATHS:
    data = requests.get(f'{API}/api/files/{p}', timeout=60).content
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    h, w = img.shape[:2]
    x0, y0 = int(w * 0.86), int(h * 0.86)
    roi = img[y0:h, x0:w].astype(np.int16)
    b, g, r = cv2.split(roi)
    mask = ((r > 110) & (r > g + 40) & (r > b + 40)).astype(np.uint8) * 255
    mask = cv2.dilate(mask, np.ones((11, 11), np.uint8))
    masked_px = int((mask > 0).sum())
    if masked_px < 200:
        print(p.split('/')[-1], 'no red mark, skipped')
        continue
    full = np.zeros((h, w), np.uint8)
    full[y0:h, x0:w] = mask
    out = cv2.inpaint(img, full, 9, cv2.INPAINT_TELEA)
    ok, buf = cv2.imencode('.png', out, [cv2.IMWRITE_PNG_COMPRESSION, 6])
    r2 = requests.put(f'{BASE}/objects/{p}', headers={'X-Storage-Key': key, 'Content-Type': 'image/png'}, data=buf.tobytes(), timeout=120)
    print(p.split('/')[-1], 'masked px:', masked_px, 'put:', r2.status_code)
