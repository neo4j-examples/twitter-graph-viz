from py2neo import neo4j
from py2neo import cypher
import os

url = os.environ.get('NEO4J_URL',"http://localhost:7474/db/data")
print(url)
graph = neo4j.GraphDatabaseService()
session = cypher.Session()

def count_relationships():
    query = "MATCH (n)-[r]->(m) RETURN { from: {id:id(n),label: head(labels(n)), data: n}, rel: type(r), to: {id: id(m), label: head(labels(m)), data: m}} as tuple limit 10"
    res = session.execute(query)
    return res
