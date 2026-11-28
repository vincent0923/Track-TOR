#!/usr/bin/env python3
"""App icons: the paper envelope with a scratch card, one for every theme look and every symbol.

The masters are tools/icon-src/<symbol>.webp (512 px, sage green: the first light theme's own colour). For each look
in LOOKS the green paper is re-dyed to that look's colour, keeping the paper's light, shade, grain and embossing;
the pale rim of the masters is cut away and the corners re-rounded. Written to icons/:
  <look>-<symbol>.webp     the rounded tile (in the app, favicon, manifest "any")
  <look>-<symbol>-m.webp   maskable: the tile on a darker ground of the same colour
  <look>-<symbol>-a.png    180 px, square and full-bleed, for the iPhone home screen
  <look>-<symbol>.json     the web app manifest for that choice
and the default set at the repo root (icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png).
Run from the repo root after adding a theme (add its colour to LOOKS):  python3 tools/icons.py   (needs Pillow, numpy;
about a quarter of an hour).  python3 tools/icons.py --manifests  only rewrites the .json files.
"""
import os, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SYMBOLS = ["heart", "star", "cross", "bird", "cat", "dog", "rabbit"]
# the envelope's paper colour for each look; None keeps the master's own green
LOOKS = {
    "aurora-light": None, "aurora-dark": "#1E8C7E", "ember-light": "#D98A6B", "ember-dark": "#C98A1E",
    "toy-light": "#EB3B24", "toy-dark": "#6B3FA0", "pocket-light": "#E7D4B4", "pocket-dark": "#E39A2E",
    "mac-light": "#C9CCD1", "mac-dark": "#4A4C52", "ipod-light": "#E9EBEE", "ipod-dark": "#2F7BEA",
    "tm4-dark": "#2D76C6", "skeuo-light": "#8E9197", "braun-light": "#EC6A2C", "md-light": "#AFC3DA",
    "nikon-dark": "#2E2F33", "dyson-light": "#D8A49B", "dyson-dark": "#33457F", "clay-light": "#8FDCC0",
    "eink-light": "#CFCEC8", "eink-dark": "#3A3A3A", "aqua-light": "#5C9FEA", "aqua-dark": "#6A7079",
    "ipc-light": "#E6E6E4", "ipc-dark": "#3D3D41", "ipu2-dark": "#C42A22", "ipsmk-light": "#55585D", "ipylw-light": "#EECE5C", "ipgrn-light": "#78A874", "ipice-light": "#A3C7EA", "iplav-light": "#B5A3EF", "ipclr-light": "#4A62D6",
}
# each look's page background (the --bg it paints), for the splash screen and title bar of that choice
LOOK_BG = {"ipc-light": "#D3B386", "ipc-dark": "#4E5155", "ipu2-dark": "#4E5155", "ipsmk-light": "#EEF0F2", "ipylw-light": "#F1F0EA", "ipgrn-light": "#EDF1EC", "ipice-light": "#EDF2F8", "iplav-light": "#F1EEF9", "ipclr-light": "#EDF0F8", "aqua-light": "#EEF0F3", "aqua-dark": "#3B4048", "eink-light": "#ECEBE6", "eink-dark": "#121212", "aurora-light": "#F1F1EC", "aurora-dark": "#070A10", "ember-light": "#F4EFE9", "ember-dark": "#0B0908", "toy-light": "#F4F1EA", "toy-dark": "#130C21", "pocket-light": "#C6C9CB", "pocket-dark": "#4C535B", "mac-light": "#D6D7DA", "mac-dark": "#1B1B1D", "ipod-light": "#E9EAEC", "ipod-dark": "#0D0D0E", "tm4-dark": "#123A6B", "skeuo-light": "#86888D", "braun-light": "#D8D5CA", "md-light": "#BFC6D0", "nikon-dark": "#141517", "dyson-light": "#EFDDD5", "dyson-dark": "#141936", "clay-light": "#E3E1DA"}
DEFAULT = "aurora-light-heart"
REF = .6            # the paper's mid tone in the masters
GREEN = "#8FA98F"   # the masters' paper colour, for the maskable ground

def hsv(rgb):
    mx, mn = rgb.max(-1), rgb.min(-1); d = mx - mn; r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    m = d > 1e-6; dd = np.where(m, d, 1)
    h = np.where(mx == r, ((g - b) / dd) % 6, np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) / 6
    return np.where(m, h, 0), np.where(mx > 0, d / np.where(mx > 0, mx, 1), 0), mx

