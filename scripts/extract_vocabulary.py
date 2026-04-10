#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    print("Install pypdf: pip install pypdf", file=sys.stderr)
    sys.exit(1)

PDF_DEFAULT = Path.home() / "Downloads/Collins_Korean_3000_words_and_phrases.pdf"
OUT_DEFAULT = Path(__file__).resolve().parent.parent / "public" / "vocabulary.json"

_NATIVE_NUM = re.compile(
    r"(\d+)\s+([\uac00-\ud7af]+(?:/[\uac00-\ud7af]+)?)\s+\(([^)]+)\)"
)
_SINO_NUM = re.compile(r"(\d+)\s+([\uac00-\ud7af]+)\s+([a-z]+)")


def expand_compound_number_entries(raw: list[dict[str, str]]) -> list[dict[str, str]]:
    out: list[dict[str, str]] = []
    for e in raw:
        topic = e.get("topic", "")
        ko = (e.get("ko") or "").strip()
        if topic != "numbers" or not ko:
            out.append(e)
            continue
        if "(" in ko:
            native = _NATIVE_NUM.findall(ko)
            if len(native) >= 2:
                for num, hangul, rom in native:
                    out.append(
                        {
                            "topic": topic,
                            "en": f"{num} (native Korean)",
                            "ko": hangul.strip(),
                            "rom": rom.strip(),
                        }
                    )
                continue
        sino = _SINO_NUM.findall(ko)
        if len(sino) >= 2:
            for num, hangul, rom in sino:
                out.append(
                    {
                        "topic": topic,
                        "en": f"{num} (Sino-Korean)",
                        "ko": hangul,
                        "rom": rom.strip(),
                    }
                )
            continue
        out.append(e)
    return out


