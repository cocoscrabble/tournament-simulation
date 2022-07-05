to run the simulation:

```
  deno run --allow-read main.js
```

to capture the output to a file (easier to scroll through):

```
  deno run --allow-read main.js > filename.txt
```

settings you might want to play with:
- `prob_higher_seed_wins` in main.js
- round pairings in main.js
- weighting formula in the function `pairCandidates(bracket)` in code.js
