// Error: JavaScript closure inside loops – simple practical example
// Solution: https://stackoverflow.com/questions/750486/javascript-closure-inside-loops-simple-practical-example
for (var i = 0; i < 5; i++) {
  setTimeout(function () {
    console.log(i);
  });
}
