#!/usr/bin/env python3
"""
fetch_sponsors.py
-----------------
Fetches the latest Register of Licensed Sponsors (Workers) CSV from GOV.UK
and saves it to the public data directory for the CanTheySponsor frontend.

The CSV URL changes daily (date-stamped filename), so this script:
  1. Scrapes the GOV.UK publication page to find the current CSV URL
  2. Downloads the CSV only if it has changed (ETag / Last-Modified check)
  3. Writes the file to public/data/sponsors.csv
  4. Writes a meta.json file with the build timestamp and source URL
  5. Exits with code 1 on any failure (so GitHub Actions marks the run as failed)

Usage:
    python fetch_sponsors.py [--out-dir public/data]
"""

import argparse
import hashlib
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from bs4 import BeautifulSoup

GOV_UK_PAGE = (
    "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers"
)
CSV_LINK_PATTERN = re.compile(
    r"https://assets\.publishing\.service\.gov\.uk/.*?\.csv", re.IGNORECASE
)
DEFAULT_OUT_DIR = "public/data"
CSV_FILENAME = "sponsors.csv"
META_FILENAME = "meta.json"

HEADERS = {
    "User-Agent": (
        "CanTheySponsor-Pipeline/1.0 "
        "(https://cantheysponsor.com; data pipeline fetching public GOV.UK data)"
    )
}


def find_csv_url(session: requests.Session) -> str:
    """Scrape the GOV.UK publication page and return the CSV download URL."""
    print(f"[1/4] Fetching publication page: {GOV_UK_PAGE}")
    resp = session.get(GOV_UK_PAGE, headers=HEADERS, timeout=30)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    # Look for all <a> tags whose href points to a CSV on assets.publishing
    csv_links = [
        a["href"]
        for a in soup.find_all("a", href=True)
        if CSV_LINK_PATTERN.match(a["href"])
    ]

    if not csv_links:
        raise RuntimeError(
            "Could not find a CSV download link on the GOV.UK page. "
            "The page structure may have changed."
        )

    # Take the first (and normally only) match
    url = csv_links[0]
    print(f"    Found CSV URL: {url}")
    return url


def file_md5(path: Path) -> str | None:
    """Return the MD5 hex digest of a file, or None if it doesn't exist."""
    if not path.exists():
        return None
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def download_csv(session: requests.Session, url: str, dest: Path) -> bool:
    """
    Download the CSV to dest. Returns True if the file changed, False if unchanged.
    Uses streaming to handle the ~12 MB file efficiently.
    """
    print(f"[2/4] Downloading CSV …")
    old_md5 = file_md5(dest)

    resp = session.get(url, headers=HEADERS, timeout=120, stream=True)
    resp.raise_for_status()

    total = int(resp.headers.get("Content-Length", 0))
    downloaded = 0
    tmp = dest.with_suffix(".tmp")

    with open(tmp, "wb") as f:
        for chunk in resp.iter_content(chunk_size=65536):
            f.write(chunk)
            downloaded += len(chunk)
            if total:
                pct = downloaded / total * 100
                print(f"\r    {downloaded:,} / {total:,} bytes ({pct:.1f}%)", end="", flush=True)

    print()  # newline after progress

    new_md5 = file_md5(tmp)
    if old_md5 and old_md5 == new_md5:
        tmp.unlink()
        print("    File unchanged (MD5 match). Skipping replacement.")
        return False

    tmp.replace(dest)
    size_mb = dest.stat().st_size / 1_048_576
    print(f"    Saved {size_mb:.1f} MB → {dest}")
    return True


def write_meta(dest_dir: Path, csv_url: str, changed: bool) -> None:
    """Write meta.json with build timestamp, source URL, and change flag."""
    print("[3/4] Writing meta.json …")
    meta = {
        "buildDate": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "buildDateHuman": datetime.now(timezone.utc).strftime("%d %B %Y"),
        "sourceUrl": csv_url,
        "sourcePageUrl": GOV_UK_PAGE,
        "csvChanged": changed,
    }
    meta_path = dest_dir / META_FILENAME
    meta_path.write_text(json.dumps(meta, indent=2))
    print(f"    Written → {meta_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch the latest sponsors CSV from GOV.UK.")
    parser.add_argument(
        "--out-dir",
        default=DEFAULT_OUT_DIR,
        help=f"Directory to write sponsors.csv and meta.json (default: {DEFAULT_OUT_DIR})",
    )
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    csv_dest = out_dir / CSV_FILENAME

    session = requests.Session()
    # Retry transient failures up to 3 times with backoff
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry

    retry = Retry(total=3, backoff_factor=2, status_forcelist=[429, 500, 502, 503, 504])
    session.mount("https://", HTTPAdapter(max_retries=retry))

    try:
        csv_url = find_csv_url(session)
        changed = download_csv(session, csv_url, csv_dest)
        write_meta(out_dir, csv_url, changed)
    except Exception as exc:
        print(f"\n[ERROR] Pipeline failed: {exc}", file=sys.stderr)
        sys.exit(1)

    print("[4/4] Done ✓")
    if not changed:
        print("    Note: CSV was already up-to-date. No commit will be created.")


if __name__ == "__main__":
    main()