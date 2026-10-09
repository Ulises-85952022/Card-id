from PIL import Image, ImageDraw, ImageFont
import os
W,H=1200,630
STONE=(0,87,98); HONDO=(0,61,69); LIMA=(222,239,153); NAVAJO=(255,222,171); WHITE=(255,255,255)
FONT='scripts/fonts/Archivo.ttf'
def font(size,wdth,wght):
    f=ImageFont.truetype(FONT,size)
    try:
        axes=f.get_variation_axes()
        vals=[]
        for a in axes:
            n=a.get('name',b'')
            n=n.decode() if isinstance(n,bytes) else n
            vals.append(wdth if 'idth' in n else wght)
        f.set_variation_by_axes(vals)
    except Exception as e: print('var',e)
    return f
img=Image.new('RGB',(W,H),HONDO)
d=ImageDraw.Draw(img)
for row in range(-1,H//36+2):
    off=0 if row%2==0 else -14
    for col in range(-1,W//28+2):
        x=col*28+off+2; y=row*36
        d.rounded_rectangle([x,y+2,x+24,y+16],radius=3,fill=(6,68,76))
# tarjeta
cx,cy,cw,ch=150,95,900,440
sh=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(sh).rounded_rectangle([cx+10,cy+30,cx+cw+10,cy+ch+30],radius=40,fill=(0,0,0,110))
from PIL import ImageFilter
img.paste(sh.filter(ImageFilter.GaussianBlur(30)),(0,0),sh.filter(ImageFilter.GaussianBlur(30)))
card=Image.new('RGB',(cw,ch),STONE)
cd=ImageDraw.Draw(card)
for row in range(-1,ch//36+2):
    off=0 if row%2==0 else -14
    for col in range(-1,cw//28+2):
        x=col*28+off+2; y=row*36
        cd.rounded_rectangle([x,y+2,x+24,y+16],radius=3,fill=(10,98,108))
cd.rectangle([0,ch-12,cw,ch],fill=LIMA)
mask=Image.new('L',(cw,ch),0); ImageDraw.Draw(mask).rounded_rectangle([0,0,cw,ch],radius=36,fill=255)
img.paste(card,(cx,cy),mask)
d=ImageDraw.Draw(img)
# chip de empresa con el logo oficial
logo=Image.open('src/assets/logos/ammega.png').convert('RGB')
lh=60; logo=logo.resize((round(logo.width*lh/logo.height),lh),Image.LANCZOS)
d.rounded_rectangle([cx+54,cy+50,cx+54+logo.width+36,cy+50+lh+28],radius=12,fill=WHITE)
img.paste(logo,(cx+54+18,cy+50+14))
# monograma / foto
s=140; ax,ay=cx+cw-54-s,cy+54
av='public/avatar.png'
if os.path.exists(av):
    a=Image.open(av).convert('RGB').resize((s,s)); m=Image.new('L',(s,s),0); ImageDraw.Draw(m).rounded_rectangle([0,0,s,s],radius=30,fill=255); img.paste(a,(ax,ay),m)
else:
    d.rounded_rectangle([ax,ay,ax+s,ay+s],radius=30,fill=(0,42,48))
    d.text((ax+s/2,ay+s/2),'UH',font=font(52,125,750),fill=NAVAJO,anchor='mm')
d.text((cx+54,cy+ch-170),'Ulises Hernández',font=font(70,125,750),fill=WHITE,anchor='ls')
d.text((cx+56,cy+ch-110),'Key Account Manager',font=font(38,100,500),fill=NAVAJO,anchor='ls')
d.text((cx+56,cy+ch-62),'Belting & Industrial Solutions',font=font(30,100,400),fill=(205,222,224),anchor='ls')
img.save('public/og.png',optimize=True)
