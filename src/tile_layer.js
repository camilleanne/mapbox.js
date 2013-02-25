mapbox.tileLayer = L.TileLayer.extend({

    initialize: function(_, options) {
        L.TileLayer.prototype.initialize.call(this, undefined, options);

        if (options && options.detectRetina &&
            L.Browser.retina && options.retinaVersion) {
            _ = options.retinaVersion;
        }

        if (typeof _ === 'string') {
            mapbox.idUrl(_, this);
        } else if (_ && typeof _ === 'object') {
            this.tilejson(_);
        }

    },

    tilejson: function(json) {

        if (!arguments.length) return this._tilejson;

        L.extend(this.options, {
            tiles: json.tiles,
            attribution: json.attribution,
            legend: json.legend,
            minZoom: json.minzoom,
            maxZoom: json.maxzoom,
            tms: json.scheme === 'tms'
        });

        this._tilejson = json;

        if (json.bounds && json.bounds.length) {
            this.options.bounds = mapbox.lbounds(json.bounds);
        }

        return this;
    },

    // pull tilejson data from an endpoint
    url: function(url) {
        mapbox.request(url, L.bind(function(err, json) {
            if (err) return mapbox.log('could not load TileJSON at ' + url);
            this.tilejson(json);
        }, this));
        return this;
    },

    id: function(id) {
        return this.tilejson({
            id: id,
            tiles: [
                'http://a.tiles.mapbox.com/v3/' + id + '/{z}/{x}/{y}.png',
                'http://b.tiles.mapbox.com/v3/' + id + '/{z}/{x}/{y}.png',
                'http://c.tiles.mapbox.com/v3/' + id + '/{z}/{x}/{y}.png',
                'http://d.tiles.mapbox.com/v3/' + id + '/{z}/{x}/{y}.png'
            ]
        });
    },

    getLegend: function() {
        return this.options.legend;
    },

    getTileUrl: function(tilePoint) {
        var tiles = this.options.tiles,
            index = (tilePoint.x + tilePoint.y) % tiles.length,
            url = tiles[index];

        return L.Util.template(url, tilePoint);
    },

    // TileJSON.TileLayers are added to the map immediately, so that they get
    // the desired z-index, but do not update until the TileJSON has been loaded.
    _update: function() {
        if (this.options.tiles) {
            L.TileLayer.prototype._update.call(this);
        }
    }
});