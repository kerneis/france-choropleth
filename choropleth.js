(function(){
    function addLoadEvent(func) {
        var oldonload = window.onload;
        if (typeof window.onload != 'function') {
            window.onload = func;
        } else {
            window.onload = function() {
                if (oldonload) {
                    oldonload();
                }
                func();
            }
        }
    }
    function Set() {
        this.content = {};
    }
    Set.prototype.add = function(val) {
        this.content[val]=true;
    }
    Set.prototype.remove = function(val) {
        delete this.content[val];
    }
    Set.prototype.contains = function(val) {
        return (val in this.content);
    }
    Set.prototype.asArray = function() {
        var res = [];
        for (var val in this.content) res.push(val);
        return res;
    }

    var svg;
    var path;
    var data;

    function init() {
        /* Projection centrée sur la France */
        var xy = d3.geo.albers()
            .origin([2.6,46.5])
            .parallels([44,49])
            .scale(2700)
            .translate([250,250]);
        path = d3.geo.path().projection(xy);

        data = {};
        data.departement = {};
        data.departement.properties = new Set();
        data.arrondissement = {};
        data.arrondissement.properties = new Set();
        data.canton = {};
        data.canton.properties = new Set();
        data.commune = {};
        data.commune.properties = new Set();

        svg = d3.select("#chart svg")
            .call(d3.behavior.zoom()
                    .on("zoom", redraw))
            .append("g");

        var bg = svg.append("g")
            .attr("id", "background");

        /* Background must in fact be in front of user layer */
        svg.insert("g", "#background")
            .attr("id", "user_layer")
            .attr("class", "YlGn");

        d3.json("data/geofla/departement.json", function(json) {
            bg.selectAll("path")
            .data(json.features)
            .enter().append("path")
            .attr("d", path);
        });

        d3.select("#reload").on("click", loadUserLayer);

        loadUserLayer();
        loadCSV("data/csv/participation_pres.csv",
                data.departement,
                "departement",
                "date",
                "participation",
                parseFloat);
        loadCSV("data/csv/resultats_departements_T2.csv",
                data.departement,
                "Departement",
                "Candidat",
                "%",
                parseFloat);
    }

    function updateRows() {
        for (k in data) {
            var id = "#data-" + k;
            var li = d3.select(id).selectAll("li")
                .data(data[k].properties.asArray().sort(),
                        function(d) { return d; });
            li.enter().append("li")
                .text(function(d){ return d;});
            li.exit().remove();
            ;
        }
    }

    function loadCSV(file, dict, index, key, value, parse) {
        d3.csv(file, function(rows) {
            rows.forEach(function(r) {
                if(typeof dict[r[index]] == "undefined") {
                    dict[r[index]] = {};
                }
                dict[r[index]][r[key]] = parse(r[value]);
                dict.properties.add(r[key]);
            });
            loadUserLayer();
            updateRows();
        });
    }


    function buildScale(domain, buckets, scaleType) {
        var legendClass = function(n) { return "q"+n+"-"+buckets; };
        var minmax = d3.extent(domain);
        var min = minmax[0]; var max = minmax[1];
        if(scaleType == "symmetry") {
            if(min < 0 && max < 0)
                max = 0;
            else if (min < 0 && max > 0) {
                min = - Math.max(-min, max);
                max = - min;
            } else
                min = 0;
        }
        var a = d3.range(buckets).map(legendClass);
        var scale, q;
        if(scaleType == "quantile") {
            scale = d3.scale.quantile().range(a).domain(domain);
            q = d3.merge([[min], scale.quantiles(), [max]]);
        } else { /* quantize or symmetry */
            scale = d3.scale.quantize().range(a).domain([min, max]);
            q = d3.range(buckets + 1).map(function(n) {
                return min + (max - min) * (n/buckets);
            });
        }
        q = q.map(function(n) { return n.toPrecision(3); });

        var leg = d3.select("#legend").selectAll("div")
            .data(d3.range(buckets));
        /* Enter */
        var div = leg.enter().append("div");
        div.append("svg").append("rect")
            .attr("width", "100%").attr("height", "100%");
        div.append("span");
        /* Update */
        leg.attr("class", legendClass);
        leg.select("span").text(function(d,i){
            return "[ "+q[i]+" ; "+ q[i+1] + " ]";
        });
        /* Exit */
        leg.exit().remove();

        return scale;
    }

    function loadMap(mapfile) {
        var prog = d3.select("#fillcode").node().value;
        var f = eval('(function() {' + prog + '})();');
        var select;

        select = d3.select("#palette").node();
        var palette = select.options[select.selectedIndex].value;

        var oldLayer = svg.select("#user_layer")
            .attr("id", "#old_layer");
        var newLayer = svg.insert("g", "#background")
            .attr("id", "user_layer")
            .attr("class", palette);
        d3.select("#legend").attr("class", palette);

        d3.json(mapfile, function(json) {
            var p = newLayer.selectAll("path")
            .data(json.features)
            .enter().append("path")
            .attr("d", path)
            .datum(function(d){
                d.value = f(d.properties,
                    data.departement[d.properties.CODE_DEPT],
                    data.arrondissement[d.properties.CODE_DEPT
                        + d.properties.CODE_ARR],
                    data.canton[d.properties.CODE_DEPT +
                        d.properties.CODE_CANT],
                    data.commune[d.properties.INSEE_COM]
                    ) + 0.; return d; });
            var values = p.data().map(function(d) { return d.value; });
            var scaleType =
                d3.selectAll("input[name=scale]")
                .filter(function() { return this.checked; }).node().value;
            select = d3.select("#buckets").node();
            var buckets = parseInt(select.options[select.selectedIndex].value);
            var scale = buildScale(values, buckets, scaleType);
            p.attr("class", function(d) { return scale(d.value); });
            oldLayer.remove();
        });
    }

    function loadUserLayer() {
        var select = d3.select("#mapfiles").node();
        var name = select.options[select.selectedIndex].value;
        var file = "data/geofla/" + name + ".json";
        loadMap(file);
    }

    function redraw() {
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    addLoadEvent(init);
})();