def main() -> None:
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else PDF_DEFAULT
    out_path = Path(sys.argv[2]) if len(sys.argv) > 2 else OUT_DEFAULT
    if not pdf_path.is_file():
        print(f"PDF not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)

    r = PdfReader(str(pdf_path))
    lines: list[str] = []
    for p in r.pages:
        for l in (p.extract_text() or "").splitlines():
            s = l.strip()
            if s:
                lines.append(s)

    hangul_re = re.compile(r"[\uac00-\ud7af]")

    def has_hangul(s: str) -> bool:
        return bool(hangul_re.search(s))

    def is_page_number(s: str) -> bool:
        return s.isdigit() and len(s) <= 3

    def is_section_header(s: str) -> bool:
        return "|" in s and has_hangul(s)

    def looks_like_english_line(s: str) -> bool:
        if not s or has_hangul(s):
            return False
        if s.lower() in ("vocabulary", "introduction", "contents"):
            return True
        if s.startswith("http") or "www." in s.lower():
            return True
        if len(s) > 80:
            return True
        if s[0].isupper():
            if s.endswith(("?", "!", ".")) or "," in s or "'" in s or "…" in s:
                return True
            if " " in s:
                return True
            if len(s) > 12:
                return True
        low = s.lower()
        starters = (
            "i ",
            "i'm",
            "i’ve",
            "you ",
            "we ",
            "the ",
            "a ",
            "an ",
            "how ",
            "what ",
            "when ",
            "where ",
            "who ",
            "why ",
            "can ",
            "do ",
            "does ",
            "is ",
            "are ",
            "was ",
            "were ",
            "have ",
            "has ",
            "please",
            "thank",
            "excuse",
            "sorry",
            "good ",
            "see ",
            "no,",
            "yes,",
            "it’s",
            "it's",
            "there ",
            "this ",
            "that ",
            "these ",
            "those ",
            "my ",
            "your ",
            "our ",
            "their ",
        )
        if any(low.startswith(st) for st in starters):
            return True
        if re.match(r"^to\s+[a-z]", low):
            return True
        return False

    def korean_rom_syllable_token(t: str) -> bool:
        t = t.lower().strip(".,'’\"!?…:")
        if len(t) <= 1:
            return False
        if re.search(
            r"(da|deo|di|yo|yeo|yeoy|mnida|seumnida|hamnida|hada|hago|hage|haji|seyo|nikka|mnikka|"
            r"eoyo|aeyo|ayo|ieyo|eyo|jyo|wae|seo|seo\?|mnida|sseumnida|getda|ssda|tta|da\?|ji|gi|eu|reul|eul|"
            r"ro|eseo|eseoyo|cheoreom|deutda|sida|ida)$",
            t,
        ):
            return True
        if re.search(r"(eu|eo|ae|ui|wo|we|yi)", t) and len(t) >= 4:
            return True
        if len(t) >= 10:
            return True
        return False

    def probably_romanization(s: str) -> bool:
        if has_hangul(s) or "|" in s:
            return False
        if is_page_number(s):
            return False
        if looks_like_english_line(s):
            return False
        if not re.match(r"^[a-zA-Z0-9\s,.'’\-!?…:/+&®]+$", s):
            return False
        toks = s.split()
        if not toks:
            return False
        if len(toks) == 1:
            t = toks[0]
            if t[0].isupper() and len(t) > 4 and not s.endswith("."):
                return False
            return True
        if any(korean_rom_syllable_token(t) for t in toks):
            return True
        return False

    skip_substr = (
        "HarperCollins",
        "Collins®",
        "ISBN",
        "Published by",
        "Westerhill",
        "Bishopbriggs",
        "Glasgow",
        "Ireland",
        "Facebook",
        "twitter",
        "E-mail",
        "managing editor",
        "contributors",
        "technical support",
        "Typeset",
        "Printed in",
        "Entered words",
        "All rights reserved",
        "Version:",
        "First Edition",
        "Acknowledgements",
        "would like to thank",
        "dictionaries@",
        "Jouve",
        "Visualdictionary",
    )

    entries: list[dict[str, str | int]] = []
    topic = "Introduction"
    i = 0
    while i < len(lines):
        s = lines[i]
        if is_page_number(s):
            i += 1
            continue
        if s.lower() in ("vocabulary", "introduction", "contents"):
            i += 1
            continue
        if is_section_header(s):
            topic = s.split("|")[0].strip()
            i += 1
            continue
        if any(x in s for x in skip_substr):
            i += 1
            continue
        if re.match(r"^\d+\s+[a-z]", s) and len(s) < 40:
            i += 1
            continue
        if re.match(r"^The following points", s):
            while i < len(lines) and not (
                is_section_header(lines[i]) or lines[i].startswith("Hello")
            ):
                i += 1
            continue
        if has_hangul(s):
            i += 1
            continue
        if i + 1 >= len(lines) or not has_hangul(lines[i + 1]):
            i += 1
            continue

        english = s
        i += 1
        ko_parts: list[str] = []
        while i < len(lines) and has_hangul(lines[i]):
            ko_parts.append(lines[i].strip())
            i += 1
        korean = " ".join(ko_parts).replace(" ,", ",")
        if not korean or "|" in korean:
            continue
        ro_parts: list[str] = []
        while i < len(lines):
            nxt = lines[i]
            if is_page_number(nxt) or nxt.lower() == "vocabulary":
                i += 1
                continue
            if is_section_header(nxt) or has_hangul(nxt):
                break
            if (
                i + 1 < len(lines)
                and not has_hangul(nxt)
                and has_hangul(lines[i + 1])
                and not probably_romanization(nxt)
            ):
                break
            if not probably_romanization(nxt):
                break
            ro_parts.append(nxt.strip())
            i += 1
        rom = " ".join(ro_parts)
        entries.append({"topic": topic, "en": english.strip(), "ko": korean.strip(), "rom": rom.strip()})

    entries = expand_compound_number_entries(entries)

    out: list[dict[str, str | int]] = []
    for e in entries:
        en = str(e["en"])
        ko = str(e["ko"])
        if len(en) >= 120:
            continue
        if en.startswith("yuksip"):
            continue
        if "  |  " in en:
            continue
        if en == "hour." and ko.startswith("십"):
            continue
        out.append({"topic": str(e["topic"]), "en": en, "ko": ko, "rom": str(e["rom"])})

    for idx, e in enumerate(out):
        e["id"] = idx

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, ensure_ascii=False, indent=0) + "\n", encoding="utf-8")
    print(f"Wrote {len(out)} entries to {out_path}")


if __name__ == "__main__":
    main()
