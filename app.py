import web
#import neo
#from neo import count_relationships

render = web.template.render("templates/")
urls = (
    '/', 'index',
    '/page', 'page'
)

class index:
    def GET(self):
        return "Hello, world!"

class page:
    def GET(self):
        name = "Bob" # count_relationships()
        return render.page(name)

if __name__ == "__main__":
    app = web.application(urls, globals())
    app.run()