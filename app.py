import web
import neo
from neo import load_graph
import requests

render = web.template.render("templates/")
# http://pbs.twimg.com/profile_images/3324391541/e661bf654d79b2b0cba94ebb9df0cbfe_normal.jpeg
urls = (
    '/', 'index',
    '/page', 'page',
    '/twitter/(.*)','twitter_img',
    '/text/(.*)','text_img'
)

class index:
    def GET(self):
        return "Hello, world!"

class page:
    def GET(self):
        name = py2neo.neo4j.CypherResults(load_graph())
        return render.page(name)

class twitter_img:
    def GET(self,name):
        img = requests.get('http://pbs.twimg.com/profile_images/'+name)
        return img.content

class text_img:
    def GET(self,name):
        img = requests.get('http://ansrv.com/png?s='+name+'&c=74d0f4&b=231d40&size=11')
        return img.content


if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()