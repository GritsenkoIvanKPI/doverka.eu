"""Masks the two identity paragraphs in images/doc-3.jpg.

An earlier pass blurred the names but not the identifiers underneath them, so both
paragraphs are covered here in full.

Downsample -> NEAREST upsample -> Gaussian, not a plain blur: a Gaussian alone is a
convolution and can be partly undone by deconvolution. Dropping the pixels first
destroys the information for good. Original scan: documents/3.png (git-ignored).
"""
from PIL import Image, ImageFilter

SRC = 'images/doc-3.jpg'

# (x0, y0, x1, y1) as fractions of the image — verified against a red-box overlay
REGIONS = [
    (0.222, 0.328, 0.840, 0.401),   # principal: tax no., passport, address
    (0.222, 0.432, 0.847, 0.503),   # attorney-in-fact: name, DOB, tax no., passport, address
]

im = Image.open(SRC).convert('RGB')
W, H = im.size

for x0, y0, x1, y1 in REGIONS:
    box = (round(x0 * W), round(y0 * H), round(x1 * W), round(y1 * H))
    patch = im.crop(box)
    w, h = patch.size
    patch = patch.resize((max(1, w // 14), max(1, h // 14)), Image.BILINEAR)
    patch = patch.resize((w, h), Image.NEAREST).filter(ImageFilter.GaussianBlur(7))
    im.paste(patch, box)

im.save(SRC, 'JPEG', quality=84, optimize=True)
print(f'{SRC}: {len(REGIONS)} regions redacted')
