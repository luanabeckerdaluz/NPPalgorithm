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
  • <a href="#google-earth-engine-code-availability">GEE Code Availability</a> &nbsp;
  • <a href="#example">Example</a> &nbsp;
</p>


<h1 align="center">
  <a><img src="https://user-images.githubusercontent.com/27021459/175539565-c676ede6-7036-4ee3-8bef-142cf1c0ad9b.png" alt="Markdownify" width="800"></a>
</h1>


[Google Earth Engine (GEE)](https://earthengine.google.com/) is a cloud-based platform that allows users to have an easy access to a petabyte-scale archive of remote sensing data and run geospatial analysis on Google's infrastructure.



## Methodology
The purpose of this code is to provide users with a function for calculating Net Primary Productivity (NPP).



## Google Earth Engine Code Availability

The source code is available in this GitHub repository as well as in the GEE repository, where you can run the example code directly in the interface. To access the repository, use the following link:

https://code.earthengine.google.com/?accept_repo=users/leobeckerdaluz/NPP_algorithm



## Example

The NPP processing can be executed by using two main functions. After obtaining the NDVI, LST, SOL and We collections and set the constants Topt and LUEmax, the NPP is computed for each set of images using the collectionNPP function. The first image of each collection is also used to exemplify the computation of only one NPP image by using the singleNPP function.

#### singleNPP

``` r
var imageNDVI = ee.Image(...)   // NDVI Image

var imageLST = ee.Image(...)    // LST Image

var imageSOL = ee.Image(...)    // SOL Image

var imageWe = ee.Image(...)     // We Image

var Topt = CONST                // Optimal temperature constant (e.g. 21.66)

var LUEmax = CONST              // Max LUE constant (e.g. 0.72)

// Import NPP processing module
var computeNPP = require('users/leobeckerdaluz/NPP_algorithm:computeNPP')

// Compute NPP
var imageNPP = computeNPP.singleNPP(
  imageNDVI, 
  imageLST, 
  imageSOL, 
  imageWe, 
  Topt, 
  LUEmax
)
```


#### collectionNPP

``` r
var ROI = ee.Geometry(...)                        // Region of Interest

var imageCollectionNDVI = ee.ImageCollection(...) // NDVI image collection

var imageCollectionLST = ee.ImageCollection(...)  // LST image collection

var imageCollectionSOL = ee.ImageCollection(...)  // SOL image collection

var imageCollectionWe = ee.ImageCollection(...)   // We image collection

var Topt = CONST                // Optimal temperature constant (e.g. 21.66)

var LUEmax = CONST              // Max LUE constant (e.g. 0.72)

// Import NPP processing module
var computeNPP = require('users/leobeckerdaluz/NPP_algorithm:computeNPP')

// Compute NPP
var imageCollectionNPP = computeNPP.collectionNPP(
  imageCollectionNDVI, 
  imageCollectionLST, 
  imageCollectionSOL, 
  imageCollectionWe, 
  Topt, 
  LUEmax
)
```