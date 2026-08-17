import os
import io
import requests
from PIL import Image
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')
BASE = 'https://integrations.emergentagent.com/objstore/api/v1/storage'
API = 'https://art-gallery-3d-1.preview.emergentagent.com'
SKIP = {'0bf1e12a-d8e2-413e-bd7f-c8be3ee55066'}  # damaged knife UV, awaiting re-upload

key = requests.post(f'{BASE}/init', json={'emergent_key': os.environ['EMERGENT_LLM_KEY']}, timeout=30).json()['storage_key']
mdb = MongoClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']]

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
    uid = p.split('/')[-1].split('.')[0]
    if uid in SKIP:
        print(uid[:8], 'skipped (flagged)')
        continue
    data = requests.get(f'{API}/api/files/{p}', timeout=120).content
    img = Image.open(io.BytesIO(data))
    w, h = img.size
    if p.endswith('.webp') and max(w, h) <= 2560:
        print(uid[:8], 'already optimized', f'{w}x{h}')
        continue
    has_alpha = img.mode in ('RGBA', 'LA') and img.getextrema()[-1][0] < 255
    if max(w, h) > 2560:
        ratio = 2560 / max(w, h)
        img = img.resize((round(w * ratio), round(h * ratio)), Image.LANCZOS)
    buf = io.BytesIO()
    if has_alpha:
        img.save(buf, 'PNG')
        ct = 'image/png'
    else:
        img.convert('RGB').save(buf, 'WEBP', quality=88)
        ct = 'image/webp'
    r = requests.put(f'{BASE}/objects/{p}', headers={'X-Storage-Key': key, 'Content-Type': ct}, data=buf.getvalue(), timeout=120)
    mdb.files.update_one({'storage_path': p}, {'$set': {'content_type': ct, 'size': len(buf.getvalue())}})
    print(uid[:8], f'{w}x{h} ->', img.size, ct, len(data)//1024, 'KB ->', len(buf.getvalue())//1024, 'KB | put:', r.status_code)
