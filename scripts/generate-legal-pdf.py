from pathlib import Path
import json,re,html,shutil
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,KeepTogether,Table,TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf/cgv-rgpd-we-move.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
d=json.loads((ROOT/'src/data/legalDocuments.json').read_text(encoding='utf-8'))
for name,file in [('Body','arial.ttf'),('Bold','arialbd.ttf')]: pdfmetrics.registerFont(TTFont(name,'C:/Windows/Fonts/'+file))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold',italic='Body',boldItalic='Bold')
INK=HexColor('#123b4b'); SAGE=HexColor('#7c8f70'); PAPER=HexColor('#f6f5f0'); BLUE=HexColor('#0082ca'); RED=HexColor('#ee3e38')
W,H=A4
body=ParagraphStyle('body',fontName='Body',fontSize=10,leading=15,textColor=INK,spaceAfter=9,allowWidows=0,allowOrphans=0)
small=ParagraphStyle('small',parent=body,fontSize=8,leading=12,textColor=SAGE)
h1=ParagraphStyle('chapter',parent=body,fontName='Bold',fontSize=22,leading=28,spaceAfter=22,keepWithNext=True)
h2=ParagraphStyle('article',parent=body,fontName='Bold',fontSize=11,leading=16,spaceBefore=13,spaceAfter=9,keepWithNext=True)
eyebrow=ParagraphStyle('eyebrow',parent=small,fontName='Bold',spaceAfter=10)
def p(text,style=body): return Paragraph(html.escape(re.sub(r'\s+',' ',text).strip()),style)
def logo(c,x,y,scale=1):
 c.saveState();c.translate(x,y);c.scale(scale,scale)
 c.saveState();c.translate(0,42);c.scale(.32,-.32);c.translate(-32,-10)
 path=c.beginPath();path.moveTo(32,28);path.curveTo(32,13,56,13,56,28);path.lineTo(56,76);path.curveTo(56,92,64,102,77,102);path.curveTo(90,102,98,92,98,76);path.lineTo(98,28);path.curveTo(98,13,122,13,122,28);path.lineTo(122,76);path.curveTo(122,92,130,102,143,102);path.curveTo(156,102,164,92,164,76);path.lineTo(164,28);path.curveTo(164,13,188,13,188,28);path.lineTo(188,76);path.curveTo(188,114,162,127,143,127);path.curveTo(126,127,116,113,110,103);path.curveTo(104,113,94,127,77,127);path.curveTo(58,127,32,114,32,76);path.close()
 c.setFillColor(BLUE);c.drawPath(path,stroke=0,fill=1);c.setFillColor(RED)
 c.roundRect(64,10,26,78,13,stroke=0,fill=1);c.roundRect(130,10,26,78,13,stroke=0,fill=1);c.restoreState()
 for text,ypos,size,color in [('We Move',23,24,BLUE),('Déménagement',6,13,RED)]:
  c.saveState();c.translate(56,ypos);c.scale(111/pdfmetrics.stringWidth(text,'Times-Bold',size),1);c.setFont('Times-Bold',size);c.setFillColor(color);c.drawString(0,0,text);c.restoreState()
 c.restoreState()
class NumberedCanvas(canvas.Canvas):
 def __init__(self,*args,**kwargs): super().__init__(*args,**kwargs);self.pages=[]
 def showPage(self): self.pages.append(dict(self.__dict__));self._startPage()
 def save(self):
  total=len(self.pages)
  for state in self.pages:
   self.__dict__.update(state);self.setFont('Body',8);self.setFillColor(SAGE);self.drawRightString(W-48,30,f'{self._pageNumber:02d} / {total:02d}');super().showPage()
  super().save()
