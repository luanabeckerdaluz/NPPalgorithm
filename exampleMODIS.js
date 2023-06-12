/**
* Copyright (c) Leonardo Becker da Luz 2023
* 
* Leonardo Becker da Luz
* leobeckerdaluz@gmail.com
* National Institute for Space Research (INPE)
* 
* This source code is licensed under the MIT license found in the LICENSE file 
* in the root directory of this source tree.
* ____________________________________________________________________________
* 
* This code has an example of the use of the two main NPP functions developed 
* (singleNPP and collectionNPP). After obtaining the NDVI, LST, SOL and We
* collections and setting the constants Topt and LUEmax, the NPP is computed 
* for each set of images using the collectionNPP function. The first image of 
* each collection is also used to exemplify below the computation of only one 
* NPP image by using the singleNPP function.
*/


 
// ==============================================================================
// Region of Interest (ROI)
var ROIasset = "users/leobeckerdaluz/Artigo2_NPP/shapefiles/shpMesoregionRS"
var ROI_FC = ee.FeatureCollection(ROIasset)
var ROI = ROI_FC.geometry()
Map.addLayer(ROI, {}, 'ROI')
Map.centerObject(ROI)



// ==============================================================================
// Set scale (m/px) to reproject and upscale/downscale the input 
// ... collections NDVI, LST, SOL and We.
var SCALE_M_PX = 1000



// ==============================================================================
// Required dates
var dates = ee.List([
  '2018-01-01',
  '2018-01-17',
  '2018-02-02',
  '2018-02-18'
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
// NDVI collection
var collectionNDVI = ee.ImageCollection('MODIS/061/MOD13Q1')
  .filterBounds(ROI)
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



// ==============================================================================
// Land Surface Temperature (LST) collection
//     -> For each desired date, obtain all images between date and date + 16d
//        ... and compute the mean of these images (mean temperature).
var collectionLST = dates.map(function(dateString){
  return ee.ImageCollection("MODIS/061/MOD11A2")
    .filterBounds(ROI)
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
    .set("data", dateString)                  // Set date property
})
// Cast list object to imageCollection
collectionWe = ee.ImageCollection(collectionWe)

Map.addLayer(collectionWe.first(), WEvis, 'IN - collectionWe img1')



// ==============================================================================
// Optimal Temperature
var CONSTANT_TOPT = 21.66



// ==============================================================================
// Max LUE
var CONSTANT_LUEMAX = 0.72



print("============== INPUTS ==============",
      "- Image Collection NDVI:", 
      collectionNDVI,
      "- Image Collection LST:", 
      collectionLST,
      "- Image Collection SOL:", 
      collectionSOL,
      "- Image Collection We:", 
      collectionWe,
      "- Optimal Temperature:", 
      CONSTANT_TOPT,
      "- Maximum LUE:", 
      CONSTANT_LUEMAX
)



// ==============================================================================
// Compute NPP

var computeNPP = require('users/leobeckerdaluz/NPP_algorithm:computeNPP')

print("===== collectionNPP example ========")

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
print(
  collectionNPP, 
  'The first two calculated NPP images have been added to the map!'
)



print("======== singleNPP example =========")

var NDVI = collectionNDVI.first()
var LST = collectionLST.first()
var SOL = collectionSOL.first()
var We = collectionWe.first()

// Computes the number of pixels of images
var reduceParams = {
  reducer: ee.Reducer.count(), 
  scale:SCALE_M_PX,
  geometry: ROI
}
print(
  'Note that the images have different numbers of pixels:',
  '- NDVI Pixels count:', ee.Number(NDVI.reduceRegion(reduceParams).get("NDVI")),
  '- LST Pixels count:',  ee.Number(LST.reduceRegion(reduceParams).get("LST")),
  '- SOL Pixels count:',  ee.Number(SOL.reduceRegion(reduceParams).get("SOL")),
  '- We Pixels count:',  ee.Number(We.reduceRegion(reduceParams).get("We"))
)

// Compute singleNPP
var imageNPP = computeNPP.singleNPP(
  NDVI, 
  LST, 
  SOL, 
  We, 
  CONSTANT_TOPT, 
  CONSTANT_LUEMAX
)

// Print and add the singleNPP image to the map
print("imageNPP:", 
      imageNPP,
      imageNPP.getDownloadURL({name:"NPP", region:ROI}))
Map.addLayer(imageNPP, NPPvisParams, "OUT - imageNPP")

