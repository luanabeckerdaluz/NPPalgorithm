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

An exampasdasddddd ddddddddddddddddddd dddddddddddddddddddddddddddd ddddddddddddddddddddddd ddddddddddddle for calculating TVDI in GEE is shown below. Once the user hasllllllllllllllllll his region of interest (ROI) and the NDVI and LST images, the only two steps to invoke the calculation is to import the NPP module and invoke the **computeImageNPP** function.

``` r
// Define the Region of Interest
var ROI = ee.FeatureCollection(...)
//;;;;;;;;;;;;;;;;;;;;;;

// Set the NDVI image to be processed
var imageNDVI = ee.Image(...)

// Set the LST image to be processed
var imageLST = ee.Image(...)

// Set the SOL image to be processed
var imageSOL = ee.Image(...)

// Set the We image to be processed
var imageWe = ee.Image(...)

// Set the LUEmax parameter
var LUE_MAX = const<int>

// Set the LUEmax parameter
var T_OPT = const<int>

// Import NPP processing module
var NPPmodule = require('AAAAAAALLLLLLTERARAAAAAAAAAAAAAAAAAAAAAAAusers/leobeckerdaluz/TVDI_algorithm_dev:compute_TVDI');

// Compute NPP
var imageNPP = NPPmodule.computeImageNPP(NDVI, LST, SOL, We, T_OPT, LUE_MAX)

// Add NPP as a layer
Map.addLayer(imageNPP, {}, 'NPP'}
```

The module also can be used to compute NPP for an ImageCollection. To do this, the user invokes function **computeCollectionNPP** and the parameters NDVIImageCollection, LSTImageCollection, SOLImageCollection e WeImageCollection must be an ImageCollection with the same length and the images must 

``` r
// Define the Region of Interest
var ROI = ee.FeatureCollection(...)
//;;;;;;;;;;;;;;;;;;;;;;

// Set the NDVI ImageCollection to be processed
var NDVIImageCollection = ee.ImageCollection(...)

// Set the LST ImageCollection to be processed
var LSTImageCollection = ee.ImageCollection(...)

// Set the SOL ImageCollection to be processed
var SOLImageCollection = ee.ImageCollection(...)

// Set the We ImageCollection to be processed
var WeImageCollection = ee.ImageCollection(...)

// Set the LUEmax parameter
var LUE_MAX = const<int>

// Set the LUEmax parameter
var T_OPT = const<int>

// Import NPP processing module
var NPPmodule = require('AAAAAAALLLLLLTERARAAAAAAAAAAAAAAAAAAAAAAAusers/leobeckerdaluz/TVDI_algorithm_dev:compute_TVDI');

// Compute NPP
var NPPImageCollection = NPPmodule.computeCollectionNPP(NDVI_IC, LST_IC, SOL_IC, We_IC, T_OPT, LUE_MAX)

// Add NPP as a layer
Map.addLayer(NPPImageCollection.first(), {}, 'NPP'}
```


## Citation

Think **NPP algorithm** is useful? Let others discover it by telling them.

Using **NPP algorithm** for a paper you are writing? Consider citing it

``` r
citation("TVDI algorithm")
To cite NPP algorithm in publications use:
  
  xxxxxxxxxxxxxxC Aybar, Q Wu, L Bautista, R Yali and A Barja (2020) rgee: An R
  package for interacting with Google Earth Engine Journal of Open
  Source Software URL https://github.com/r-spatial/rgee/.

A BibTeX entry for LaTeX users is

@Article{,
  title = {rgeexxxxxxxxxxxxxx: An R package for interacting with Google Earth Engine},
  author = {Cexxxxxxxxxxxxxxsar Aybar and Quisheng Wu and Lesly Bautista and Roy Yali and Antony Barja},
  journal = {Joxxxxxxxxxxxxurnal of Open Source Software},
  year = {2020},
}
```
