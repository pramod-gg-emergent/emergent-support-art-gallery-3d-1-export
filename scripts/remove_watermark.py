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
    'kai-voss-portfolio/uploads/7aa57ed9-8f9e-4858-96f7-474291a35146.webp',
    'kai-voss-portfolio/uploads/db6e3edd-5bc4-4093-a149-3b61414180b7.webp',
    'kai-voss-portfolio/uploads/8d9e65b4-6a2e-4bed-81b6-2c493f66a557.webp',
]

for p in PATHS:
    data = requests.get(f'{API}/api/files/{p}', timeout=60).content
    img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    h, w = img.shape[:2]
    x0, y0 = int(w * 0.86), int(h * 0.86)
    roi = img[y0:h, x0:w]
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    mask = ((gray > 120).astype(np.uint8)) * 255
    mask = cv2.dilate(mask, np.ones((7, 7), np.uint8))
    full = np.zeros((h, w), np.uint8)
    full[y0:h, x0:w] = mask
    out = cv2.inpaint(img, full, 7, cv2.INPAINT_TELEA)
    ok, buf = cv2.imencode('.webp', out, [cv2.IMWRITE_WEBP_QUALITY, 95])
    r = requests.put(f'{BASE}/objects/{p}', headers={'X-Storage-Key': key, 'Content-Type': 'image/webp'}, data=buf.tobytes(), timeout=120)
    print(p.split('/')[-1], 'masked px:', int((mask > 0).sum()), 'put:', r.status_code)
