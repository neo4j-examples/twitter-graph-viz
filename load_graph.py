import requests
import json
import os

url = os.environ.get('NEO4J_URL',"http://localhost:7474/db/data")

def load_graph():
    query = """
    MATCH (t:Tweet) 
    WITH t ORDER BY t.id DESC LIMIT 2000 
    MATCH (user:User)-[:POSTS]->(t)<-[:TAGS]-(tag:Hashtag)
    MATCH (t)-[:MENTIONS]->(user2:User)  
    UNWIND [tag,user2] as other WITH distinct user,other 
    WHERE lower(other.name) <> 'oscon'  
    RETURN { from: {id:id(user),label: head(labels(user)), data: user}, 
                       rel: 'CONNECTS', 
                       to: {id: id(other), label: head(labels(other)), data: other}} as tuple 
    LIMIT 1000
    """
    statements = {'statements':[{'statement':query}]}
    headers = {'content-type':'application/json'}
    res = requests.post(url + '/transaction/commit', data = json.dumps(statements), headers = headers)
    print res.status_code
    rows = res.json()['results'][0]['data']
    rows = map(lambda a: a['row'][0], rows)
    return json.dumps(rows)

if __name__ == "__main__":
    print load_graph()
