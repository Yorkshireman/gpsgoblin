"""Offline viewport-policy comparison for two permissioned single-segment exports.

Run: python3 scripts/investigatePaceRange.py [local.gpx ...]
Prints aggregate numerical comparisons and synthetic cases; no paths or coordinates.
Uses the earlier diagnostic readers, not the production parser. Does not upload data.
"""
import sys,math,statistics
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from investigateStops import read_recording
from investigateRecordingGaps import classify

def quantile(rows, p):
 rows=sorted((x,w) for x,w in rows if math.isfinite(x) and x>0 and w>0)
 if not rows:return None
 target=sum(w for x,w in rows)*p;acc=0
 for x,w in rows:
  acc+=w
  if acc>=target:return x
 return rows[-1][0]
def report(rows):
 maximum=max(p for p,d,t in rows)
 candidates={'fixed30':30,'sample95':quantile([(p,1) for p,d,t in rows],.95)*1.25,'time95':quantile([(p,t) for p,d,t in rows],.95)*1.25,'distance95':quantile([(p,d) for p,d,t in rows],.95)*1.25}
 print('max',round(maximum,2))
 for k,v in candidates.items():
  cap=math.ceil(v);print(k,cap,'clipped samples',sum(p>cap for p,d,t in rows),'distance%',round(100*sum(d for p,d,t in rows if p>cap)/sum(d for p,d,t in rows),3))
for path in sys.argv[1:]:
 pts,distances,fields=read_recording(path)
 durations=[b[0]-a[0] for a,b in zip(pts,pts[1:])]
 gaps=set(classify(durations))
 for window in [0,60,600]:
  rows=[];q=[];seconds=distance=0
  for i,(dt,d) in enumerate(zip(durations,[b-a for a,b in zip(distances,distances[1:])])):
   if i in gaps:q=[];seconds=distance=0;continue
   q.append((dt,d));seconds+=dt;distance+=d
   if window:
    while len(q)>1 and seconds-q[0][0]>=window:
     t,x=q.pop(0);seconds-=t;distance-=x
    if not any(x>0 for t,x in q):distance=0
    excess=max(0,seconds-window)
    speed=max(0,distance-excess*q[0][1]/q[0][0])/min(seconds,window)
   else:speed=d/dt
   if speed>0:rows.append((1000/speed/60,d,dt))
  print('recording',sys.argv.index(path),'window',window);report(rows)
for name,rows in [
 ('steady slow hike',[(60,1,3.6)]*1000),
 ('mostly slow hike with a stop',[(60,1,3.6)]*1000+[(600,0.01,.36)]*1000),
 ('mixed hike uphill half distance',[(15,1,.9)]*500+[(60,1,3.6)]*500),
 ('short slow section 4% distance',[(15,1,.9)]*960+[(90,1,5.4)]*40),
 ('run with long stop drift',[(6,1,.36)]*1000+[(500,.01,.3)]*1000)
]:
 print(name);report(rows)
