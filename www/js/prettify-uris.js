/**
 * Created by vukm on 10/14/15.
 */

var prettifier = {};

(function(){
    var prefixMappings = {};
    var lsMappings = localStorage.getItem("prefixMap");
    if (lsMappings) {
        prefixMappings = JSON.parse(lsMappings);
    } else {
        prefixMappings = {
            dbo: "http://dbpedia.org/ontology/",
            dbpedia: "http://dbpedia.org/resource/",
            "dbo-sr": "http://sr.dbpedia.org/ontology/",
            "dbpedia-sr": "http://sr.dbpedia.org/resource/",
            schema: "http://schema.org/",
            owl: "http://www.w3.org/2002/07/owl#",
            rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            rdfs: "http://www.w3.org/2000/01/rdf-schema#",
            foaf: "http://xmlns.com/foaf/",
            dct: "http://purl.org/dc/terms/",
            dce: "http://purl.org/dc/elements/1.1/",
            wgs: "http://www.w3.org/2003/01/geo/wgs84_pos#",
            geo: "http://www.opengis.net/geosparql#",
            skos: "http://www.w3.org/2004/02/skos/core#"
        };
    }
    function setMapping(prefix, namespace) {
        prefixMappings[prefix] = namespace;
        localStorage.setItem('prefixMap', JSON.stringify(prefixMappings));
    }
    function removeMapping(prefix) {
        delete prefixMappings[prefix];
        localStorage.setItem('prefixMap', JSON.stringify(prefixMappings));
    }
    function prettifyURI(uri) {
        if (!uri) return uri;
        // go through all prefixes
        for (var prefix in prefixMappings) {
            // check if the uri starts with this prefix
            var namespace = prefixMappings[prefix];
            if (!namespace) continue;
            var index = uri.indexOf(namespace);
            if (index === 0) {
                // put prefix in instead of the namespace
                return prefix + ":" + uri.substring(namespace.length);
            }
        }
        return uri;
    }
    function uglifyURI(uri) {
        // check if there is a prefix and return original value if not
        var indexColon = uri.indexOf(':');
        if (indexColon < 0) return uri;

        // replace prefix with the associated namespace
        var prefix = uri.substring(0, indexColon);
        var namespace = prefixMappings[prefix];
        if (namespace) {
            return namespace + uri.substring(indexColon + 1);
        }
        // if prefix is not found return original
        return uri;
    }
    function setPrefixMap(map) {
        prefixMappings = map;
        localStorage.setItem('prefixMap', JSON.stringify(prefixMappings));
    }
    function getPrefixMap() {
        return prefixMappings;
    }

    prettifier.setMapping = setMapping;
    prettifier.removeMapping = removeMapping;
    prettifier.prettifyURI = prettifyURI;
    prettifier.uglifyURI = uglifyURI;
    prettifier.setPrefixMap = setPrefixMap;
    prettifier.getPrefixMap = getPrefixMap;
})();