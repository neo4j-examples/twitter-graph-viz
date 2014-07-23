import web
from load_graph import load_graph
import requests

urls = (
    '/', 'index',
    '/twitter/(.*)','twitter_img',
    '/text/(.*)','text_img',
    '/graph','graph'
)

class index:
    def GET(self):
         raise web.seeother('/static/index.html')

class twitter_img:
    def GET(self,name):
        img = requests.get('http://pbs.twimg.com/profile_images/'+name)
        return img.content

class text_img:
    def GET(self,name):
        img = requests.get('http://ansrv.com/png?s='+name+'&c=74d0f4&b=231d40&size=5')
        return img.content

class graph:
    def GET(self):
        return load_graph()


if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()