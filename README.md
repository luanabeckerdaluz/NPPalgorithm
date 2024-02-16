<h2 align="center">
  NPP algorithm
</h2>

<h4 align="center">Google Earth Engine function to compute Net Primary Productivity (NPP)</h4>

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
  <a><img src="https://private-user-images.githubusercontent.com/27021459/301720501-a729b365-c957-4034-bbcc-d65361c1ae77.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MDgwNTE1NTcsIm5iZiI6MTcwODA1MTI1NywicGF0aCI6Ii8yNzAyMTQ1OS8zMDE3MjA1MDEtYTcyOWIzNjUtYzk1Ny00MDM0LWJiY2MtZDY1MzYxYzFhZTc3LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDAyMTYlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwMjE2VDAyNDA1N1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWQ1MmY0ZDk1NTdiMGFmOTkyNDhjZWYwODEzMDc4Mzk4MGY2ZTE4MzA0YmU3ZTAxODZhM2YwODVhNTU5NzEwZGYmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.DErxO5GLtRN6NyvZ723ZIbxlJ-r8_ihIqxSZfyGUTl8" width="800"></a>
</h1>


[Google Earth Engine (GEE)](https://earthengine.google.com/) is a cloud-based platform that allows users to have an easy access to a petabyte-scale archive of remote sensing data and run geospatial analysis on Google's infrastructure.



## Methodology
The purpose of this code is to provide users with a function for calculating Net Primary Productivity (NPP).



## Google Earth Engine Code Availability

The source code is available in this GitHub repository as well as in the GEE repository, where you can run the example code directly in the interface. To access the repository, use the following link:

https://code.earthengine.google.com/?accept_repo=users/luanabeckerdaluz/NPPalgorithm



## Example

The NPP processing can be executed by using two main functions. After obtaining the NDVI, LST, SOL, We collections and set the constants Topt and LUEmax, the NPP is computed for each set of images using the collectionNPP function. The first image of each collection is also used to exemplify the computation of only one NPP image by using the singleNPP function.

#### singleNPP

``` r
var imageNDVI = ee.Image(...)
var imageLST = ee.Image(...)
var imageSOL = ee.Image(...)
var imageWe = ee.Image(...)
var Topt = CONST
var LUEmax = CONST

// Import NPP processing module
var computeNPP = require('users/luanabeckerdaluz/NPPalgorithm:computeNPP')

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
var ROI = ee.Geometry(...)
var imageCollectionNDVI = ee.ImageCollection(...)
var imageCollectionLST = ee.ImageCollection(...)
var imageCollectionSOL = ee.ImageCollection(...)
var imageCollectionWe = ee.ImageCollection(...)
var Topt = CONST
var LUEmax = CONST

// Import NPP processing module
var computeNPP = require('users/luanabeckerdaluz/NPPalgorithm:computeNPP')

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
