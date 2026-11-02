#!/usr/bin/env python3
"""
Gera os recursos otimizados em src/assets a partir das 4 imagens originais
(1.png ... 4.png e, opcionalmente, 5.png; 1080x1920).

Uso:  python3 tools/prepare_assets.py caminho/para/pasta-com-1.png-2.png-3.png-4.png
Requer: Pillow, numpy, scipy.

O que faz:
  page2/3/4.webp ......... as próprias imagens, convertidas para WebP (qualidade alta)
  dresscode.webp ......... imagem da página de Dress code (opcional: arquivo 5.png)
  page1-left/right.webp .. fundo do envelope dividido na dobra (selo e texto removidos)
  page1-seal.webp ........ selo dourado recortado (transparente)
  page1-hint.webp ........ texto curvo "Toque para abrir" (transparente)
  shimmer2/3.webp ........ máscara da escrita dourada do fundo (para o brilho sutil)
"""
import sys, os, colorsys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else "."
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "assets")
os.makedirs(OUT, exist_ok=True)
W, H = 1080, 1920
SPLIT = 518           # aresta nítida da dobra do envelope (medida na imagem 1)
OVERLAP = 2           # px de sobreposição entre as abas (evita fresta)

def load(n): return Image.open(os.path.join(SRC, f"{n}.png")).convert("RGB")
def save(img, name, q=90, **kw):
    p = os.path.join(OUT, name); img.save(p, "WEBP", quality=q, method=6, **kw)
    print(f"{name:22s} {os.path.getsize(p)/1024:7.1f} KB")

# ---------- páginas 2, 3 e 4 (usadas exatamente como criadas) ----------
for n in (2, 3, 4):
    save(load(n), f"page{n}.webp", q=92)

if os.path.exists(os.path.join(SRC, "5.png")):
    save(load(5), "dresscode.webp", q=92)

# ---------- página 1: separar fundo, selo e texto ----------
im = np.array(load(1)).astype(float)
rng = np.random.default_rng(7)
# fundo é uniforme na vertical -> estimar cada coluna fora da área do selo
colbg = np.median(np.concatenate([im[300:500], im[1400:1600]]), axis=0)      # (W,3)
resid = np.concatenate([im[300:500], im[1400:1600]]) - colbg
noise_std = resid.std()
bg = np.broadcast_to(colbg, im.shape).copy()

d = np.abs(im - bg).sum(axis=2)
X0, X1, Y0, Y1 = 250, 760, 700, 1240            # retângulo que contém selo + texto
box = np.zeros((H, W), bool); box[Y0:Y1, X0:X1] = True

# selo: dourado (R bem maior que B) -> componente conectado, preenchido e suavizado
gold = (d > 60) & (im[:, :, 0] - im[:, :, 2] > 25) & box
lab, n = ndi.label(ndi.binary_closing(gold, iterations=3))
seal_id = np.argmax(ndi.sum(gold, lab, range(n + 1)) * (np.arange(n + 1) > 0))   # maior componente dourado
seal = ndi.binary_fill_holes(lab == seal_id)
seal = ndi.binary_erosion(seal, iterations=2)    # remove o halo claro da borda
seal_a = ndi.gaussian_filter(seal.astype(float), 0.9)
sy, sx = np.where(seal)
sb = (sx.min() - 6, sy.min() - 6, sx.max() + 7, sy.max() + 7)
seal_rgba = np.dstack([im, seal_a * 255]).astype(np.uint8)[sb[1]:sb[3], sb[0]:sb[2]]
save(Image.fromarray(seal_rgba, "RGBA"), "page1-seal.webp", q=95)
print("seal box (px):", sb, "-> %", [round(sb[0]/W*100,3), round(sb[1]/H*100,3), round((sb[2]-sb[0])/W*100,3), round((sb[3]-sb[1])/H*100,3)])

# texto "Toque para abrir": tudo que difere do fundo e não é selo
near_seal = ndi.binary_dilation(seal, iterations=7)
txt_d = np.where(box & ~near_seal, d, 0)
core = np.percentile(txt_d[txt_d > 40], 90)
alpha_t = np.clip((txt_d - 9) / (core - 9), 0, 1)
tl, tn = ndi.label(ndi.binary_dilation(txt_d > 0.5 * core, iterations=4))
keep = np.zeros_like(alpha_t, bool)
for i in range(1, tn + 1):
    if (tl == i).sum() > 400:                      # letras do texto, não ruído
        keep |= ndi.binary_dilation(tl == i, iterations=4)
alpha_t = np.where(keep, alpha_t, 0)
alpha_t = ndi.gaussian_filter(alpha_t, 0.5)
strong = alpha_t > 0.9
F = im[strong].mean(axis=0)
ty, tx = np.where(alpha_t > 0.15)
tb = (tx.min() - 6, ty.min() - 6, tx.max() + 7, ty.max() + 7)
txt_rgba = np.zeros((H, W, 4), np.uint8)
txt_rgba[..., :3] = F.astype(np.uint8); txt_rgba[..., 3] = (alpha_t * 255).astype(np.uint8)
txt_rgba = txt_rgba[tb[1]:tb[3], tb[0]:tb[2]]
save(Image.fromarray(txt_rgba, "RGBA"), "page1-hint.webp", q=95, lossless=True)
print("hint box (px):", tb, "-> %", [round(tb[0]/W*100,3), round(tb[1]/H*100,3), round((tb[2]-tb[0])/W*100,3), round((tb[3]-tb[1])/H*100,3)], "color", F.astype(int))

# fundo limpo: preencher o retângulo com a coluna estimada + granulação equivalente
clean = im.copy()
fill = bg + rng.normal(0, noise_std, im.shape)
hole = ndi.binary_dilation(seal | (alpha_t > 0.02), iterations=8) & box
clean[hole] = fill[hole]
clean = np.clip(clean, 0, 255).astype(np.uint8)
save(Image.fromarray(clean[:, : SPLIT + OVERLAP]), "page1-left.webp", q=95)
save(Image.fromarray(clean[:, SPLIT:]), "page1-right.webp", q=95)
Image.fromarray(clean).save("/tmp/page1-clean-preview.png")

# ---------- máscaras da escrita dourada (páginas 2 e 3) ----------
def script_mask(n):
    a = np.array(load(n)).astype(float)
    mx, mn = a.max(axis=2), a.min(axis=2)
    lum = a.mean(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1)
    pill = np.abs(a - np.array([93, 60, 109])).sum(axis=2) < 16   # círculos/botão da pág. 3
    overlay = ((sat > 0.33) & (lum > 115)) | (mn > 200) | pill      # textos lilás/brancos, ícones
    overlay = ndi.binary_dilation(overlay, iterations=14)
    s = np.clip((lum - 84) / 42, 0, 1) * (sat < 0.36) * (~overlay)
    s = ndi.gaussian_filter(s, 0.5)
    rgba = np.zeros((H, W, 4), np.uint8)
    rgba[..., :3] = 255; rgba[..., 3] = (s * 255).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA").resize((720, 1280), Image.LANCZOS)
    save(img, f"shimmer{n}.webp", q=85)
for n in (2, 3):
    script_mask(n)
print("ok")