def chrome(c,doc):
 c.saveState()
 if doc.page==1:
  c.setFillColor(PAPER);c.rect(0,0,W,H,fill=1,stroke=0);logo(c,48,H-112,1.18)
  c.setFillColor(INK);c.roundRect(48,102,W-96,128,8,fill=1,stroke=0)
  c.setFillColor(HexColor('#c5d5b6'));c.setFont('Bold',9);c.drawString(68,207,'WE MOVE  |  DÉMÉNAGEMENT')
  c.setFillColor(HexColor('#ffffff'));c.setFont('Body',10)
  for j,line in enumerate(['163 rue de la Convention, 75015 Paris','01 73 74 36 90  •  contact@wemove.fr','Contact RGPD : wemove.demenagement@gmail.com']):c.drawString(68,184-j*21,line)
 else:
  logo(c,48,H-66,.72);c.setFillColor(SAGE);c.setFont('Body',8);c.drawRightString(W-48,H-42,'CONTRAT DE DÉMÉNAGEMENT  /  CGV & RGPD')
  c.setStrokeColor(HexColor('#dbe1d5'));c.line(48,H-83,W-48,H-83)
 c.setStrokeColor(HexColor('#dbe1d5'));c.line(48,48,W-48,48);c.setFillColor(SAGE);c.setFont('Body',8);c.drawString(48,30,'WE MOVE  •  Informations contractuelles');c.restoreState()
flow=[Spacer(1,62),p('VOTRE DÉMÉNAGEMENT, EN TOUTE CLARTÉ',eyebrow),p('Conditions générales<br/>de vente'.replace('<br/>',' '),ParagraphStyle('cover',parent=h1,fontSize=36,leading=43,spaceAfter=18)),p('Contrat de déménagement & information sur le traitement des données personnelles',ParagraphStyle('subtitle',parent=body,fontSize=14,leading=21)),Spacer(1,22),p('DANS CE DOCUMENT',eyebrow)]
for number,title in [('01','Dispositions générales'),('02','Prix et modalités de règlement'),('03','Réalisation des prestations'),('04','Responsabilité de l’entreprise'),('05','Livraison et formalités en cas de dommage'),('06','Annexe : données personnelles (RGPD)')]:flow.append(p(number+'   '+title,ParagraphStyle('toc',parent=body,fontSize=10,leading=18,spaceAfter=3)))
flow.append(PageBreak())
for idx,ch in enumerate(d['chapters']):
 if idx:flow.append(Spacer(1,24))
 flow.extend([p('CONDITIONS GÉNÉRALES DE VENTE  /  CHAPITRE '+str(idx+1),eyebrow),p(re.sub(r'^CHAPITRE [IVX]+\s*[:–]\s*','',ch['title']).capitalize(),h1)])
 if idx==0:flow.append(p(d['intro']))
 for article in ch['articles']:
  flow.append(p(article['title'],h2))
  # Reflow hard-wrapped source lines while keeping list items distinct.
  chunks=re.split(r'\n(?=- )',article['body'])
  for chunk in chunks:flow.append(p(chunk))
flow.extend([Spacer(1,15),p('Mentions du document contractuel',h2),p(d['closing']),Spacer(1,12),p('Nom du client : ................................................................................'),p('Date et signature : ..........................................................................'),PageBreak()])
flow.extend([p('ANNEXE AU CONTRAT DE DÉMÉNAGEMENT DE PARTICULIER',eyebrow),p('Protection des données personnelles',h1),p('Information concernant le traitement des données à caractère personnel (RGPD)',h2),p(d['privacyIntro'])])
for idx,section in enumerate(d['privacySections']):
 if idx==3:flow.extend([PageBreak(),p('ANNEXE RGPD / SUITE',eyebrow)])
 flow.extend([p(section['title'],h2),p(section['body'])])
flow.extend([Spacer(1,10),p(d['privacyAcknowledgement']),Spacer(1,12),p('Signature du client : .......................................................................')])
doc=SimpleDocTemplate(str(OUT),pagesize=A4,rightMargin=48,leftMargin=48,topMargin=105,bottomMargin=68,title='We Move - Conditions générales de vente et RGPD',author='WE MOVE',subject='Contrat de déménagement et protection des données personnelles')
doc.build(flow,onFirstPage=chrome,onLaterPages=chrome,canvasmaker=NumberedCanvas)
shutil.copyfile(OUT,ROOT/'public/documents/cgv-rgpd-we-move.pdf')
print(OUT)
