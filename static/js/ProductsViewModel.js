
/* some constants */
var MS_PER_WEEK = 60 * 1000 * 60 * 24 * 7;
var MS_PER_DAY = 60 * 1000 * 60 * 24;
var PAGINATION_ITEMS = 20;
var INTERVAL_FETCH_NEXT_BATCH = 5000; // in ms

var exists = []; // to keep track of used ids for ads

/* -- Represents a product to sell on the warehouse (ASCII face) -- */
var Product = function(id, fontSize, face, price, date, isAd) {
    this.id = ko.observable(id);
    this.fontSize = ko.observable(fontSize + 'px');
    this.face = ko.observable(face);
    this.price = ko.observable(price);
    this.date = ko.observable(new Date(date));

    this.isAd = ko.observable(isAd);

    this.formattedPrice = ko.computed(this._formattedPrice, this);
    this.formattedDate = ko.computed(this._formattedDate, this);

    if (this.isAd()) {
        // if the product is an add, generate a random unique id that will be used
        // to pick the correct add to display
        this.id(this._generateIdForAdvertisement());
    }
};

/**
  Appends the unit to the price value.
  @return {String} with amount and unit for the product's price
  */
Product.prototype._formattedPrice = function() {
    return '$ ' + parseFloat(this.price() / 100).toFixed(2);
};

/**
  Display dates in a relative format.
  @return {String} Date in 'X days ago format' if date is within past week
  */
Product.prototype._formattedDate = function() {
    var current = new Date();
    var elapsed = current - this.date();

    if (elapsed > MS_PER_WEEK) {
        return this.date();
    }
    else {
        var days = Math.round(elapsed / MS_PER_DAY);
        return days === 1 ? days + ' day ago' : days + ' days ago';
    }
};

/**
  Generates a random, unused id to call the ads API.
  @return {String} Random id to display an image that represents the add
  */
Product.prototype._generateIdForAdvertisement = function() {
    var randomNumber,
        max = 1000;

    for (var l = 0; l < max; l++) {
       do {
           randomNumber = Math.floor(Math.random() * max);
       } while (exists[randomNumber]);
       exists[randomNumber] = true;
       return randomNumber.toString();
    }
};

/* -- A knockout conceptual object that holds a list of products that will be displayed -- */
var ProductsViewModel = function() {
    this.sortingParameter = ko.observable('size');
    this.products = ko.observableArray([]);

    this.skipCount = 0;
    this.productsBuffer = []; // array to keep the batch that is prefetched
    this.intervalId = 0;

    this._parseResponse = function(response) {
        return response.split('\n')
                .filter(function(productString) {
                    return productString.length > 0;
                })
                .map(function(productString) {
                    return JSON.parse(productString);
                });
    };

    this.initialProductLoad = function() {
        var viewModel = this;

        window.clearInterval(viewModel.intervalId);
        viewModel.skipCount = 0;

        viewModel.products.removeAll();
        viewModel.productsBuffer.splice(0, viewModel.productsBuffer.length); // clear buffer

        var url = '/api/products?' +
                    'sort=' + viewModel.sortingParameter() + '&' +
                    'limit=' + PAGINATION_ITEMS + '&' +
                    'skip=' + viewModel.skipCount;

        nanoajax.ajax(url, function(code, response) {
            if (code === 200) {
                viewModel.skipCount += PAGINATION_ITEMS;

                var productsArray = viewModel._parseResponse(response);
                productsArray.forEach(function(product) {
                    viewModel.products.push(new Product(product.id, product.size, product.face, product.price, product.date, false));
                });
                viewModel.products.push(new Product('', 0, '', 0, '', true)); // insert Advertisement

                // pre-emptively fetch the next batch
                viewModel.intervalId = window.setInterval(function() {
                    viewModel.fetchNextBatch();
                }, INTERVAL_FETCH_NEXT_BATCH);
            }
        });

        return true; // to update UI
    };

    this.fetchNextBatch = function() {
        var viewModel = this;

        // load the next batch, only if the buffer is empty
        if (viewModel.productsBuffer.length === 0) {
            var preloaderImage = document.getElementById('preloader');

            var url = '/api/products?' +
                        'sort=' + viewModel.sortingParameter() + '&' +
                        'limit=' + PAGINATION_ITEMS + '&' +
                        'skip=' + viewModel.skipCount;

            nanoajax.ajax(url, function(code, response) {
                if (code === 200) {
                    if (response.length > 0) {
                        viewModel.skipCount += PAGINATION_ITEMS;
                        var productsArray = viewModel._parseResponse(response);
                        productsArray.forEach(function(product) {
                            viewModel.productsBuffer.push(new Product(product.id, product.size, product.face, product.price, product.date, false));
                        });

                        viewModel.productsBuffer.push(new Product('', 0, '', 0, '', true)); // insert Advertisement

                        window.onscroll(); // to trigger addProductsToGrid() in case the user has scrolled to the end
                    }
                    else {
                        // no more elements to load, hide loading spinner and show end of catalogue message
                        document.getElementById('preloader').style.display = 'none';
                        document.getElementById('end-catalogue').style.display = 'block';
                    }
                }
            });
        }
    };

    this.addProductsToGrid = function() {
        var viewModel = this;

        // move products from buffer to the observable array
        var elementsToMove = this.productsBuffer.splice(0, this.productsBuffer.length);
        elementsToMove.forEach(function(elem) {
            viewModel.products.push(elem);
        });
        return true;
    };

};
