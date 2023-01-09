/**
* Copyright (c) Leonardo Becker da Luz and Grazieli Rodigheri 2023
* 
* Leonardo Becker da Luz
* leobeckerdaluz@gmail.com
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
* (singleNPP and collectionNPP). After obtaining the NDVI, LST, SOL and We
* collections and set the constants Topt and LUEmax, the NPP is computed for 
* each set of images using the collectionNPP function. The first image of each 
* collection is also used to exemplify the computation of only one NPP image 
* by using the singleNPP function.
*/


 
// ===================================================================
// Region of Interest (ROI)
var ROI = ee.FeatureCollection("users/leobeckerdaluz/FIXED_shapes/mesoregionRS") 
Map.addLayer(ROI, {}, 'ROI')
Map.centerObject(ROI)


// ===================================================================
// Set scale (m/px) to upscale/downscale NDVI, LST, SOL and We images
// var SCALE_M_PX = 1000
var SCALE_M_PX = 250


// ===================================================================
// All desired dates
var dates = ['2018-01-01','2018-01-17','2018-02-02','2018-02-18']


// ===================================================================
// NDVI collection
var imageCollectionNDVI = dates.map(function(date_string){
  return ee.ImageCollection('MODIS/061/MOD13Q1')
    .filterBounds(ROI)
    .filterDate(ee.Date(date_string), ee.Date(date_string).advance(16, "day"))
    .select('NDVI')
    .mean()
    .clip(ROI)
    .rename('NDVI')                             // Rename band
    .multiply(0.0001)                           // Apply band scale
    .reproject('EPSG:4326', null, SCALE_M_PX)   // Downscale/Upscale image
    .set("date", date_string)                   // Set date property
})
/**
 * Since it iterated over a list of dates, the return object was a list. 
 * So, cast it to imageCollection.
 */
imageCollectionNDVI = ee.ImageCollection(imageCollectionNDVI)

Map.addLayer(imageCollectionNDVI.first(), {min:0.2,max:1.0,palette:['red','white','darkgreen']}, 'imageCollectionNDVI first')


// ===================================================================
// LST collection
var imageCollectionLST = dates.map(function(date_string){
  return ee.ImageCollection('MODIS/061/MOD11A2')
    .filterBounds(ROI)
    .filterDate(ee.Date(date_string), ee.Date(date_string).advance(16, "day"))
    .select('LST_Day_1km')
    .mean()
    .clip(ROI)
    .rename('LST')                              // Rename band
    .multiply(0.02)                             // Apply band scale
    .subtract(273.15)                           // Convert to degree celcius
    .reproject('EPSG:4326', null, SCALE_M_PX)   // Downscale/Upscale image
    .set("date", date_string)                   // Set date property
})
/**
 * Since it iterated over a list of dates, the return object was a list. 
 * So, cast it to imageCollection.
 */
imageCollectionLST = ee.ImageCollection(imageCollectionLST)

Map.addLayer(imageCollectionLST.first(), {min:20, max:35, palette:['lightgreen','darkgreen','yellow','orange','red','darkred']}, 'imageCollectionLST first')


// ===================================================================
// Solar Radiation (SOL) collection
var imageCollectionSOL = dates.map(function(date_string){
  return ee.ImageCollection("ECMWF/ERA5_LAND/HOURLY")
    .filterBounds(ROI)
    .filterDate(ee.Date(date_string), ee.Date(date_string).advance(16, "day"))
    .select('surface_solar_radiation_downwards_hourly')
    .sum()
    .clip(ROI)                                  // Clip geometry
    .rename("SOL")                              // Rename band
    .divide(1e6)                                // Convert J/m² to MJ/m²
    .reproject('EPSG:4326', null, SCALE_M_PX)   // Downscale/Upscale image
    .set("date", date_string)                   // Set date property
})
/**
 * Since it iterated over a list of dates, the return object was a list. 
 * So, cast it to imageCollection.
 */
imageCollectionSOL = ee.ImageCollection(imageCollectionSOL)

Map.addLayer(imageCollectionSOL.first(), {min:315, max:415, palette:['lightgreen','darkgreen','yellow','orange','red','darkred']}, 'imageCollectionSOL first')


