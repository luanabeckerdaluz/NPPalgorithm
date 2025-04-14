var coord_label_position = /* color: #d63000 */ee.Geometry.Point([-55.46855547396158, -28.99312888993198]);

/**
* Copyright (c) Luana Becker da Luz 2025
* 
* Luana Becker da Luz
* luanabeckerdaluz@gmail.com
* National Institute for Space Research (INPE)
* 
* Grazieli Rodigheri
* grazielirodigheri@gmail.com
* Federal University of Rio Grande do Sul (UFRGS)
* 
* This source code is licensed under the MIT license found in the LICENSE file 
* in the root directory of this source tree.
* ____________________________________________________________________________
* 
* This code has an example of the use of the two main NPP functions developed 
* (singleNPP and collectionNPP). After obtaining the NDVI (MOD), We (MOD), LST 
* (MOD) and SOL (ERA5) collections and setting the constants Topt and LUEmax, 
* the NPP is computed for each set of images using the collectionNPP function. 
* The first image of each collection is also used to exemplify below the 
* computation of only one NPP image by using the singleNPP function.
*/

 
// ==============================================================================
// Region of Interest (ROI)
var ROI_FC = ee.FeatureCollection("projects/ee-luanabeckerdaluz/assets/paper2NPP/shapefiles/shpMesoregionRS")
var ROI = ROI_FC.geometry()
var ROI_BBOX = ROI.bounds()
Map.addLayer(ROI, {}, 'ROI')
Map.centerObject(ROI)


// ==============================================================================
// GIFs parameters (based on ROI size)
var gifFontScale = 350
var gifParams = {
  dimensions: 800,
  framesPerSecond: 3,
  ROI: ROI_BBOX
}


// ==============================================================================
// Set scale (m/px) to reproject and upscale/downscale the input 
// ... collections NDVI, LST, SOL and We.
var SCALE_M_PX = 250


// ==============================================================================
// Required dates
var dates = ee.List([
  '2018-01-01',
  '2018-01-17',
  '2018-02-02',
  '2018-02-18',
  '2018-03-06',
  '2018-03-22'
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


// ==============================================================================
// NDVI collection
var collectionNDVI = ee.ImageCollection('MODIS/061/MOD13Q1')
  .filterBounds(ROI_BBOX)
  .filterDate(startDate, endDate)
  .select('NDVI')
  .map(function(img){
    return img
      .rename('NDVI')                               // Rename band
      .multiply(0.0001)                             // Apply band scale
      .reproject('EPSG:4326', null, SCALE_M_PX)     // Downscale/Upscale image
      .clip(ROI)                                    // Clipt to geometry
      .set("date", img.date().format("yyyy-MM-dd")) // Set date property
  })

Map.addLayer(collectionNDVI.first(), NDVIvis, 'IN - collectionNDVI img1')

// Generate gif
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


// ==============================================================================
// Land Surface Temperature (LST) collection
//     -> For each desired date, obtain all images between date and date + 16d
//        ... and compute the mean of these images (mean temperature).
var collectionLST = dates.map(function(dateString){
  return ee.ImageCollection("MODIS/061/MOD11A2")
    .filterBounds(ROI_BBOX)
    .filterDate(ee.Date(dateString), ee.Date(dateString).advance(16, "day"))
    .select('LST_Day_1km')
    .mean()                                   // Compute mean of the 2 images
    .rename("LST")                            // Rename band
    .multiply(0.02)                           // Apply band scale
    .subtract(273.15)                         // Convert from Kelvin to Celsius
    .reproject('EPSG:4326', null, SCALE_M_PX) // Reproject and Down/Upscale
    .clip(ROI)                                // Clip geometry
    .set("date", dateString)                  // Set date property
})
// Cast list object to imageCollection
collectionLST = ee.ImageCollection(collectionLST)

Map.addLayer(collectionLST.first(), LSTvis, 'IN - collectionLST img1')

// Generate gif
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
    .filterBounds(ROI_BBOX)
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

// Generate gif
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
// WeMODIS is generated through band math between the ET and PET bands
//     -> For each desired date, obtain all images between date and date + 16d
//        ... and compute the sum of these images (accumulate evapotranspiration).
var collectionWe = dates.map(function(dateString){
  // Accumulates the two 8-day images to one 16-day image.
  var imageSum16days = ee.ImageCollection("MODIS/006/MOD16A2")
    .filterDate(ee.Date(dateString), ee.Date(dateString).advance(16, "day"))
    .filterBounds(ROI)
    .sum()

  // Compute MODIS We
  var ET = imageSum16days.select('ET').multiply(0.1);   // Select and Apply scale
  var PET = imageSum16days.select('PET').multiply(0.1); // Select and Apply scale
  var We = ET.divide(PET).multiply(0.5).add(0.5);

  // For each We image, rename band, clip geometry and set date property
  return We
    .rename('We')                             // Rename band
    .reproject('EPSG:4326', null, SCALE_M_PX) // Downscale/Upscale image
    .clip(ROI)                                // Clip geometry
    .set("date", dateString)                  // Set date property
})
// Cast list object to imageCollection
collectionWe = ee.ImageCollection(collectionWe)

Map.addLayer(collectionWe.first(), WEvis, 'IN - collectionWe img1')

// Generate gif
var GIFcollectionWe = collectionWe.map(function(img){ 
  return img.visualize(WEvis).set("date", img.get("date"))
})
var GIF_We = utils.gif_label_return({
  col: GIFcollectionWe,
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
      "- Image Collection We:", 
      collectionWe,
      GIF_We,
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
  collectionWe, 
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
var We = collectionWe.first()

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
