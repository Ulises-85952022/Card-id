from PIL import Image, ImageDraw, ImageFont
W,H=1200,630
TINTA=(23,32,38); ACERO=(86,99,109); BANDA=(13,78,140); WHITE=(255,255,255)
img=Image.new('RGB',(W,H),WHITE)
d=ImageDraw.Draw(img,'RGBA')
band_h=220
d.rectangle([0,0,W,band_h],fill=TINTA)
# eslabones de banda modular desfasados (escala 2x del tile web)
tw,th=56,72
for row in range(-1, band_h//36+2):
    y=row*36
    off=0 if row%2==0 else -28
    for col in range(-1, W//tw+2):
        x=col*tw+off+4
        d.rounded_rectangle([x,y+4,x+48,y+32],radius=6,fill=(255,255,255,23))
d.rectangle([0,band_h,W,H],fill=WHITE)
# monograma en lugar de foto (se reemplaza si hay public/avatar.png)
import os
av=None
if os.path.exists('public/avatar.png'):
    av=Image.open('public/avatar.png').convert('RGB')
x0,y0,s=80,band_h-90,180
d.rounded_rectangle([x0-8,y0-8,x0+s+8,y0+s+8],radius=28,fill=WHITE)
if av:
    av=av.resize((s,s)); mask=Image.new('L',(s,s),0); ImageDraw.Draw(mask).rounded_rectangle([0,0,s,s],radius=22,fill=255); img.paste(av,(x0,y0),mask)
else:
    d.rounded_rectangle([x0,y0,x0+s,y0+s],radius=22,fill=TINTA)
    f=ImageFont.truetype('scripts/fonts/BarlowSemiCondensed-Bold.ttf',72)
    d.text((x0+s/2,y0+s/2),'UH',font=f,fill=WHITE,anchor='mm')
fn=ImageFont.truetype('scripts/fonts/BarlowSemiCondensed-Bold.ttf',92)
ft=ImageFont.truetype('scripts/fonts/Barlow-Medium.ttf',44)
fc=ImageFont.truetype('scripts/fonts/Barlow-Regular.ttf',32)
d.text((300,250),'Ulises Hernández',font=fn,fill=TINTA,anchor='lt')
d.text((302,360),'Key Account Manager',font=ft,fill=TINTA,anchor='lt')
d.text((302,416),'AMMEGA Group, Belting & Industrial Solutions',font=fc,fill=ACERO,anchor='lt')
d.rectangle([80,520,W-80,522],fill=(215,220,223))
d.text((80,560),'Bandas transportadoras, correas de transmisión y mangueras industriales',font=fc,fill=ACERO,anchor='lm')
img.save('public/og.png',optimize=True)
