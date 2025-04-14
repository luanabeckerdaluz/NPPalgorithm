var coord_label_position = /* color: #d63000 */ee.Geometry.Point([-52.90799000231241, -28.226083749665666]);

/**
* Copyright (c) Luana Becker da Luz 2025
* 
* Luana Becker da Luz
* luanabeckerdaluz@gmail.com
* National Institute for Space Research (INPE)
* 
* This source code is licensed under the MIT license found in the LICENSE file 
* in the root directory of this source tree.
* ____________________________________________________________________________
* 
* This code has an example of the use of the two main NPP functions developed 
* (singleNPP and collectionNPP). After obtaining the NDVI and LST (Landsat), 
* SOL (ERA5) and We (Landsat TVDI) collections and setting the constants Topt
* and LUEmax, the NPP is computed for each set of images using the collectionNPP 
* function. The first image of each collection is also used to exemplify below 
* the computation of only one NPP image by using the singleNPP function.
*/

 
// ==============================================================================
// Region of Interest (ROI)
var ROI_FC = ee.FeatureCollection("projects/ee-luanabeckerdaluz/assets/paper2NPP/shapefiles/shpLavoura");
var ROI = ROI_FC.geometry()
var ROI_BBOX = ROI.bounds()
Map.addLayer(ROI, {}, 'ROI')
Map.centerObject(ROI)
print(ROI)


// ==============================================================================
// GIFs parameters (based on ROI size)
var gifFontScale = 1
var gifParams = {
  dimensions: 800,
  framesPerSecond: 3,
  ROI: ROI_BBOX
}


// ==============================================================================
// Set scale (m/px) to reproject and upscale/downscale the input 
// ... collections NDVI, LST, SOL and We.
var SCALE_M_PX = 30


// ==============================================================================
// Required dates
var dates = ee.List([
  '2017-11-20', 
  '2018-01-07',
  '2018-02-08', 
  '2018-02-24'
])
var startDate = ee.Date(dates.get(0))
var endDate = ee.Date(dates.get(-1)).advance(1,"day")


// ==============================================================================
// Visualization palette 
var pal = ['lightgreen','darkgreen','yellow','orange','red','darkred']
var LSTvis  = {min:20,  max:35,  palette:pal}
var NDVIvis = {min:0.2, max:1.0, palette:pal}
var SOLvis  = {min:315, max:415, palette:pal}
var WEvis   = {min:0.5, max:1.0, palette:pal}
var NPPvisParams = {min:20, max:130, palette:pal}


// ==============================================================================
// Import NPP and label gif modules
var computeNPP = require('users/luanabeckerdaluz/NPPalgorithm:computeNPP')
var utils = require('users/luanabeckerdaluz/GEEtools:gif_label')


/**===================================================================
* NDVI images and LST images
*==================================================================*/

/*
Author: Sofia Ermida (sofia.ermida@ipma.pt; @ermida_sofia)
This code is free and open. By using this code and any data derived with it, 
you agree to cite the following reference in any publications derived from them:
Ermida, S.L., Soares, P., Mantas, V., Göttsche, F.-M., Trigo, I.F., 2020. 
    Google Earth Engine open-source code for Land Surface Temperature estimation from the Landsat series.
    Remote Sensing, 12 (9), 1471; https://doi.org/10.3390/rs12091471
*/

// link to the code that computes the Landsat LST
var LandsatLST = require('users/sofiaermida/landsat_smw_lst:modules/Landsat_LST.js')

var NDVI_LST_IC = ee.ImageCollection(dates.map(function(dateString){
  var sd = ee.Date(dateString)
  var ed = ee.Date(dateString).advance(1,"day")
  
  return LandsatLST.collection("L8", sd, ed, ROI_BBOX, true)
    .select("NDVI", "LST")
    .mosaic()
    .reproject("EPSG:4326", null, SCALE_M_PX)
    .clip(ROI)
    .set("date", dateString)
}))


// Generate NDVI collection and gif

var collectionNDVI = NDVI_LST_IC
  .select("NDVI")
  
Map.addLayer(collectionNDVI.first(), NDVIvis, 'IN - collectionNDVI img1')

var GIFcollectionNDVI = collectionNDVI.map(function(img){ 
  return img.visualize(NDVIvis).set("date", img.get("date")) 
})
var GIF_NDVI = utils.gif_label_return({
  col: GIFcollectionNDVI,
  coord_label_position: coord_label_position,
  col_label_attribute: "date",
  fontScale: gifFontScale,
  gifParams: gifParams
})

// Generate LST collection and gif

var collectionLST = NDVI_LST_IC
  .select("LST")
  .map(function(img){
    return img
      .subtract(273.15) // Kelvin to Celsius
      .copyProperties(img)
  })

Map.addLayer(collectionLST.first(), LSTvis, 'IN - collectionLST img1')

var GIFcollectionLST = collectionLST.map(function(img){ 
  return img.visualize(LSTvis).set("date", img.get("date")) 
})
var GIF_LST = utils.gif_label_return({
  col: GIFcollectionLST,
  coord_label_position: coord_label_position,
  col_label_attribute: "date",
  fontScale: gifFontScale,
  gifParams: gifParams
})


// ==============================================================================
// Solar Radiation (SOL) collection
//     -> For each desired date, obtain all images between date and date + 16d
//        ... and compute the sum of these images (accumulate radiation).
var collectionSOL = dates.map(function(dateString){
  return ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR")
    .filterBounds(ROI)
    .filterDate(ee.Date(dateString), ee.Date(dateString).advance(16, "day"))
    .select('surface_solar_radiation_downwards_sum')
    .sum()
    .rename("SOL")                            // Rename band
    .divide(1e6)                              // Convert J/m² to MJ/m²
    .reproject('EPSG:4326', null, SCALE_M_PX) // Reproject and Down/Upscale
    .clip(ROI)                                // Clip geometry
    .set("date", dateString)                  // Set date property
})
// Cast list object to imageCollection
collectionSOL = ee.ImageCollection(collectionSOL)

