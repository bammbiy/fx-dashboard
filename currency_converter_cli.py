import argparse, sys
RATES = {('USD','USD'):1.0, ('USD','EUR'):0.90, ('USD','GBP'):0.76, ('USD','JPY'):155.0, ('USD','KRW'):1370.0, ('USD','CNY'):7.2}
pairs=list(RATES.items())
for (b,q),v in pairs:
    if b=='USD' and q!='USD': RATES[(q,'USD')]=1.0/v
def convert(amount, f, t):
    f=f.upper(); t=t.upper()
    if f==t: return amount
    if (f,t) in RATES: rate=RATES[(f,t)]
    elif (f,'USD') in RATES and ('USD',t) in RATES: rate=RATES[(f,'USD')]*RATES[('USD',t)]
    else: raise SystemExit(f'Unsupported currency pair: {f}->{t}')
    return amount*rate
if __name__=='__main__':
    ap=argparse.ArgumentParser(); ap.add_argument('--amount',type=float,required=True); ap.add_argument('--from',dest='f',required=True); ap.add_argument('--to',dest='t',required=True)
    a=ap.parse_args()
    try:
        res=convert(a.amount,a.f,a.t); print(f"{a.amount:.2f} {a.f.upper()} = {res:.2f} {a.t.upper()}")
    except Exception as e:
        print(str(e), file=sys.stderr); sys.exit(1)
