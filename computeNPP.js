/**
* Copyright (c) Luana Becker da Luz and Grazieli Rodigheri 2023
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
* This code contains two main functions that can be used to calculate NPP. One 
* of them is used to generate the NPP (singleNPP) based on only one NDVI image, 
* one LST image, one SolarRadiation (SOL) image, one Water Stress Index (We) 
* image and the constants for optimal temperature for plant growth (Topt) and 
* maximal light use efficiency (LUEmax). The other function is used to generate 
* the NPP for when the input images are collections of images (collectionNPP). 
* The functions are exported and can be accessed by external codes.
*/



/**
* handleInputs
* 
* Handle input values. Some values must not be null.
* 
* @param  {Object} NDVI: NDVI input
* @param  {Object} LST: LST input
* @param  {Object} SOL: SOL input
* @param  {Object} We: We input
* @param  {Object} Topt: Optimal temperature for plant growth
* @param  {Object} LUEmax: Maximal light use efficiency
* @param  {boolean} isCollection: internal flag
* @return {string or boolean} Returns the error string or returns false (no error)
*/
var handleInputs = function(NDVI, LST, SOL, We, Topt, LUEmax, isCollection){
  var error = ""
  
  // input NDVI Image or ImageCollection must not be null
  if (NDVI === null){
    if (isCollection){
      error += "ERROR: imageCollectionNDVI must not be null!\n"
    }
    else{
      error += "ERROR: imageNDVI must not be null!\n"
    }
  }

  // input LST Image or ImageCollection must not be null
  if (LST === null){
    if (isCollection){
      error += "ERROR: imageCollectionLST must not be null!\n"
    }
    else{
      error += "ERROR: imageLST must not be null!\n"
    }
  }

  // input SOL Image or ImageCollection must not be null
  if (SOL === null){
    if (isCollection){
      error += "ERROR: imageCollectionSOL must not be null!\n"
    }
    else{
      error += "ERROR: imageSOL must not be null!\n"
    }
  }

  // input We Image or ImageCollection must not be null
  if (We === null){
    if (isCollection){
      error += "ERROR: imageCollectionWe must not be null!\n"
    }
    else{
      error += "ERROR: imageWe must not be null!\n"
    }
  }

  // input Topt must not be null
  if (Topt === null){
    error += "ERROR: Topt must not be null!\n"
  }
  
  // input LUEmax must not be null
  if(LUEmax === null){
    error += "ERROR: LUEmax must not be null!\n"
  }
  
  // The collections must have the same size
  if (isCollection && NDVI !== null && LST !== null && SOL !== null && We !== null){
    var sizeCondition1 = (NDVI.size()).neq(LST.size())
    var sizeCondition2 = (SOL.size()).neq(We.size())
    var sizeCondition3 = (NDVI.size()).neq(We.size())
    var sizeIsDifferent = ee.Algorithms.If(
      sizeCondition1.or(sizeCondition2).or(sizeCondition3), 
      true, 
      false
    )
    if (sizeIsDifferent.getInfo()){
      error = "ERROR: NDVI, LST, SOL and WE collections don't have the same size!"
    }
  }
  
  // Returns the error if there was an error
  if (error){
    return error
  }
  else{
    return false
  }
}