Map.addLayer(collectionSOL.first(), SOLvis, 'IN - collectionSOL img1')

// Generate SOL gif
var GIFcollectionSOL = collectionSOL.map(function(img){ 
  return img.visualize(SOLvis).set("date", img.get("date")) 
})
var GIF_SOL = utils.gif_label_return({
  col: GIFcollectionSOL,
  coord_label_position: coord_label_position,
  col_label_attribute: "date",
  fontScale: gifFontScale,
  gifParams: gifParams
})


// ==============================================================================
// Temperature-Vegetation Dryness Index (TVDI)
//   -> Use NDVI and LST collections to compute TVDI

var computeTVDI = require('users/luanabeckerdaluz/TVDIalgorithm:computeTVDI')

var collectionWeTVDI = computeTVDI.collectionTVDI(
    collectionNDVI, 
    collectionLST, 
    ROI, 
    SCALE_M_PX,
    true // When computing, copy "date" property from NDVI
  ).map(function(img){
    return ee.Image(1.0).subtract(img.multiply(0.5))
      .rename("We")
      .clip(ROI)
      .copyProperties(img)
  })

Map.addLayer(collectionWeTVDI.first(), SOLvis, 'IN - collectionSOL img1')

// Generate We TVDI GIF
var GIFcollectionWeTVDI = collectionWeTVDI.map(function(img){ 
  return img.visualize(WEvis).set("date", img.get("date")) 
})
var GIF_WeTVDI = utils.gif_label_return({
  col: GIFcollectionWeTVDI,
  coord_label_position: coord_label_position,
  col_label_attribute: "date",
  fontScale: gifFontScale,
  gifParams: gifParams
})


// ==============================================================================
// Optimal Temperature
var CONSTANT_TOPT = 21.66


// ==============================================================================
// Max LUE
var CONSTANT_LUEMAX = 0.72


print("============== INPUTS ==============",
      "- Image Collection NDVI:", 
      collectionNDVI,
      GIF_NDVI,
      "- Image Collection LST:",
      collectionLST,
      GIF_LST,
      "- Image Collection SOL:", 
      collectionSOL,
      GIF_SOL,
      "- Image Collection We TVDI:", 
      collectionWeTVDI,
      GIF_WeTVDI,
      "- Optimal Temperature:", 
      CONSTANT_TOPT,
      "- Maximum LUE:", 
      CONSTANT_LUEMAX
)


// ==============================================================================
// Compute collection NPP

// Compute collectionNPP
var collectionNPP = computeNPP.collectionNPP(
  collectionNDVI, 
  collectionLST,
  collectionSOL, 
  collectionWeTVDI, 
  CONSTANT_TOPT, 
  CONSTANT_LUEMAX
)

// Print and add the first two computed images to the map
var img1 = ee.Image(collectionNPP.toList(collectionNPP.size()).get(0))
var img2 = ee.Image(collectionNPP.toList(collectionNPP.size()).get(1))
Map.addLayer(img1, NPPvisParams, 'OUT - collectionNPP img1')
Map.addLayer(img2, NPPvisParams, 'OUT - collectionNPP img2')


// Collection GIF

var collectionNPPList = collectionNPP.toList(collectionNPP.size())
var colNppVisualize = ee.List.sequence(0, dates.size().subtract(1)).map(function(i){
  var img = ee.Image(collectionNPPList.get(i))
  var date = ee.String(dates.get(i))
  return img.visualize(NPPvisParams).set("date", date)
})
colNppVisualize = ee.ImageCollection(colNppVisualize)

var GIFcollectionNPP = utils.gif_label_return({
  col: colNppVisualize,
  coord_label_position: coord_label_position,
  col_label_attribute: "date",
  fontScale: gifFontScale,
  gifParams: gifParams
})

print(
  "===== collectionNPP example ========",
  collectionNPP, 
  "The first two calculated NPP images",
  "...have been added to the map!",
  GIFcollectionNPP
)


// Compute single NPP

var NDVI = collectionNDVI.first()
var LST = collectionLST.first()
var SOL = collectionSOL.first()
var We = collectionWeTVDI.first()

// Compute singleNPP
var imageNPP = computeNPP.singleNPP(
  NDVI, 
  LST, 
  SOL, 
  We, 
  CONSTANT_TOPT, 
  CONSTANT_LUEMAX
)

// Computes the number of pixels of images
var reduceParams = {
  reducer: ee.Reducer.count(), 
  scale:SCALE_M_PX,
  geometry: ROI
}

print(
  "======== singleNPP example =========",
  'Note that the images have different numbers of pixels:',
  '- NDVI Pixels count:', ee.Number(NDVI.reduceRegion(reduceParams).get("NDVI")),
  '- LST Pixels count:',  ee.Number(LST.reduceRegion(reduceParams).get("LST")),
  '- SOL Pixels count:',  ee.Number(SOL.reduceRegion(reduceParams).get("SOL")),
  '- We Pixels count:',  ee.Number(We.reduceRegion(reduceParams).get("We")),
  "computed NPP: ", 
  imageNPP,
  imageNPP.getDownloadURL({name:"NPP", region:ROI})
)
Map.addLayer(imageNPP, NPPvisParams, "OUT - imageNPP")
