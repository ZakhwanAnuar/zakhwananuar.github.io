"""Regenerate all derived site files after editing data/*.js."""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]

for name in ('generate_routes.py', 'generate_sitemap.py', 'generate_rss.py'):
    subprocess.run([sys.executable, str(ROOT / 'scripts' / name)], check=True)

print('Updated routes, sitemap, and RSS feed.')
