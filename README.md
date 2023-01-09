<h2 align="center">
  NPP algorithm
</h2>

<h4 align="center">Google Earth Engine function to compute the Net Primary Productivity (NPP).</h4>

<p align="center">
<a href="https://www.repostatus.org/#active"><img src="https://www.repostatus.org/badges/latest/active.svg" alt="Project Status: Active – The project has reached a stable, usable
state and is being actively
developed."></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-green" alt="License"></a>
<a href="https://www.tidyverse.org/lifecycle/#maturing"><img src="https://img.shields.io/badge/lifecycle-maturing-blue.svg" alt="lifecycle"></a>
<br>
</p>


<p align="center">  
  • <a href="#methodology">Methodology</a> &nbsp;
  • <a href="#example">Example</a> &nbsp;
  • <a href="#citation">Citation</a> &nbsp;
</p>


<h1 align="center">
  <a><img src="https://user-images.githubusercontent.com/27021459/175539565-c676ede6-7036-4ee3-8bef-142cf1c0ad9b.png" alt="Markdownify" width="800"></a>
</h1>


[Google Earth Engine](https://earthengine.google.com/) is a cloud-based platform that allows users to have an easy access to a petabyte-scale archive of remote sensing data and run geospatial analysis on Google's infrastructure. .... ........... ........ ........... ........ ........... ........ ........... ........ .



## Methodology
The methodology ........... ........ ........... ........ ........... ........ 



## Example

The NPP processing can be executed by using two main functions. After obtaining the NDVI, LST, SOL and We collections and set the constants Topt and LUEmax, the NPP is computed for each set of images using the collectionNPP function. The first image of each collection is also used to exemplify the computation of only one NPP image by using the singleNPP function.

### singleNPP

``` r
// Obtain the Region of Interest
var ROI = ee.Geometry(...)

// Obtain the NDVI image to be processed
var imageNDVI = ee.Image(...)

// Obtain the LST image to be processed
var imageLST = ee.Image(...)

// Obtain the SOL image to be processed
var imageSOL = ee.Image(...)

// Obtain the We image to be processed
var imageWe = ee.Image(...)

// Set the constant Topt
var Topt = const

// Set the constant LUEmax
var LUEmax = const

// Import NPP processing module
var computeNPP = require('users/leobeckerdaluz/NPP_algorithm:computeNPP')

// Compute NPP
var imageNPP = computeNPP.singleNPP(imageNDVI, imageLST, imageSOL, imageWe, Topt, LUEmax)

// Add NPP as a layer
Map.addLayer(imageNPP, {}, 'NPP'}
```


### collectionNPP

``` r
// Obtain the Region of Interest
var ROI = ee.Geometry(...)

// Obtain the NDVI image collection to be processed
var imageCollectionNDVI = ee.ImageCollection(...)

// Obtain the LST image collection to be processed
var imageCollectionLST = ee.ImageCollection(...)

// Obtain the SOL image collection to be processed
var imageCollectionSOL = ee.ImageCollection(...)

// Obtain the We image collection to be processed
var imageCollectionWe = ee.ImageCollection(...)

// Set the constant Topt
var Topt = const

// Set the constant LUEmax
var LUEmax = const

// Import NPP processing module
var computeNPP = require('users/leobeckerdaluz/NPP_algorithm:computeNPP')

// Compute NPP
var imageCollectionNPP = computeNPP.collectionNPP(imageCollectionNDVI, imageCollectionLST, imageCollectionSOL, imageCollectionWe, Topt, LUEmax)

// Add NPP first processed image as a layer
Map.addLayer(imageCollectionNPP.first(), {}, 'NPP'}
```