/**
* singleNPP
* 
* Compute the NPP output image based on a NDVI image, a LST image, a 
* SOL image, a We image and the constants Topt and LUEmax.
* 
* @param  {Image} imageNDVI: NDVI image to be processed
* @param  {Image} imageLST: LST image to be processed
* @param  {Image} imageSOL: SOL image to be processed
* @param  {Image} imageWe: We image to be processed
* @param  {Number} Topt: Optimal temperature for plant growth
* @param  {Number} LUEmax: Maximal light use efficiency
* @return {Image} imageNPP: NPP image processed
*/
var singleNPP = function(imageNDVI, imageLST, imageSOL, imageWe, Topt, LUEmax){
  
  // Handle inputs
  var error = handleInputs(imageNDVI, imageLST, imageSOL, imageWe, Topt, LUEmax, false)
  if (error){
    print(error)
    return error
  }

  // Compute T1
  var imageT1 = ee.Image().expression(
    '0.8 + 0.02*Topt - 0.0005*(Topt**2)', 
    {'Topt': Topt}
  );
  
  // Compute T2
  var imageT2 = ee.Image().expression(
    '1/(1+exp(0.2*(Topt-10-T))) * 1/(1+exp(0.3*(-Topt-10+T)))', 
    {'Topt':Topt, 'T':imageLST}
  );
  
  // Compute PAR
  var imagePAR = imageSOL.multiply(0.5);

  // Compute FPAR
  var imageFPAR = imageNDVI.multiply(1.2).subtract(0.14);
  
  // Compute APAR
  var imageAPAR = imagePAR.multiply(imageFPAR);
  
  // Compute LUE
  var imageLUE = ee.Image().expression(
    'LUEmax * T1 * T2 * We', 
    {'LUEmax':LUEmax, 'T1':imageT1, 'T2':imageT2, 'We':imageWe}
  )  
  
  // Compute NPP, rename, set properties and return
  return imageAPAR
    .multiply(imageLUE)
    .rename('NPP')
}




/**
* collectionNPP
* 
* Compute the NPP output collection based on a NDVI collection, a LST collection,
* a SOL collection, a We collection and the constants Topt and LUEmax.
* 
* @param  {ImageCollection} imageCollectionNDVI: NDVI collection to be processed
* @param  {ImageCollection} imageCollectionLST: LST collection to be processed
* @param  {ImageCollection} imageCollectionSOL: SOL collection to be processed
* @param  {ImageCollection} imageCollectionWe: We collection to be processed
* @param  {Number} Topt: Optimal temperature for plant growth
* @param  {Number} LUEmax: Maximal light use efficiency
* @return {ImageCollection} ImageCollectionNPP: NPP collection processed
*/
var collectionNPP = function(
  imageCollectionNDVI, 
  imageCollectionLST, 
  imageCollectionSOL, 
  imageCollectionWe, 
  Topt, 
  LUEmax){
  
  // Handle inputs
  var error = handleInputs(
    imageCollectionNDVI, 
    imageCollectionLST, 
    imageCollectionSOL, 
    imageCollectionWe, 
    Topt, 
    LUEmax, 
    true
  )
  if (error){
    print(error)
    return error
  }
  
  /**
   * Obtain ImageCollections sizes. They all have the same size because this
   * has been checked previously. 
   */
  var size = imageCollectionNDVI.size()
  
  // Convert ImageCollections into Lists in order to iterate
  var IClistNDVI = imageCollectionNDVI.toList(imageCollectionNDVI.size())
  var IClistLST = imageCollectionLST.toList(imageCollectionLST.size())
  var IClistSOL = imageCollectionSOL.toList(imageCollectionSOL.size())
  var IClistWe = imageCollectionWe.toList(imageCollectionWe.size())
  
  // Iterates through the collections from 0 to size-1
  var sequenceRange = ee.List.sequence(0, size.subtract(1))
  var resultsNPP = sequenceRange.map(function(i){
    // Get NDVI, LST, SOL and We images at index i.
    var NDVI = ee.Image(IClistNDVI.get(i))
    var LST = ee.Image(IClistLST.get(i))
    var SOL = ee.Image(IClistSOL.get(i))
    var We = ee.Image(IClistWe.get(i))
    
    // Compute single NPP
    var NPP = singleNPP(NDVI, LST, SOL, We, Topt, LUEmax)
    
    return NPP.set("system:index", ee.String(i));
  })
  
  // Since a list has been iterated through, now cast to an ImageCollection
  var imageCollectionNPP = ee.ImageCollection(resultsNPP)
  
  // Return NPP ImageCollection
  return imageCollectionNPP
}



// Exports the singleNPP and collectionNPP functions to be accessed from other codes
exports.singleNPP = singleNPP
exports.collectionNPP = collectionNPP
