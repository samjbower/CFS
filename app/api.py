from flask import Blueprint, request, jsonify
from .services.usgs import fetch_usgs_iv
from .services.cdss import fetch_cdss_iv

bp = Blueprint("api", __name__)

# ---- USGS ----
@bp.get("/usgs_latest")
def usgs_latest():
    site = request.args.get("site")
    period = request.args.get("period", "P2D")
    if not site:
        return jsonify({"error":"site is required"}), 400
    df, info = fetch_usgs_iv(sites=site, parameters="00060", period=period)
    if df.empty:
        return jsonify({"siteName": (info[0]["site name"] if info else site),
                        "units": (info[0]["units"] if info else "cfs"),
                        "value": None, "datetime": None,
                        "latitude": (info[0].get("latitude") if info else None),
                        "longitude": (info[0].get("longitude") if info else None)})
    latest = df.iloc[-1]
    meta = info[0] if info else {}
    return jsonify({
        "siteName": meta.get("site name"),
        "units": meta.get("units") or "cfs",
        "value": float(latest["value"]) if latest["value"] is not None else None,
        "datetime": latest["datetime"].isoformat(),
        "latitude": meta.get("latitude"),
        "longitude": meta.get("longitude"),
    })

@bp.get("/usgs_series")
def usgs_series():
    site = request.args.get("site")
    period = request.args.get("period", "P2D")
    if not site:
        return jsonify({"error":"site is required"}), 400
    df, _ = fetch_usgs_iv(sites=site, parameters="00060", period=period)
    series = [{"dt": r["datetime"].isoformat(), "val": (None if pd.isna(r["value"]) else float(r["value"]))}
              for _, r in df.iterrows()] if not df.empty else []
    return jsonify({"series": series})

# ---- CDSS ----
@bp.get("/cdss_latest")
def cdss_latest():
    abbrev = request.args.get("abbrev")
    interval = request.args.get("interval", "raw")
    start = request.args.get("start", None)
    end = request.args.get("end", None)
    # default: last 2 days if not provided
    if not (start and end):
        import datetime as dt
        end = dt.datetime.utcnow().date().isoformat()
        start = (dt.date.fromisoformat(end) - dt.timedelta(days=2)).isoformat()
    df, info = fetch_cdss_iv(abbrev=abbrev, parameter="DISCHRG", interval=interval, startDate=start, endDate=end)
    meta = info[0] if info else {"site name": abbrev, "units": "cfs"}
    if df.empty:
        return jsonify({"siteName": meta.get("site name"),
                        "units": meta.get("units") or "cfs",
                        "value": None, "datetime": None,
                        "latitude": meta.get("latitude"), "longitude": meta.get("longitude")})
    latest = df.iloc[-1]
    return jsonify({
        "siteName": meta.get("site name"),
        "units": meta.get("units") or "cfs",
        "value": float(latest["value"]) if latest["value"] is not None else None,
        "datetime": latest["datetime"].isoformat(),
        "latitude": meta.get("latitude"),
        "longitude": meta.get("longitude"),
    })

@bp.get("/cdss_series")
def cdss_series():
    abbrev = request.args.get("abbrev")
    interval = request.args.get("interval", "raw")
    days = int(request.args.get("days", 2))
    import datetime as dt
    end = dt.datetime.utcnow().date().isoformat()
    start = (dt.date.fromisoformat(end) - dt.timedelta(days=days)).isoformat()
    df, _ = fetch_cdss_iv(abbrev=abbrev, parameter="DISCHRG", interval=interval, startDate=start, endDate=end)
    series = [{"dt": r["datetime"].isoformat(), "val": (None if pd.isna(r["value"]) else float(r["value"]))}
              for _, r in df.iterrows()] if not df.empty else []
    return jsonify({"series": series})

# pandas imported locally above
import pandas as pd  # noqa: E402

