import { readMatrix } from 'https://deno.land/std@0.82.0/encoding/csv.ts';
import { BufReader } from "https://deno.land/std@0.202.0/io/mod.ts";


import { 
  makeEntrants, makeRoundPairings, makeResults, pairingsAfterRound,
  standingsAfterRound, Repeats
} from "./code.js";

function randBetween(min, max) {
  var r = Math.random() * (max - min) + min;
  return Math.floor(r);
}

function simResult(p, round) {
  var r1 = p.first.seed;
  var r2 = p.second.seed;
  var rand = Math.random();
  var l_score = randBetween(200, 350);
  var w_score = randBetween(351, 600);
  var start = Math.random() > 0.5 ? "first" : "second";
  // Pick the winner based on seeding (better seed = higher prob. of winning).
  var prob_higher_seed_wins = 0.75;
  var winner, loser;
  if (rand < prob_higher_seed_wins) {
    winner = p.first;
    loser = p.second;
  } else {
    winner = p.second;
    loser = p.first;
  }
  // Swap first and second if second is higher seeded	
  // (greater numerical value = lower seed)
  if (r1 > r2) {
    var tmp = winner;
    winner = loser;
    loser = tmp;
  }
  // Special-case byes.
  if (p.first.name == "Bye") {
    winner = p.second;
    loser = p.first;
    w_score = 50;
    l_score = 0;
  }
  if (p.second.name == "Bye") {
    loser = p.second;
    winner = p.first;
    w_score = 50;
    l_score = 0;
  }
  var result = [round, winner.name, w_score, loser.name, l_score, start];
  return result;
}

function simRoundResults(pairings, round) {
  return pairings.map(p => simResult(p, round));
}

function displayPairing(p, entrants) {
  var f_name = entrants.entrants[p.first.name];
  var s_name = entrants.entrants[p.second.name];
  return {first: f_name, second: s_name, repeats: p.repeats}
}

function lookup_seeding(entrants, name) {
  return entrants.seeding.find((e) => e.name == name)
}

function sim(entrants, round_pairings) {
  console.log("Seeding:");
  console.table(entrants.seeding);
  console.log("Round Pairings:");
  console.table(round_pairings);
  var res = makeResults([]);
  var repeats = new Repeats();
  for (var r = 0; r < round_pairings.length - 1; r++) {
    var pairings = pairingsAfterRound(res, entrants, repeats, round_pairings, r);
    for (var p of pairings) {
      p.first = lookup_seeding(entrants, p.first.name);
      p.second = lookup_seeding(entrants, p.second.name);
    }
    console.log("Pairings for round", r + 1);
    var display_pairings = pairings.map(p => displayPairing(p, entrants));
    console.table(display_pairings);
    var results = simRoundResults(pairings, r + 1);
    var new_res = makeResults(results);
    console.log("Simulated results for round", r + 1);
    console.table(new_res.results);
    for (var gr of new_res.results) {
      res.addGeneratedResult(gr);
    }
    var standings = standingsAfterRound(res, entrants, r + 1);
    console.log("Standings after round", r + 1);
    console.table(standings);
  }
  return res;
}

function roundPairings() {
  var round_pairings = [
    [1, "S"],
    [2, "S"],
    [3, "S"],
    [4, "S"],
    [5, "S"],
    [6, "S"],
    [7, "S"],
    [8, "S"],
    [9, "S"],
    [10, "S"],
    [11, "S"],
    [12, "S"],
    [13, "S"],
    [14, "S"],
    [15, "S"],
  ]
  return makeRoundPairings(round_pairings);
}

async function main() {
  const f = await Deno.open('entrants.csv');
  const content = await readMatrix(new BufReader(f));
  var entrants = makeEntrants(content);
  var round_pairings = roundPairings();
  sim(entrants, round_pairings);
}

main();
