#!/usr/bin/env python3
"""Local SOOP participation tracker prototype.

This CLI intentionally avoids private SOOP endpoints. Feed it events from an
official API, an authorized streamer tool, or exported logs.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import hmac
import json
import os
import sqlite3
import sys
from pathlib import Path
from typing import Any, Mapping
from urllib.parse import urlparse


DEFAULT_DB = "soop_tracker.sqlite3"
DEFAULT_SALT = "change-me-before-real-use"
BUCKET_MINUTES = 5


SCHEMA = """
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS streams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stream_url TEXT NOT NULL,
    broadcaster_id TEXT,
    started_at TEXT,
    ended_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stream_url, started_at)
);
CREATE TABLE IF NOT EXISTS broadcast_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stream_id INTEGER NOT NULL,
    captured_at TEXT NOT NULL,
    title TEXT,
    category TEXT,
    hashtags TEXT,
    viewer_count INTEGER,
    raw_json TEXT,
    FOREIGN KEY(stream_id) REFERENCES streams(id)
);
CREATE INDEX IF NOT EXISTS idx_snapshots_stream_time
    ON broadcast_snapshots(stream_id, captured_at);
CREATE TABLE IF NOT EXISTS chat_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stream_id INTEGER NOT NULL,
    sent_at TEXT NOT NULL,
    user_key TEXT NOT NULL,
    display_name TEXT,
    event_type TEXT NOT NULL DEFAULT 'chat',
    message TEXT,
    raw_json TEXT,
    FOREIGN KEY(stream_id) REFERENCES streams(id)
);
CREATE INDEX IF NOT EXISTS idx_chat_stream_time
    ON chat_events(stream_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_chat_user_time
    ON chat_events(user_key, sent_at);
"""


def connect(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def normalize_time(value: str | None) -> str:
    if not value:
        return dt.datetime.now(dt.timezone.utc).astimezone().isoformat(timespec="seconds")
    cleaned = value.strip()
    if cleaned.endswith("Z"):
        cleaned = cleaned[:-1] + "+00:00"
    parsed = dt.datetime.fromisoformat(cleaned)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt.datetime.now().astimezone().tzinfo)
    return parsed.isoformat(timespec="seconds")


def parse_broadcaster_id(stream_url: str) -> str | None:
    parsed = urlparse(stream_url)
    parts = [part for part in parsed.path.split("/") if part]
    if not parts:
        return None
    if parts[0].lower() == "station" and len(parts) > 1:
        return parts[1]
    return parts[0]


def user_key(raw_id: str, salt: str) -> str:
    digest = hmac.new(salt.encode("utf-8"), raw_id.encode("utf-8"), hashlib.sha256).hexdigest()
    return digest


def init_db(args: argparse.Namespace) -> None:
    with connect(args.db) as conn:
        conn.executescript(SCHEMA)
    print(f"Initialized {args.db}")


def get_or_create_stream(
    conn: sqlite3.Connection,
    stream_url: str,
    started_at: str | None = None,
) -> int:
    started = normalize_time(started_at) if started_at else "unknown"
    broadcaster_id = parse_broadcaster_id(stream_url)
    existing = conn.execute(
        "SELECT id FROM streams WHERE stream_url = ? AND started_at = ?",
        (stream_url, started),
    ).fetchone()
    if existing:
        return int(existing["id"])
    cur = conn.execute(
        "INSERT INTO streams(stream_url, broadcaster_id, started_at) VALUES (?, ?, ?)",
        (stream_url, broadcaster_id, started),
    )
    return int(cur.lastrowid)


def insert_snapshot(conn: sqlite3.Connection, stream_id: int, event: dict[str, Any]) -> None:
    viewer_count = event.get("viewer_count")
    if viewer_count in ("", None):
        viewer_count = None
    conn.execute(
        """
        INSERT INTO broadcast_snapshots(
            stream_id, captured_at, title, category, hashtags, viewer_count, raw_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            stream_id,
            normalize_time(event.get("timestamp") or event.get("captured_at")),
            event.get("title"),
            event.get("category"),
            normalize_tags(event.get("hashtags")),
            viewer_count,
            json.dumps(event, ensure_ascii=False, sort_keys=True),
        ),
    )


def normalize_tags(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, list):
        return ",".join(str(item).strip() for item in value if str(item).strip())
    return str(value)


