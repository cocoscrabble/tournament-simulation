import { readMatrix } from 'https://deno.land/std@0.82.0/encoding/csv.ts';
import { BufReader } from "https://deno.land/std@0.202.0/io/mod.ts";


import { 
  makeEntrants, makeRoundPairings, makeResults, pairingsAfterRound,
  standingsAfterRound, runPairings, formatPairings,
  Repeats, Starts
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
  var start;
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
  // Convert starts to "winner went first"
  start = p.first.name == winner.name ? "first" : "second";
  var result = [round, winner.name, w_score, loser.name, l_score, start];
  return result;
}

function simRoundResults(pairings, round) {
  return pairings.map(p => simResult(p, round));
}

function displayPairing(p, entrants, starts) {
  var f_name = p.first.name;
  var s_name = p.second.name;
  var fs = p.first.starts
  var ss = p.second.starts
  return {first: f_name, fs: fs, second: s_name, ss: ss, repeats: p.repeats}
}

function lookup_seeding(entrants, name) {
  return entrants.seeding.find((e) => e.name == name)
}

function process(res, entrants, round_pairings) {
  var starts = new Starts(res, entrants);
  var all_pairings = runPairings(res, entrants, round_pairings, starts);
  var round = 0;
  for (var pairings of all_pairings) {
    round += 1;
    console.log("Pairings for round", round);
    console.log(pairings)
    var display_pairings = pairings.map(p => displayPairing(p, entrants, starts));
    console.table(display_pairings);
    var sheet_display = formatPairings(pairings, entrants, starts, round);
    console.table(sheet_display);
  }
  return all_pairings;
}

function sim(entrants, round_pairings) {
  console.log("Seeding:");
  console.table(entrants.seeding);
  console.log("Round Pairings:");
  console.table(round_pairings);
  var res = makeResults([]);
  for (var r = 0; r < round_pairings.length; r++) {
    var all_pairings = process(res, entrants, round_pairings);
    var pairings = all_pairings[all_pairings.length - 1];
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
  const p = "RANDNR"
  var round_pairings = [
    [1, p],
    [2, p],
    [3, p],
    [4, p],
    [5, p],
    [6, p],
    [7, p],
    [8, p],
    [9, p],
    [10, p],
    [11, p],
    [12, p],
    [13, p],
    [14, p],
    [15, p],
  ]
  return makeRoundPairings(round_pairings);
}

function make_entrants(){
  var entrants = Array.from({length: 16}, (e, i) => [
    `Player${i + 1}`,
    (1500 + i * 20).toString(),
    "",
    "",
    (i + 1).toString(),
  ]);
  // Fixed tables
  //entrants[3][3] = "8";
  console.table(entrants);
  return entrants;
}

async function main() {
  var es = make_entrants();
  var entrants = makeEntrants(es);
  var round_pairings = roundPairings();
  sim(entrants, round_pairings);
}

main();
