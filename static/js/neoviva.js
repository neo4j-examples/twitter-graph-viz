var colors = [
    0x1f77b4ff, 0xaec7e8ff,
    0xff7f0eff, 0xffbb78ff,
    0x2ca02cff, 0x98df8aff,
    0xd62728ff, 0xff9896ff,
    0x9467bdff, 0xc5b0d5ff,
    0x8c564bff, 0xc49c94ff,
    0xe377c2ff, 0xf7b6d2ff,
    0x7f7f7fff, 0xc7c7c7ff,
    0xbcbd22ff, 0xdbdb8dff,
    0x17becfff, 0x9edae5ff];

function addNeo(graph, data) {
    function addNode(id,data) {
        if (!id || typeof id == "undefined") return null;
        var node = graph.getNode(id);
        if (!node) node = graph.addNode(id, data);
        return node;
    }
    for (var i=0;i<data.length;i++) {
		var row = data[i];
	    var tuple = row.row[0];
        addNode(tuple.from.id,tuple.from);
        addNode(tuple.to.id,tuple.to);
    }
    for (var i=0;i<data.length;i++) {
		var row = data[i];
	    var tuple = row.row[0];
	    var found=false;
        graph.forEachLinkedNode(tuple.from.id, function (node, link) {
            if (node.id == tuple.to.id) found=true;
        });
        if (!found) graph.addLink(tuple.from.id, tuple.to.id);
    }
}
function loadData(graph,id) {
	var query = "MATCH (n)-[r]->(m) RETURN { from: {id:id(n),label: head(labels(n)), data: n}, rel: type(r), to: {id: id(m), label: head(labels(m)), data: m}} as tuple limit 1000"
    $.ajax("http://localhost:7474/db/data/transaction/commit", {
        type:"POST",
        data: JSON.stringify({statements:[{statement:query}]}),
        dataType:"json",
        contentType: "application/json",
        success:function (res) {
            addNeo(graph, res.results[0].data);
        }
    })
}

function onLoad() {
    var graph = Viva.Graph.graph();

    var layout = Viva.Graph.Layout.forceDirected(graph, {
        springLength:100,
        springCoeff:0.0001,
        dragCoeff:0.02,
        gravity:-1
    });

    var graphics = Viva.Graph.View.webglGraphics({ clearColor: true, clearColorValue: {r:0,g:0,b:0,a:1}});
    var timeout;
    var inputs = Viva.Graph.webglInputEvents(graphics, graph);
    var lastNode = null;

    graphics.setNodeProgram(new Viva.Graph.View.webglImageNodeProgram());
    graphics
        .node(function (node) {
			var d = node.data;
			console.log(d)
			var img;
			if (img = d && d.data && d.data["profile_image_url"]) {
				img = img.replace("http://pbs.twimg.com/profile_images/","/twitter/");
				return Viva.Graph.View.webglImage(12, img);
			}
			if (d && d.label && d.label == "Tag" && d.data) {
				return Viva.Graph.View.webglImage(12, "/text/"+d.data['name']);
			}
            return Viva.Graph.View.webglImage(1, "/static/images/blank.png");
        })
        .link(function (link) {
            var t = Viva.Graph.View.webglLine(3014898687);
            return t.oldColor = 3014898687, t
        });

    var renderer = Viva.Graph.View.renderer(graph,
        {
            layout:layout,
            graphics:graphics,
            container:document.getElementById('graph1'),
            renderLinks:true
        });


    var onMouseEnter = function (node) {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            showBox(node);
        }, 250);
    };

    var showBox = function (node) {
        var t = $("#hoveredName").empty();
        if (!node) return;
        var id = node['screen_name'];
		if (!id) return;
        if (id.match(/^::/)) {
            id = "#" + id.substring(2);
            t.text(id).append(n).show();
        } else {
            var n = '<br/><a href="http://twitter.com/' + id + '" target="_blank"><img id="avatar" src="http://api.twitter.com/1/users/profile_image?screen_name=' + id + '&size=bigger"' + '></img></a>';
            t.empty().text("@" + id).append(n).show()
        }
        $.ajax("/tweets/" + node['id'], {
            type:"GET",
            dataType:"json",
            success:function (res) {
                console.log("tweets", res);
                for (var n=0;n<res.length;n++) {
                    $("<div>" + res[n].text + "</div>").appendTo(t)
                }
            }});
    };
    var onMouseLeave = function () {
        // $("#hoveredName").hide().empty()
        clearTimeout(timeout);
    };

    var onClick = function (node) {
        console.log("click", node);
        if (!node || !node.position) return;
        showBox(node);
        graphics.graphCenterChanged(node.position.x,node.position.y);
        renderer.rerender();
        loadData(graph,node.id);
    };
    var onDblClick = function (node) {
        console.log("double-click", node)
    };

    var unHighlightLinks = function (node, color) {
        if (node && node.id) {
            node.ui.size=12;
            graph.forEachLinkedNode(node.id, function (aNode, link) {
                link.ui.color = color || link.ui.oldColor
            })
        }
    };
    var highlightNode = function (node, color) {
        if (!(node && node.id && node.ui)) return;
        node.ui.size = 36;
        graph.forEachLinkedNode(node.id, function (aNode, link) {
            link.ui.color = color || 4278190335;
            graphics.bringLinkToFront(link.ui)
        })
    };

    inputs.mouseEnter(function (node) {
        onMouseEnter(node);
        unHighlightLinks(lastNode);
        lastNode = node;
        highlightNode(node);
        renderer.rerender()
    }).mouseLeave(function (node) {
            onMouseLeave();
            unHighlightLinks(lastNode);
            lastNode = null;
            unHighlightLinks(node);
            renderer.rerender()
        }).dblClick(function (node) {
            onDblClick(node)
        }).click(function (node) {
            onClick(node)
        });


    renderer.run();
    loadData(graph);
    l = layout;
}