import os
import io
import requests
import cv2
import numpy as np
from PIL import Image, ImageEnhance
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')
BASE = 'https://integrations.emergentagent.com/objstore/api/v1/storage'
PATH = 'kai-voss-portfolio/uploads/b549d78e-b397-4d06-b5b7-e53e93722d76.webp'

key = requests.post(f'{BASE}/init', json={'emergent_key': os.environ['EMERGENT_LLM_KEY']}, timeout=30).json()['storage_key']

raw = open('/tmp/bat_a5.webp', 'rb').read()

img_pil = Image.open(io.BytesIO(raw)).convert('RGB')
img_pil = ImageEnhance.Contrast(img_pil).enhance(1.06)
img_pil = ImageEnhance.Color(img_pil).enhance(1.08)
img_pil = ImageEnhance.Sharpness(img_pil).enhance(1.35)
img_pil = ImageEnhance.Brightness(img_pil).enhance(1.02)
buf = io.BytesIO()
img_pil.save(buf, 'WEBP', quality=95)
graded = buf.getvalue()

img = cv2.imdecode(np.frombuffer(graded, np.uint8), cv2.IMREAD_COLOR)
h, w = img.shape[:2]
x0, y0 = int(w * 0.88), int(h * 0.88)
roi = img[y0:h, x0:w].astype(np.int16)
b, g, r = cv2.split(roi)
white = ((r > 145) & (g > 145) & (b > 145)).astype(np.uint8) * 255
n, labels, stats, _ = cv2.connectedComponentsWithStats(white)
mask = np.zeros_like(white)
for i in range(1, n):
    if stats[i, cv2.CC_STAT_AREA] > 25:
        mask[labels == i] = 255
mask = cv2.dilate(mask, np.ones((9, 9), np.uint8))
print('white-cluster mask px:', int((mask > 0).sum()))
full = np.zeros((h, w), np.uint8)
full[y0:h, x0:w] = mask
out = cv2.inpaint(img, full, 7, cv2.INPAINT_TELEA)
ok, enc = cv2.imencode('.webp', out, [cv2.IMWRITE_WEBP_QUALITY, 95])
resp = requests.put(f'{BASE}/objects/{PATH}', headers={'X-Storage-Key': key, 'Content-Type': 'image/webp'}, data=enc.tobytes(), timeout=120)
print('put:', resp.status_code)
cv2.imwrite('/app/scripts/cc_bat5_fixed.png', out[int(h*0.7):h, int(w*0.7):w])
