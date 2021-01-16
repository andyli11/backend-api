const express = require('express');
const firebase = require('firebase-admin');
const { db } = require('../../utils/firebase');
const router = express.Router();

const optimizeCosts = (sites, budget) => {

  const helper = (arr, sites, budget, currIndex, currList, currCost, currUrgencyMet) => {

    // Return if reached end.
    if (currIndex === sites.length) {
      return [];
    }

    // Recurse through not adding option.
    helper(arr, sites, budget, currIndex + 1, currList, currCost, currUrgencyMet);

    // Create object
    let withSite = {
      list: [ ...currList, sites[currIndex] ],
      totalCost: currCost + sites[currIndex].cost,
      urgencyMet: currUrgencyMet + sites[currIndex].urgency
    };

    // Only progress if meets budget.
    if (withSite.totalCost <= budget) {
      // Add object to array.
      arr.push(withSite);
      // Recurse through adding option.
      helper(arr, sites, budget, currIndex + 1, withSite.list, withSite.totalCost, withSite.urgencyMet);
    }

    // Return sorted by urgencyMet.
    return arr.sort((a, b) => b.urgencyMet - a.urgencyMet);
  }

  return helper([], sites, budget, 0, [], 0, 0);
}

const getSites = async () => {
  let list = [];
  await db.collection('sites').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
  });
  return list;
}

router.get('/', async (req, res, next) => {

  if (!req.query) {
    return res.status(500).json({
      result: 'Missing req.query.'
    });
  }
  if (!req.query.budget) {
    return res.status(400).json({
      result: 'Missing budget.'
    });
  }

  let budget = parseInt(req.query.budget);

  if (isNaN(budget) || budget <= 0) {
    return res.status(400).json({
      result: 'Budget must be a positive number.'
    });
  }

  let sites = await getSites();
  return res.status(200).json({ result: optimizeCosts(sites, budget) });
});

module.exports = router;
