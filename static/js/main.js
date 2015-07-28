
function main() {
    /* app's entry point */
    var viewModel = new ProductsViewModel();
    ko.applyBindings(viewModel);

    viewModel.initialProductLoad();

    // move products from buffer to the actual list when the user scrolls to the end
    window.onscroll = function(ev) {
        var windowHeightAndScrollY = window.innerHeight + window.scrollY;

        // detect a scroll to the bottom
        if (windowHeightAndScrollY >= document.body.offsetHeight) {
            viewModel.addProductsToGrid();
        }
    };
}

main();