// ===================================================================
// WeMODIS is generated through a band math between the ET and PET bands.
var imageCollectionWe = dates.map(function(date_string){
  // Accumulates the two 8-day images to one 16-day image.
  var imagem_2datas_somadas = ee.ImageCollection("MODIS/006/MOD16A2")
    .filterDate(ee.Date(date_string), ee.Date(date_string).advance(16, "day"))
    .filterBounds(ROI)
    .sum()
    
  // Compute MODIS We
  var ET = imagem_2datas_somadas.select('ET');
  var PET = imagem_2datas_somadas.select('PET');
  var We = ET.divide(PET).multiply(0.5).add(0.5);
    
  // For each we image, rename band, clip geometry, apply soybean mask and set date property
  return We
    .rename('We')
    .clip(ROI)
    .set("data", date_string)
})
/**
 * Since it iterated over a list of dates, the return object was a list. 
 * So, cast it to imageCollection.
 */
imageCollectionWe = ee.ImageCollection(imageCollectionWe)

Map.addLayer(imageCollectionWe.first(), {min:0.5, max:1.0, palette:['lightgreen','darkgreen','yellow','orange','red','darkred']}, 'imageCollectionWe first')


// ===================================================================
// Optimal Temperature
var Topt = ee.Image(24.85);


// ===================================================================
// Max LUE
var LUEmax = ee.Image(0.926);


 

print("============== INPUTS ==============",
      "- Region of Interest:", 
      ROI,
      "- Scale (m/px):", 
      SCALE_M_PX,
      "- Image Collection NDVI:", 
      imageCollectionNDVI,
      "- Image Collection LST:", 
      imageCollectionLST,
      "- Image Collection SOL:", 
      imageCollectionSOL,
      "- Image Collection We:", 
      imageCollectionWe,
      "- Optimal Temperature:", 
      Topt,
      "- Maximum LUE:", 
      LUEmax)




// APPLY SOYBEAN MASK ????
// APPLY SOYBEAN MASK ????
// APPLY SOYBEAN MASK ????
// APPLY SOYBEAN MASK ????
// APPLY SOYBEAN MASK ????
// APPLY SOYBEAN MASK ????
// APPLY SOYBEAN MASK ????
// APPLY SOYBEAN MASK ????
// APPLY SOYBEAN MASK ????
// APPLY SOYBEAN MASK ????
// APPLY SOYBEAN MASK ????
// APPLY SOYBEAN MASK ????



// ===================================================================
// Compute NPP
// ===================================================================

var computeNPP = require('users/leobeckerdaluz/NPP_algorithm:computeNPP')

var NPPvisParams = {min:20, max:130, palette:['lightgreen','darkgreen','yellow','orange','red','darkred']}

  
print("===== collection NPP example =======")

var imageCollectionNPP = computeNPP.collectionNPP(
  imageCollectionNDVI, 
  imageCollectionLST,
  imageCollectionSOL, 
  imageCollectionWe, 
  Topt, 
  LUEmax)

print(imageCollectionNPP)
var img1 = ee.Image(imageCollectionNPP.toList(imageCollectionNPP.size()).get(0))
var img2 = ee.Image(imageCollectionNPP.toList(imageCollectionNPP.size()).get(1))

Map.addLayer(img1, NPPvisParams, 'imageCollectionNPP img1')
Map.addLayer(img2, NPPvisParams, 'imageCollectionNPP img2')
print('The first two calculated NPP images were added to the map!')

print("======== image NPP example =========")

var NDVI = imageCollectionNDVI.first()
var LST = imageCollectionLST.first()
var SOL = imageCollectionSOL.first()
var We = imageCollectionWe.first()

// Computes the number of pixels in both images
var reduceRegionParameters = {
  reducer: ee.Reducer.count(), 
  scale:SCALE_M_PX,
  geometry: ROI
}
print('Note that the images have different numbers of pixels:',
      '- NDVI Pixels count:', ee.Number(NDVI.reduceRegion(reduceRegionParameters).get("NDVI")),
      '- LST Pixels count:',  ee.Number(LST.reduceRegion(reduceRegionParameters).get("LST")),
      '- SOL Pixels count:',  ee.Number(SOL.reduceRegion(reduceRegionParameters).get("SOL")),
      '- We Pixels count:',  ee.Number(We.reduceRegion(reduceRegionParameters).get("We")))

// Compute singleNPP
var imageNPP = computeNPP.singleNPP(NDVI, LST, SOL, We, Topt, LUEmax)

Map.addLayer(imageNPP, NPPvisParams, "imageNPP")
print("imageNPP:", 
      imageNPP,
      imageNPP.getDownloadURL({name:"NPP", region:ROI.geometry()}))