def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def rgbf(hexc): return np.array([int(hexc[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255

def recolor(a, hexc):
    rgb = a[..., :3]; h, s, _ = hsv(rgb)
    m = smooth(h, .2, .26) * (1 - smooth(h, .42, .5)) * smooth(s, .055, .11)
    # close the mask over the paper's thin dark creases and edge shadows, so no grey-green fringe is left
    mb = np.array(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.2))).astype(np.float32) / 255
    w = np.maximum(m, smooth(mb, .42, .62))[..., None]
    t = rgbf(hexc); k = (rgb * np.array([.299, .587, .114])).sum(-1, keepdims=True) / REF
    out = np.where(k <= 1, t * k ** 1.15, t + (1 - t) * np.clip((k - 1) * .45, 0, 1))
    res = a.copy(); res[..., :3] = rgb * (1 - w) + out * w; return res

def rounded(n, rad):
    m = Image.new("L", (n * 4, n * 4), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, n * 4 - 1, n * 4 - 1], rad * 4, fill=255)
    return m.resize((n, n), Image.LANCZOS)

def art(sym, hexc):
    """the square, full-bleed picture: the master cut inside its pale rim and scaled back to 512"""
    a = np.array(Image.open(os.path.join(ROOT, "tools", "icon-src", sym + ".webp")).convert("RGBA")).astype(np.float32) / 255
    if hexc: a = recolor(a, hexc)
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)); c = 9
    # the masters' corners are transparent: fill them from the picture's own edge colour before cropping
    bg = Image.new("RGBA", im.size, tuple(int(v) for v in np.array(im)[256, 14][:3]) + (255,)); bg.alpha_composite(im)
    return bg.crop((c, c, 512 - c, 512 - c)).resize((512, 512), Image.LANCZOS).convert("RGB")

def manifest(name):
    """the same app as manifest.json (same id, start and scope, seen from icons/), with this choice's pictures"""
    base = json.load(open(os.path.join(ROOT, "manifest.json"), encoding="utf8"))
    look = name.rsplit("-", 1)[0]
    base.update({"start_url": "../index.html", "scope": "../", "id": "index.html",
                 "background_color": LOOK_BG.get(look, base["background_color"]), "theme_color": LOOK_BG.get(look, base["theme_color"]),
                 "icons": [{"src": name + ".webp", "sizes": "512x512", "type": "image/webp", "purpose": "any"},
                           {"src": name + "-m.webp", "sizes": "512x512", "type": "image/webp", "purpose": "maskable"}]})
    return base

def manifests():
    for look in LOOKS:
        for sym in SYMBOLS:
            name = look + "-" + sym
            json.dump(manifest(name), open(os.path.join(ROOT, "icons", name + ".json"), "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))

def build(only=None):
    out = os.path.join(ROOT, "icons"); os.makedirs(out, exist_ok=True); mask = rounded(512, 112); total = 0
    for look, hexc in LOOKS.items():
        if only and not look.startswith(only): continue
        t = rgbf(hexc or GREEN); ground = tuple(int(v * 255 * .5) for v in (t * .8 + t.mean() * .2))
        for sym in SYMBOLS:
            sq = art(sym, hexc); name = look + "-" + sym
            tile = sq.convert("RGBA"); tile.putalpha(mask); tile.save(os.path.join(out, name + ".webp"), quality=82, method=6)
            m = Image.new("RGB", (512, 512), ground); small = tile.resize((392, 392), Image.LANCZOS); m.paste(small, (60, 60), small)
            m.save(os.path.join(out, name + "-m.webp"), quality=82, method=6)
            sq.resize((180, 180), Image.LANCZOS).quantize(200, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(os.path.join(out, name + "-a.png"), optimize=True)
            man = manifest(name)
            json.dump(man, open(os.path.join(out, name + ".json"), "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
            total += sum(os.path.getsize(os.path.join(out, name + e)) for e in (".webp", "-m.webp", "-a.png", ".json"))
            if name == DEFAULT:
                tile.resize((192, 192), Image.LANCZOS).save(os.path.join(ROOT, "icon-192.png"), optimize=True)
                tile.quantize(256, method=Image.Quantize.FASTOCTREE).save(os.path.join(ROOT, "icon-512.png"), optimize=True)
                m.quantize(256).save(os.path.join(ROOT, "icon-maskable-512.png"), optimize=True)
                sq.resize((180, 180), Image.LANCZOS).save(os.path.join(ROOT, "apple-touch-icon.png"), optimize=True)
    print(len(LOOKS) * len(SYMBOLS), "icons,", round(total / 1e6, 1), "MB in icons/")

if __name__ == "__main__":
    import sys
    only = next((a.split("=", 1)[1] for a in sys.argv if a.startswith("--only=")), None)   # --only=<theme>: just that theme's looks
    manifests() if "--manifests" in sys.argv else build(only)   # --manifests: only rewrite the .json files (after manifest.json changes)
