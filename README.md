Knockout Infinite Scroll
====

A simple javascript app, with minimal dependencies. The purpose is to display products in a grid, retrieved from a RESTful JSON API, and to show how to achieve this using Knockout library.

The app is an ecommerce site, where you can buy all sorts of ascii faces like `(ノ・∀・)ノ` and `¯_(ツ)_/¯`, in a wide variety of font sizes. The homepage should display a list of products for people to browse.

The goal is to keep it simple, no build process nor minification is done on the js code. In a production environment, it will be suggested to concatenate and minify the js code, but that is beyond the scope of this example.

Start the app with `node index.js`, and then navigate to http://localhost:8000/.

Dependencies
----

### Backend (run `yarn install`):
- [cool-ascii-faces](https://www.npmjs.com/package/cool-ascii-faces)
- [ecstatic](https://www.npmjs.com/package/ecstatic)

### Frontend:
- [Knockout](http://knockoutjs.com/)
- [nanoajax](https://github.com/yanatan16/nanoajax)

Requirements
----

- display the products in a grid.
- give the user an option to sort the products in ascending order. Can sort by "size", "price" or "id".
- each product has :
  - a "size" field, which is the font-size in pixels. We should display the faces in their correct size, to give customers a realistic impression of what they're buying.
  - a "price" field, in cents. This should be formatted as dollars like `$3.51`.
  - a "date" field, which is the date the product was added to the catalog. Dates should be displayed in relative time (eg. "3 days ago") unless they are older than 1 week, in which case the full date should be displayed.
- the product grid should automatically load more items as you scroll down.
- our product database is under high load due to growing demand for ascii, so please display an animated "loading..." message while the user waits.
- to improve the user's experience, we should always pre-emptively fetch the next batch of results in advance, making use of idle-time.  But they still should not be displayed until the user has scrolled to the bottom of the product grid.
- when the user reaches the end and there are no more products to display, show the message "~ end of catalogue ~".

Products API
----

- The basic query looks like this: `/api/products`
- The response format is newline-delimited JSON.
- To get a larger results set use the `limit` parameter, eg: `/api/products?limit=100`
- To paginate results use the `skip` parameter, eg: `/api/products?limit=15&skip=30` (returns 15 results starting from the 30th).
- To sort results use the `sort` parameter, eg: `/api/products?sort=price`. Valid sort values are `price`, `size` and `id`.

Ads
----
- after every 20 products we need to insert an advertisement from one of our sponsors. Use the same markup as the advertisement in the header, but make sure the `?r` query param is randomly generated each time an ad is displayed.
- Ads should be randomly selected, but a user must never see the same ad twice in a row.