def insert_chat(
    conn: sqlite3.Connection,
    stream_id: int,
    event: dict[str, Any],
    salt: str,
    store_nicknames: bool,
    store_messages: bool,
) -> bool:
    raw_user = str(event.get("user_id") or event.get("nickname") or "").strip()
    if not raw_user:
        return False
    display_name = str(event.get("nickname") or "").strip() if store_nicknames else None
    message = str(event.get("message") or "") if store_messages else None
    raw_event = sanitize_chat_event(event, store_nicknames, store_messages)
    conn.execute(
        """
        INSERT INTO chat_events(
            stream_id, sent_at, user_key, display_name, event_type, message, raw_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            stream_id,
            normalize_time(event.get("timestamp") or event.get("sent_at")),
            user_key(raw_user, salt),
            display_name,
            str(event.get("event_type") or "chat"),
            message,
            json.dumps(raw_event, ensure_ascii=False, sort_keys=True),
        ),
    )
    return True


def sanitize_chat_event(
    event: dict[str, Any],
    store_nicknames: bool,
    store_messages: bool,
) -> dict[str, Any]:
    sanitized = dict(event)
    if not store_messages:
        sanitized.pop("message", None)
    if not store_nicknames:
        sanitized.pop("nickname", None)
    sanitized.pop("user_id", None)
    return sanitized


def ingest_chat_jsonl(args: argparse.Namespace) -> None:
    salt = os.environ.get("SOOP_TRACKER_SALT", DEFAULT_SALT)
    if salt == DEFAULT_SALT:
        print("Warning: set SOOP_TRACKER_SALT before real collection.", file=sys.stderr)

    path = Path(args.file)
    if not path.exists():
        raise SystemExit(f"Input file does not exist: {path}")

    inserted_snapshots = 0
    inserted_chats = 0
    skipped = 0
    with connect(args.db) as conn:
        conn.executescript(SCHEMA)
        with path.open("r", encoding="utf-8") as handle:
            for line_no, line in enumerate(handle, start=1):
                if not line.strip():
                    continue
                try:
                    event = json.loads(line)
                except json.JSONDecodeError as exc:
                    raise SystemExit(f"Invalid JSON at line {line_no}: {exc}") from exc

                stream_url = str(event.get("stream_url") or args.stream_url or "").strip()
                if not stream_url:
                    skipped += 1
                    continue
                stream_id = get_or_create_stream(conn, stream_url, event.get("started_at"))

                if has_snapshot_data(event):
                    insert_snapshot(conn, stream_id, event)
                    inserted_snapshots += 1

                event_type = str(event.get("event_type") or "chat").lower()
                if event_type != "snapshot":
                    if insert_chat(conn, stream_id, event, salt, args.store_nicknames, args.store_messages):
                        inserted_chats += 1
                    else:
                        skipped += 1

    print(
        "Ingested "
        f"{inserted_chats} chat events, {inserted_snapshots} snapshots, {skipped} skipped."
    )


def has_snapshot_data(event: dict[str, Any]) -> bool:
    return any(key in event for key in ("title", "category", "hashtags", "viewer_count"))


def label_user(row: sqlite3.Row) -> str:
    if row["display_name"]:
        return str(row["display_name"])
    return str(row["user_key"])[:12]


def parse_time(value: str) -> dt.datetime:
    cleaned = value.strip()
    if cleaned.endswith("Z"):
        cleaned = cleaned[:-1] + "+00:00"
    parsed = dt.datetime.fromisoformat(cleaned)
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=dt.datetime.now().astimezone().tzinfo)
    return parsed


def print_rows(title: str, headers: list[str], rows: list[Mapping[str, Any]], limit: int) -> None:
    print(f"\n## {title}")
    if not rows:
        print("(no data)")
        return
    widths = [len(header) for header in headers]
    rendered: list[list[str]] = []
    for row in rows[:limit]:
        values = [str(row[header]) if row[header] is not None else "" for header in headers]
        rendered.append(values)
        widths = [max(width, len(value)) for width, value in zip(widths, values)]
    print(" | ".join(header.ljust(width) for header, width in zip(headers, widths)))
    print("-+-".join("-" * width for width in widths))
    for values in rendered:
        print(" | ".join(value.ljust(width) for value, width in zip(values, widths)))


def report(args: argparse.Namespace) -> None:
    with connect(args.db) as conn:
        top_users = conn.execute(
            """
            WITH buckets AS (
                SELECT
                    user_key,
                    COALESCE(display_name, '') AS display_name,
                    COUNT(*) AS messages,
                    MIN(sent_at) AS first_seen,
                    MAX(sent_at) AS last_seen,
                    COUNT(DISTINCT strftime('%Y-%m-%d %H:', sent_at) ||
                        printf('%02d', (CAST(strftime('%M', sent_at) AS INTEGER) / ?) * ?)
                    ) AS active_buckets
                FROM chat_events
                GROUP BY user_key, COALESCE(display_name, '')
            )
            SELECT
                CASE WHEN display_name = '' THEN substr(user_key, 1, 12) ELSE display_name END AS user,
                messages,
                active_buckets,
                first_seen,
                last_seen
            FROM buckets
            ORDER BY messages DESC, active_buckets DESC
            LIMIT ?
            """,
            (BUCKET_MINUTES, BUCKET_MINUTES, args.limit),
        ).fetchall()
        print_rows(
            "Top active users",
            ["user", "messages", "active_buckets", "first_seen", "last_seen"],
            top_users,
            args.limit,
        )

        hourly = build_hourly_engagement(conn, args.limit)
        print_rows(
            "Hourly engagement",
            ["weekday", "hour", "messages", "active_users"],
            hourly,
            args.limit,
        )

        title_affinity = conn.execute(
            """
            WITH chat_with_title AS (
                SELECT
                    ce.user_key,
                    COALESCE(ce.display_name, substr(ce.user_key, 1, 12)) AS user,
                    COALESCE((
                        SELECT bs.title
                        FROM broadcast_snapshots bs
                        WHERE bs.stream_id = ce.stream_id
                          AND bs.captured_at <= ce.sent_at
                          AND bs.title IS NOT NULL
                        ORDER BY bs.captured_at DESC
                        LIMIT 1
                    ), '(unknown)') AS title
                FROM chat_events ce
            )
            SELECT title, user, COUNT(*) AS messages
            FROM chat_with_title
            GROUP BY title, user
            ORDER BY messages DESC, title ASC
            LIMIT ?
            """,
            (args.limit,),
        ).fetchall()
        print_rows("Title affinity", ["title", "user", "messages"], title_affinity, args.limit)

        snapshots = conn.execute(
            """
            SELECT
                COALESCE(title, '(unknown)') AS title,
                MIN(viewer_count) AS min_viewers,
                MAX(viewer_count) AS max_viewers,
                ROUND(AVG(viewer_count), 1) AS avg_viewers,
                COUNT(*) AS samples
            FROM broadcast_snapshots
            WHERE viewer_count IS NOT NULL
            GROUP BY COALESCE(title, '(unknown)')
            ORDER BY avg_viewers DESC
            LIMIT ?
            """,
            (args.limit,),
        ).fetchall()
        print_rows("Viewer snapshots", ["title", "min_viewers", "max_viewers", "avg_viewers", "samples"], snapshots, args.limit)


def build_hourly_engagement(conn: sqlite3.Connection, limit: int) -> list[dict[str, Any]]:
    grouped: dict[tuple[str, str], dict[str, Any]] = {}
    rows = conn.execute("SELECT sent_at, user_key FROM chat_events").fetchall()
    for row in rows:
        sent_at = parse_time(row["sent_at"])
        key = (sent_at.strftime("%a"), sent_at.strftime("%H"))
        bucket = grouped.setdefault(
            key,
            {"weekday": key[0], "hour": key[1], "messages": 0, "_users": set()},
        )
        bucket["messages"] += 1
        bucket["_users"].add(row["user_key"])

    rendered = []
    for bucket in grouped.values():
        rendered.append(
            {
                "weekday": bucket["weekday"],
                "hour": bucket["hour"],
                "messages": bucket["messages"],
                "active_users": len(bucket["_users"]),
            }
        )
    return sorted(rendered, key=lambda item: (item["weekday"], item["hour"]))[:limit]


def export_csv(args: argparse.Namespace) -> None:
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    tables = ["streams", "broadcast_snapshots", "chat_events"]
    with connect(args.db) as conn:
        for table in tables:
            rows = conn.execute(f"SELECT * FROM {table}").fetchall()
            path = out_dir / f"{table}.csv"
            with path.open("w", encoding="utf-8-sig", newline="") as handle:
                if rows:
                    writer = csv.DictWriter(handle, fieldnames=rows[0].keys())
                    writer.writeheader()
                    writer.writerows(dict(row) for row in rows)
                else:
                    handle.write("")
            print(f"Exported {path}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="SOOP participation tracker prototype")
    parser.add_argument("--db", default=DEFAULT_DB, help=f"SQLite DB path. Default: {DEFAULT_DB}")
    subparsers = parser.add_subparsers(dest="command", required=True)

    init_parser = subparsers.add_parser("init", help="Initialize the SQLite database")
    init_parser.set_defaults(func=init_db)

    ingest_parser = subparsers.add_parser("ingest-chat-jsonl", help="Import authorized JSONL events")
    ingest_parser.add_argument("--file", required=True, help="Path to JSONL event file")
    ingest_parser.add_argument("--stream-url", help="Fallback SOOP stream URL")
    ingest_parser.add_argument(
        "--store-nicknames",
        action="store_true",
        help="Store public nicknames for human-readable reports",
    )
    ingest_parser.add_argument(
        "--store-messages",
        action="store_true",
        help="Store full message text. Default stores counts and raw event only.",
    )
    ingest_parser.set_defaults(func=ingest_chat_jsonl)

    report_parser = subparsers.add_parser("report", help="Print engagement summaries")
    report_parser.add_argument("--limit", type=int, default=20)
    report_parser.set_defaults(func=report)

    export_parser = subparsers.add_parser("export-csv", help="Export raw tables to CSV")
    export_parser.add_argument("--out-dir", default="exports")
    export_parser.set_defaults(func=export_csv)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    args.func(args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
