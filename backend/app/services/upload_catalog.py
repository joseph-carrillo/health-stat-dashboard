"""Upload catalog — program hierarchy + template metadata for the upload UI."""

import json

from app.services.parser import CONFIGS_DIR, report_sheets_from_config, template_sort_order

# Sub-programs shown in the UI even when no parser config exists yet.
PROGRAMS = [
    {
        "code": "CHILD_CARE",
        "name": "Child Care",
        "sub_programs": [
            {"name": "Immunization"},
            {"name": "Management of the Sick"},
            {"name": "Nutrition"},
            {"name": "SBI (Annual)"},
        ],
    },
    {
        "code": "DEMOGRAPHICS",
        "name": "Demographics",
        "sub_programs": [
            {"name": "Demographics"},
        ],
    },
    {
        "code": "INFECTIOUS_DISEASE",
        "name": "Infectious Disease Prevention and Control",
        "sub_programs": [
            {"name": "Infectious Disease"},
        ],
    },
    {
        "code": "WASH",
        "name": "Water, Sanitation, and Hygiene (WASH)",
        "sub_programs": [
            {"name": "WASH"},
        ],
    },
]


def _load_config_templates() -> list[dict]:
    items = []
    for path in CONFIGS_DIR.glob("*.json"):
        try:
            with open(path, "r", encoding="utf-8") as fh:
                cfg = json.load(fh)
        except Exception:
            continue

        upload_meta = cfg.get("upload", {})
        display = cfg.get("display", {})
        sub_program = upload_meta.get("sub_program") or cfg.get("sub_program")
        if not sub_program:
            continue

        items.append(
            {
                "id": path.stem,
                "label": display.get("label", cfg.get("label", path.stem)),
                "program_code": cfg.get("program_code"),
                "sub_program": sub_program,
                "frequency": cfg.get("frequency", "monthly"),
                "source_file_pattern": cfg.get("source_file_pattern", ""),
                "file_number": (cfg.get("upload") or {}).get("file_number")
                or template_sort_order(cfg),
                "sort_order": template_sort_order(cfg),
                "report_sheets": report_sheets_from_config(cfg),
            }
        )
    items.sort(key=lambda t: (t["sort_order"], t["label"]))
    return items


def build_upload_catalog() -> dict:
    templates = _load_config_templates()
    programs = []

    for prog in PROGRAMS:
        sub_programs = []
        for sp in prog["sub_programs"]:
            sp_templates = [
                t
                for t in templates
                if t["program_code"] == prog["code"]
                and t["sub_program"] == sp["name"]
            ]
            entry = {
                "name": sp["name"],
                "templates": sp_templates,
            }
            if sp.get("status"):
                entry["status"] = sp["status"]
            sub_programs.append(entry)

        programs.append(
            {
                "code": prog["code"],
                "name": prog["name"],
                "sub_programs": sub_programs,
            }
        )

    return {"programs": programs}
