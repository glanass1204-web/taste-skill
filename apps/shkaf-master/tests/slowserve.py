# сервер как GitHub Pages; если есть файл slow.flag — страница отвечает через 20 с (плохая связь)
import http.server,os,time,sys
ROOT=sys.argv[1];FLAG=os.path.join(os.path.dirname(os.path.abspath(__file__)),'slow.flag')
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(s,*a,**k):super().__init__(*a,directory=ROOT,**k)
    def do_GET(s):
        p=s.path.split('?')[0]
        if os.path.exists(FLAG) and (p.endswith('/') or p.endswith('index.html')):time.sleep(20)
        return super().do_GET()
    def log_message(s,*a):pass
http.server.ThreadingHTTPServer(('127.0.0.1',8770),H).serve_forever()
