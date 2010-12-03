# coding=utf-8
import urllib2
import re

notile = "http://bkv.utvonalterv.hu/NoTile.ashx?&Command=Traffic&sessionID=1449_2119731_5134837&iCommandID=1640&appID=bkv&lang=hu&arrIDs=0%7C1&arrX=652953%7C649908&arrY=240457%7C240974&arrParsed=undefined%7Cundefined&strTrafficType=bkv&iCarOptim=0&iBkvOptim=0&strTime=2010%2F10%2F24%2F19%3A23&iMaxWalkDist=500"

parasztjson = urllib2.urlopen(notile).read().split(";")[5:-1]
for sor in parasztjson:
  a = sor.strip().split("=")
  if len(a) == 2:
    for darab in a[0].split("."):
      if re.search("[", darab):
        arr, i = re.search("(.*?)\[(\d)\]","m_arrMains[0]").groups()
        try:
    
    #if re.search("new", a[1]):
      #if re.search("Array", a[1]):
        #pass
      #if re.search("Object", a[1]):
        #pass
    #else:
      #eval(a[0] + " = " +  a[1])
      #pass
      #értéket adunk hozzá már létezőhöz
      #print a[1]
#print parasztjson 
